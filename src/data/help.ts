// Contextual help content for the briefing and go-live flows.
//
// One entry per `<HelpHint topic="…" />` placed in the UI. Content is data here (not inline in
// components) so it can be edited, reviewed or translated in one place — same convention as
// STATUS_META in options.ts. Keys are namespaced: `brief.*` for the campaign drawer / brief
// modal, `prod.*` for the production (go-live) view.
//
// `href` is optional: entries with a real URL show a "Learn more ↗" link; entries without one
// show no link. The `#` placeholders below are intentional — drop real SOP / Notion URLs in as
// they become available (see CLAUDE.md → the Notion "Campaign Calendar — Henkel Adhesives"
// workspace is the canonical process doc).

export interface HelpEntry {
  /** Short bold heading shown at the top of the popover. */
  title: string
  /** 1–3 plain sentences explaining the field/section. */
  body: string
  /** Optional concrete "e.g. …" line, shown in a tinted info box. */
  example?: string
  /** Optional "Learn more" target; omit to hide the link. */
  href?: string
  /** Optional label for the link (defaults to "Learn more"). */
  hrefLabel?: string
}

export const HELP: Record<string, HelpEntry> = {
  // ───────────────────────────────────────── Briefing — overview & sections ──
  'brief.overview': {
    title: 'Briefing a campaign',
    body: 'A brief is the request you send to the run teams. Fill in the basics, pick which channels and assets you need, then review and send. Everything marked * is required before you can brief.',
    example: 'Briefed campaigns are picked up by the operational teams and turn into production work items you can track.',
    href: '#', // TODO real URL — Notion "How to brief a campaign"
  },
  'brief.basics': {
    title: 'Basics',
    body: 'Who the campaign belongs to and how it is classified. SBU, country, brand and cost center route the work and the budget to the right place.',
  },
  'brief.schedule': {
    title: 'Schedule',
    body: 'The live window of the campaign. The start date drives where it appears on the calendar; the run teams plan production backwards from go-live.',
  },
  'brief.targeting': {
    title: 'Targeting',
    body: 'Where the campaign runs and through which channels. Channels are important — each one becomes a work item for the team that builds it.',
  },
  'brief.goalSection': {
    title: 'Goal / CTA',
    body: 'What success looks like and what you want the audience to do. This frames every asset the run teams build.',
  },
  'brief.ownership': {
    title: 'Ownership',
    body: 'Who owns the campaign and who is kept informed. The owner is the point of contact for the run teams and receives all updates.',
  },

  // ─────────────────────────────────────────────── Briefing — basics fields ──
  'brief.campaignType': {
    title: 'Campaign type',
    body: "The play you're running. It sets expectations for scope and the templates the run teams start from.",
    example: 'Always-on demand gen vs. a time-boxed product launch.',
    href: '#', // TODO real URL — campaign type definitions
  },
  'brief.priority': {
    title: 'Priority',
    body: 'How urgent this campaign is relative to others in the queue. Higher priority is scheduled first when teams are at capacity — use the top levels sparingly.',
  },
  'brief.costCenter': {
    title: 'Cost center',
    body: 'The budget code this campaign is charged against. Use your SBU/country cost center; if unsure, ask your finance lead.',
    example: 'CC-4021',
  },

  // ───────────────────────────────────────────── Briefing — targeting fields ──
  'brief.regions': {
    title: 'Region(s) / countries',
    body: 'The markets this campaign targets. Drives localization needs and which run team (by country, or global) picks up the work.',
  },
  'brief.channels': {
    title: 'Channels',
    body: 'The places the campaign runs. Each channel you pick becomes a separate work item for the operational team that builds it — so pick only what you actually need.',
    example: 'Choosing Email + Web creates an Email work item and a Web work item, each tracked on the go-live timeline.',
    href: '#', // TODO real URL — channels → teams mapping
  },

  // ───────────────────────────────────────────── Briefing — goal / CTA fields ──
  'brief.goal': {
    title: 'Goal',
    body: 'The business outcome you want — ideally measurable. This is the objective, not the action the audience takes.',
    example: 'Generate 200 MQLs from OEM accounts.',
  },
  'brief.cta': {
    title: 'Call to action',
    body: "The single action you want the audience to take. It's the tactical ask, distinct from the goal.",
    example: 'Request a free sample kit.',
  },

  // ───────────────────────────────────────────── Briefing — ownership fields ──
  'brief.ownerEmail': {
    title: 'Owner email',
    body: 'Where the brief confirmation and all production updates are sent. Use a monitored Henkel address.',
    example: 'name@henkel.com',
  },
  'brief.ccWatchers': {
    title: 'CC watchers',
    body: 'People who stay in the loop without owning the campaign. They are copied on the brief and notified alongside the owner. Add an address and press Enter.',
  },

  // ───────────────────────────────────────────── Briefing — assets & briefings ──
  'brief.assets': {
    title: 'Assets & briefings',
    body: 'The deliverables this campaign needs. Tick each one you want, then fill in its short brief — only ticked assets are sent to the run teams.',
  },
  'brief.emailProgram': {
    title: 'Email program',
    body: 'The kind of email automation to build in the marketing platform. Pick the program that matches your goal; the email team sets it up from there.',
    href: '#', // TODO real URL — email program guide
  },
  'brief.trackingPixels': {
    title: 'Tracking pixels',
    body: 'Snippets that measure conversions or build audiences for ad platforms. Add one per vendor; the run team implements them on the relevant pages.',
  },
  'brief.localization': {
    title: 'Localization',
    body: 'The languages the assets must be translated into. Add a language per market you target so the run teams can plan translation.',
  },

  // ─────────────────────────────────────────────── Brief modal (review step) ──
  'brief.assetsChecklist': {
    title: 'What gets briefed',
    body: 'A check means this asset is included and will be sent to the run teams; a dash means it was left out. Go back to edit if something is missing.',
  },
  'brief.recipients': {
    title: 'Brief will be sent to',
    body: 'The owner receives the brief and owns the response; watchers (CC) are copied for visibility. These come from the Ownership section.',
  },
  'brief.afterSend': {
    title: 'Sending is final',
    body: 'Once briefed, the campaign is locked and handed to the run teams, so it can no longer be edited here. Review carefully, or go back to edit. Later changes go through the coordinator.',
  },

  // ───────────────────────────────────────────────── Production — KPI cards ──
  'prod.progress': {
    title: 'Overall progress',
    body: 'How far the campaign has moved toward go-live, averaged across all its work items. 100% means every item is live.',
  },
  'prod.sla': {
    title: 'SLA adherence',
    body: 'How many work items are keeping to their agreed timeline. On track = comfortably within plan; at risk = close to the deadline; overdue = past it and needs attention.',
    href: '#', // TODO real URL — SLA definitions
  },
  'prod.workItems': {
    title: 'Work items',
    body: 'The individual pieces of work created from the brief — one per channel/asset, each owned by an operational team. One campaign normally has several.',
  },
  'prod.timeToGoLive': {
    title: 'Time to go-live',
    body: 'Working days (weekends excluded) between today and the go-live date. "Overdue" means the go-live date has passed with work still open.',
  },

  // ─────────────────────────────────────── Production — stepper & timeline ──
  'prod.stages': {
    title: 'Campaign progress',
    body: 'The overall stage the campaign has reached: Briefed → Accepted → In progress → Ready for UAT → Live. The campaign advances once all its work items reach that stage.',
    example: 'Ready for UAT means the deliverables are built and waiting for sign-off before going live.',
    href: '#', // TODO real URL — production stages explained
  },
  'prod.timeline': {
    title: 'Production timeline',
    body: 'A Gantt view with one row per work item. The x-axis counts business days from the brief; markers show today, the go-live date, and the UAT (sign-off) point.',
  },
  'prod.legend': {
    title: 'Reading the bars',
    body: 'Blue = work already done, amber = the stage in progress now, grey = still upcoming, and the green arrow marks go-live. A row turns at risk or overdue when its amber stage runs past the planned date.',
    href: '#', // TODO real URL — timeline legend
  },
}
