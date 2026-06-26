import { computed, reactive, toRefs } from "vue";
import type { Campaign, CampaignStatus } from "../types";
import { emptyAssets } from "../data/campaigns";
import { computeSections } from "./useCompletion";
import { supabase } from "../lib/supabase";
import { campaignToAzure, campaignToRow, rowToCampaign } from "../data/mappers";
import { useAuth } from "./useAuth";
import { createAzureTicket } from "../utils/azure/create";

export type ViewMode = "month" | "timeline";

export interface Filters {
  sbu: string[];
  brand: string[];
  region: string[];
  owner: string[];
  channel: string[];
  status: CampaignStatus[];
  search: string;
}

interface CampaignState {
  campaigns: Campaign[];
  filters: Filters;
  currentMonth: string; // yyyy-mm-01
  viewMode: ViewMode;
  selectedId: string | null;
  drawerOpen: boolean;
  briefOpen: boolean;
  nextBriefSeq: number;
}

const state = reactive<CampaignState>({
  campaigns: [], // hydrated from Supabase after auth (see loadCampaigns)
  filters: {
    sbu: [],
    brand: [],
    region: [],
    owner: [],
    channel: [],
    status: [],
    search: "",
  },
  currentMonth: "2026-06-01",
  viewMode: "month",
  selectedId: null,
  drawerOpen: false,
  briefOpen: false,
  nextBriefSeq: 2041,
});

// ---- data loading (RLS scopes the rows server-side) ----------------------

/** Replace the local set from Supabase. The query only returns rows the user may see. */
async function loadCampaigns() {
  const { data, error } = await supabase.from("campaigns").select("*");
  if (error) {
    console.error("loadCampaigns", error);
    return;
  }
  state.campaigns = (data ?? []).map(rowToCampaign);
}

/** Clear local state on logout so the next user never sees cached rows. */
function reset() {
  state.campaigns = [];
  state.selectedId = null;
  state.drawerOpen = false;
  state.briefOpen = false;
}

const selected = computed<Campaign | null>(
  () => state.campaigns.find((c) => c.id === state.selectedId) ?? null,
);

const hasFilters = computed(() => {
  const f = state.filters;
  return (
    f.sbu.length ||
    f.brand.length ||
    f.region.length ||
    f.owner.length ||
    f.channel.length ||
    f.status.length ||
    f.search.trim().length
  );
});

const filtered = computed<Campaign[]>(() => {
  const f = state.filters;
  const q = f.search.trim().toLowerCase();
  return state.campaigns.filter((c) => {
    if (f.sbu.length && !f.sbu.includes(c.sbu)) return false;
    if (f.brand.length && !f.brand.includes(c.brand)) return false;
    if (f.owner.length && !f.owner.includes(c.owner)) return false;
    if (f.status.length && !f.status.includes(c.status)) return false;
    if (f.region.length && !c.regions.some((r) => f.region.includes(r)))
      return false;
    if (f.channel.length && !c.channels.some((ch) => f.channel.includes(ch)))
      return false;
    if (q && !c.name.toLowerCase().includes(q)) return false;
    return true;
  });
});

function openDrawer(id: string) {
  state.selectedId = id;
  state.drawerOpen = true;
}

function closeDrawer() {
  state.drawerOpen = false;
}

/** Create a campaign in Supabase, prefilling SBU + country from the owner's profile. */
async function newCampaign() {
  const { profile, isOwner } = useAuth();
  const p = profile.value;
  const draft: Campaign = {
    id: "",
    name: "",
    brand: "Next Henkel Adhesives",
    sbu: isOwner.value ? (p?.sbus[0] ?? "") : "",
    country: isOwner.value ? (p?.countries[0] ?? "") : "",
    status: "draft",
    progress: 0,
    startDate: "",
    endDate: "",
    campaignType: "",
    priority: "",
    language: "",
    costCenter: "",
    website: "",
    regions: [],
    channels: [],
    goal: "",
    cta: "",
    owner: isOwner.value ? (p?.full_name ?? "") : "",
    ownerEmail: isOwner.value ? (p?.email ?? "") : "",
    watchers: [],
    notes: "",
    assets: emptyAssets(),
    recipients: [],
  };
  const { data, error } = await supabase.from('campaigns').insert(campaignToRow(draft)).select().single()
  if (error || !data) {
    console.error('newCampaign', error)
    return
  }
  state.campaigns.push(rowToCampaign(data));
  openDrawer(data.id);
}

/** Recompute the derived calendar status from filled fields (draft → ready). */
function recomputeStatus(c: Campaign) {
  if (c.status === "briefed" || c.status === "in_production") return;
  const sections = computeSections(c);
  const done = sections.reduce((s, x) => s + x.done, 0);
  const total = sections.reduce((s, x) => s + x.total, 0);
  if (done === total) c.status = "ready";
  else if (done > Math.floor(total / 3)) c.status = "in_progress";
  else c.status = "draft";
  c.progress = Math.round((done / total) * 100);
}

// Debounced persist of the open campaign — fires off every drawer edit.
let persistTimer: ReturnType<typeof setTimeout> | undefined;
function persistSelected() {
  const c = selected.value;
  if (!c || !c.id) return;
  clearTimeout(persistTimer);
  const snapshot = { ...c };
  persistTimer = setTimeout(async () => {
    const { error } = await supabase
      .from("campaigns")
      .update(campaignToRow(snapshot))
      .eq("id", snapshot.id);
    if (error) console.error("persistSelected", error);
  }, 600);
}

function touchSelected() {
  if (selected.value) {
    recomputeStatus(selected.value);
    persistSelected();
  }
}

function openBrief() {
  state.briefOpen = true;
  closeDrawer()
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
function nowLabel(): string {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()} · ${hh}:${mm}`;
}

async function briefCampaign() {
  const toast = useToast()
  const c = selected.value;
  if (!c) return;

  const { data: azure_data, error: azure_error } = await createAzureTicket(campaignToAzure(c))
  if (azure_data) {
    toast.add({
      title: "New Ticket created",
      description: `ticket ID: CMPG-${String(azure_data.id).trim()}`,
      color: "success",
    })
  }
  const prev = {
    status: c.status,
    progress: c.progress,
    briefId: c.briefId,
    briefedAt: c.briefedAt,
  };
  c.status = "briefed";
  c.progress = 100;
  c.briefId = `ADH-${state.nextBriefSeq++}`;
  c.briefedAt = nowLabel();
  c.devopsId = azure_data.id;

  const { error } = await supabase
    .from("campaigns")
    .update({
      status: c.status,
      progress: c.progress,
      brief_id: c.briefId,
      briefed_at: c.briefedAt,
      devops_id: c.devopsId
    })
    .eq("id", c.id);

  if (error || azure_error) {
    Object.assign(c, prev); // rollback
    state.nextBriefSeq--;
    console.error("briefCampaign", error);
  }
}

export function useCampaigns() {
  return {
    ...toRefs(state),
    selected,
    filtered,
    hasFilters,
    loadCampaigns,
    reset,
    openDrawer,
    closeDrawer,
    newCampaign,
    openBrief,
    briefCampaign,
    touchSelected,
  };
}
