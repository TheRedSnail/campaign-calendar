// Guided "tutorial" tours — short, view-anchored coachmark walkthroughs that sit on top of the
// per-field help hints (see help.ts). Each step points at an element carrying a matching
// `data-tutorial-id="…"` attribute; the TutorialOverlay spotlights it and shows the copy below.
//
// Tours auto-start (once) on their route for users who haven't dismissed them, and can always be
// relaunched from the graduation-cap button in the header. A step whose target isn't on screen
// (e.g. the "New campaign" button for a role that can't create) is skipped automatically.

export interface TutorialStep {
  /** Matches `data-tutorial-id` on the target element. */
  target: string
  title: string
  body: string
}

export interface Tour {
  id: string
  /** vue-router route name this tour belongs to (drives auto-start + manual relaunch). */
  routeName: string
  /** Label for the header relaunch button / future menus. */
  label: string
  steps: TutorialStep[]
}

const calendarTour: Tour = {
  id: 'calendar',
  routeName: 'calendar',
  label: 'Calendar tour',
  steps: [
    {
      target: 'filters',
      title: 'Filter the calendar',
      body: 'Narrow the calendar by SBU, brand, region, owner, channel or status. Combine filters to focus on just the campaigns you care about.',
    },
    {
      target: 'new-campaign',
      title: 'Start a new campaign',
      body: 'Create a campaign here. You fill in a short brief — basics, schedule, channels and assets — then send it to the run teams.',
    },
    {
      target: 'campaign-bar',
      title: 'Open a campaign',
      body: 'Each bar is a campaign, coloured by status. Click one to open its details, edit the brief, or jump to its go-live progress.',
    },
    {
      target: 'view-toggle',
      title: 'Switch the view',
      body: 'Toggle between the Month grid and a Timeline (Gantt) view of the same campaigns — whichever helps you plan.',
    },
  ],
}

const goLiveTour: Tour = {
  id: 'golive',
  routeName: 'production',
  label: 'Go-live tour',
  steps: [
    {
      target: 'prod-kpis',
      title: 'Health at a glance',
      body: 'These cards summarise the campaign: overall progress, how many work items are on track (SLA), the number of work items, and working days left to go-live.',
    },
    {
      target: 'prod-stages',
      title: 'Where it stands',
      body: 'The stepper shows the overall stage: Briefed → Accepted → In progress → Ready for UAT → Live. The campaign advances once all its work items reach each stage.',
    },
    {
      target: 'prod-timeline',
      title: 'Track every work item',
      body: 'One row per work item across the operational teams. Blue is done, amber is in progress, grey is upcoming — with markers for today, go-live and UAT sign-off.',
    },
  ],
}

export const TOURS: Tour[] = [calendarTour, goLiveTour]

export const tourById = (id: string | null): Tour | undefined => TOURS.find((t) => t.id === id)
export const tourForRoute = (routeName: string | null | undefined): Tour | undefined =>
  TOURS.find((t) => t.routeName === routeName)
