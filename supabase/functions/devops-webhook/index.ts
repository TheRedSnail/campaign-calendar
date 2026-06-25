import { createClient } from "jsr:@supabase/supabase-js@2";

// Inbound endpoint for the Azure DevOps service hook (workitem.created / workitem.updated).
// Their CMPG work item maps to our campaign; child work items map to our devops_tickets.
// Public function (no Supabase JWT) — authenticated by a shared secret. Writes via the
// service-role key so it can update past RLS.

// Prototype default; override by setting the DEVOPS_WEBHOOK_SECRET function secret.
const DEFAULT_SECRET = "henkel-devops-webhook-2026";
const SECRET = Deno.env.get("DEVOPS_WEBHOOK_SECRET") ?? DEFAULT_SECRET;

// Work item types that represent a whole campaign (vs. a per-team ticket).
const CAMPAIGN_WORKITEM_TYPES = ["CMPG", "Feature", "Epic"];

// Azure DevOps System.State -> our TicketStage. Devs confirm their exact state names.
const STATE_TO_STAGE: Record<string, string> = {
  "new": "Briefed", "to do": "Briefed", "proposed": "Briefed", "open": "Briefed",
  "approved": "Accepted", "accepted": "Accepted", "ready": "Accepted",
  "active": "In progress", "doing": "In progress", "committed": "In progress", "in progress": "In progress",
  "resolved": "Ready for UAT", "in review": "Ready for UAT", "testing": "Ready for UAT", "uat": "Ready for UAT",
  "done": "Live", "closed": "Live", "completed": "Live",
};

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function fmtDate(iso?: string): string | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return undefined;
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
}

function mapStage(state?: string): string | undefined {
  if (!state) return undefined;
  return STATE_TO_STAGE[state.trim().toLowerCase()];
}

// "Marek Jankovic <marek.jankovic@henkel.com>" -> "Marek Jankovic"
function cleanName(v?: string): string | undefined {
  if (!v) return undefined;
  return v.split("<")[0].trim() || undefined;
}

function authed(req: Request, url: URL): boolean {
  if (url.searchParams.get("token") === SECRET) return true;
  const h = req.headers.get("Authorization") ?? "";
  if (h.startsWith("Basic ")) {
    try {
      const decoded = atob(h.slice(6)); // "user:pass"
      const pass = decoded.slice(decoded.indexOf(":") + 1);
      if (pass === SECRET || decoded === SECRET) return true;
    } catch { /* ignore */ }
  }
  if (h === `Bearer ${SECRET}`) return true;
  if (req.headers.get("X-Webhook-Secret") === SECRET) return true;
  return false;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const url = new URL(req.url);
  if (!authed(req, url)) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });

  let body: any;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const resource = body?.resource ?? {};
  const revFields = resource?.revision?.fields ?? {};
  const changed = resource?.fields ?? {};
  const workItemId: number | null = resource.workItemId ?? resource.id ?? null;
  const workItemType: string | undefined = revFields["System.WorkItemType"];
  const state: string | undefined = revFields["System.State"] ?? changed?.["System.State"]?.newValue;
  const title: string | undefined = revFields["System.Title"];
  const assignee = cleanName(revFields["System.AssignedTo"] ?? revFields["System.ChangedBy"]);
  const dueDate = fmtDate(revFields["Microsoft.VSTS.Scheduling.TargetDate"]);
  const wiUrl: string | undefined = resource?._links?.html?.href ?? resource?.url;
  const now = new Date().toISOString();

  let matched = false;
  let target = "none";
  let note: string | undefined;

  try {
    if (workItemId == null) {
      note = "no workItemId";
    } else if (workItemType && CAMPAIGN_WORKITEM_TYPES.includes(workItemType)) {
      // Campaign-level: match by devops_id, else by title (first contact), then store the id.
      let { data: camp } = await admin.from("campaigns").select("id").eq("devops_id", workItemId).maybeSingle();
      if (!camp && title) {
        ({ data: camp } = await admin.from("campaigns").select("id").ilike("name", title).maybeSingle());
      }
      if (camp) {
        await admin.from("campaigns").update({
          devops_id: workItemId, devops_state: state ?? null, devops_url: wiUrl ?? null, synced_at: now,
        }).eq("id", camp.id);
        matched = true; target = "campaign";
      } else {
        note = "no matching campaign (by devops_id or title)";
      }
    } else {
      // Ticket-level: match by devops_id (set at creation / backfill).
      const { data: tk } = await admin.from("devops_tickets").select("id").eq("devops_id", workItemId).maybeSingle();
      if (tk) {
        const stage = mapStage(state);
        const patch: Record<string, unknown> = { devops_state: state ?? null, devops_url: wiUrl ?? null, synced_at: now };
        if (stage) { patch.stage = stage; if (stage === "Live") patch.sla = "On track"; }
        if (assignee) patch.assignee = assignee;
        if (dueDate) patch.due_date = dueDate;
        await admin.from("devops_tickets").update(patch).eq("id", tk.id);
        matched = true; target = "ticket";
      } else {
        note = "no matching ticket (set devops_id to link)";
      }
    }
  } catch (e) {
    note = `error: ${String(e)}`;
  }

  // Record the event keyed by work item id — one row per work item, upserted to its latest
  // state (the DevOps team asked for work_item_id as the primary key). Skip if there is no id.
  if (workItemId != null) {
    await admin.from("devops_webhook_events").upsert({
      work_item_id: workItemId,
      event_type: body?.eventType ?? null,
      work_item_type: workItemType ?? null,
      new_state: state ?? null,
      target,
      matched,
      payload: body,
      received_at: new Date().toISOString(),
    }, { onConflict: "work_item_id" });
  }

  return new Response(JSON.stringify({ ok: true, matched, target, note }), {
    status: 200, headers: { "Content-Type": "application/json" },
  });
});
