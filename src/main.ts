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
import CoordinatorLayout from './views/coordinator/CoordinatorLayout.vue'
import CoordDashboard from './views/coordinator/CoordDashboard.vue'
import CoordTriage from './views/coordinator/CoordTriage.vue'
import CoordPortfolio from './views/coordinator/CoordPortfolio.vue'
import CoordTeams from './views/coordinator/CoordTeams.vue'
import CoordAnalytics from './views/coordinator/CoordAnalytics.vue'
import CoordTickets from './views/coordinator/CoordTickets.vue'
import CoordCockpit from './views/coordinator/CoordCockpit.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'calendar', component: CalendarView },
    { path: '/campaign/:id/production', name: 'production', component: ProductionView },
    { path: '/config', name: 'config', component: ConfigView },
    {
      path: '/coordinator',
      component: CoordinatorLayout,
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

const app = createApp(App)
app.use(router)
app.use(ui)
app.mount('#app')
