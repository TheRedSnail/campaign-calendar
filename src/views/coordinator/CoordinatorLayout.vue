<script setup lang="ts">
import { RouterLink, RouterView, useRoute } from 'vue-router'

const route = useRoute()

const tabs = [
  { to: '/coordinator', label: 'Dashboard', exact: true },
  { to: '/coordinator/triage', label: 'Triage' },
  { to: '/coordinator/portfolio', label: 'Portfolio' },
  { to: '/coordinator/teams', label: 'Teams' },
  { to: '/coordinator/analytics', label: 'Analytics' },
  { to: '/coordinator/tickets', label: 'Tickets' },
]

function isActive(t: { to: string; exact?: boolean }) {
  return t.exact ? route.path === '/coordinator' : route.path.startsWith(t.to)
}
</script>

<template>
  <div class="flex h-screen flex-col bg-[#f7f8fa]">
    <!-- top bar -->
    <header class="flex h-16 shrink-0 items-center gap-4 border-b border-gray-200 bg-white px-6">
      <div class="flex items-center gap-2">
        <div class="size-6 rounded-md bg-blue-600" />
        <span class="text-base font-semibold text-gray-900">Campaign Calendar</span>
      </div>
      <nav class="flex items-center gap-1 pl-3">
        <RouterLink
          to="/"
          class="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-50"
        >
          Calendar
        </RouterLink>
        <span class="rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-600">
          Coordinator
        </span>
      </nav>
      <div class="flex-1" />
      <span class="text-sm font-medium text-gray-500">Wed · 24 Jun 2026</span>
      <div class="flex size-8 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
        JS
      </div>
    </header>

    <!-- sub nav -->
    <div class="flex h-12 shrink-0 items-center gap-1 border-b border-gray-200 bg-white px-6">
      <RouterLink
        v-for="t in tabs"
        :key="t.to"
        :to="t.to"
        class="rounded-lg px-3 py-1.5 text-sm font-medium transition"
        :class="isActive(t) ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'"
      >
        {{ t.label }}
      </RouterLink>
    </div>

    <main class="flex-1 overflow-auto">
      <RouterView />
    </main>
  </div>
</template>
