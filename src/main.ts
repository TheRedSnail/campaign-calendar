import './assets/css/main.css'

import { addCollection } from '@iconify/vue'
import lucideIcons from '@iconify-json/lucide/icons.json'
// Register Lucide offline so icons render without the Iconify API — the
// production CSP blocks external fetches (see netlify.toml / DESIGN.md).
// Covers both our `i-lucide-*` icons and Nuxt UI's internal defaults.
addCollection(lucideIcons)

import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import ui from '@nuxt/ui/vue-plugin'
import App from './App.vue'
import CalendarView from './views/CalendarView.vue'
import ProductionView from './views/ProductionView.vue'
import ConfigView from './views/ConfigView.vue'
import LoginView from './views/LoginView.vue'
import AdminView from './views/AdminView.vue'
import CoordinatorLayout from './views/coordinator/CoordinatorLayout.vue'
import CoordDashboard from './views/coordinator/CoordDashboard.vue'
import CoordTriage from './views/coordinator/CoordTriage.vue'
import CoordPortfolio from './views/coordinator/CoordPortfolio.vue'
import CoordTeams from './views/coordinator/CoordTeams.vue'
import CoordAnalytics from './views/coordinator/CoordAnalytics.vue'
import CoordTickets from './views/coordinator/CoordTickets.vue'
import CoordCockpit from './views/coordinator/CoordCockpit.vue'
import { initAuth, useAuth } from './composables/useAuth'
import type { AppRole } from './types/database'

const COORD_ROLES: AppRole[] = ['campaign_coordinator', 'run_team', 'admin']

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', name: 'login', component: LoginView, meta: { public: true } },
    { path: '/', name: 'calendar', component: CalendarView },
    { path: '/campaign/:id/production', name: 'production', component: ProductionView },
    { path: '/config', name: 'config', component: ConfigView, meta: { roles: ['admin'] satisfies AppRole[] } },
    { path: '/admin', name: 'admin', component: AdminView, meta: { roles: ['admin'] satisfies AppRole[] } },
    {
      path: '/coordinator',
      component: CoordinatorLayout,
      meta: { roles: COORD_ROLES },
      children: [
        { path: '', name: 'coord-dashboard', component: CoordDashboard },
        { path: 'triage', name: 'coord-triage', component: CoordTriage },
        { path: 'portfolio', name: 'coord-portfolio', component: CoordPortfolio },
        { path: 'teams', name: 'coord-teams', component: CoordTeams },
        { path: 'analytics', name: 'coord-analytics', component: CoordAnalytics },
        { path: 'tickets', name: 'coord-tickets', component: CoordTickets },
        { path: 'campaign/:id', name: 'coord-cockpit', component: CoordCockpit },
      ],
    },
  ],
})

// Await the initial session lookup before resolving the first navigation so a hard reload
// of a deep route doesn't race auth (which would render an empty, RLS-scoped-to-nothing page).
router.beforeEach(async (to) => {
  await initAuth()
  const { session, profile } = useAuth()

  if (to.meta.public) {
    return session.value ? { path: '/' } : true
  }
  if (!session.value) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  const roles = to.meta.roles as AppRole[] | undefined
  if (roles && !(profile.value && roles.includes(profile.value.role))) {
    return { path: '/' } // authenticated but not permitted → calendar
  }
  return true
})

const app = createApp(App)
app.use(router)
app.use(ui)
app.mount('#app')
