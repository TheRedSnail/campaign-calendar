import './assets/css/main.css'

import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import ui from '@nuxt/ui/vue-plugin'
import App from './App.vue'
import CalendarView from './views/CalendarView.vue'
import ProductionView from './views/ProductionView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'calendar', component: CalendarView },
    { path: '/campaign/:id/production', name: 'production', component: ProductionView },
  ],
})

const app = createApp(App)
app.use(router)
app.use(ui)
app.mount('#app')
