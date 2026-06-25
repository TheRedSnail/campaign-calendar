<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'
import { ROLE_LABELS } from '../../data/options'

const route = useRoute()
const router = useRouter()
const { displayName, role, logout } = useAuth()

const roleLabel = computed(() => (role.value ? ROLE_LABELS[role.value] : ''))
const initials = computed(() =>
  displayName.value
    .split(/[\s@.]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join(''),
)

async function onLogout() {
  await logout()
  router.push('/login')
}

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
  <div class="flex h-screen flex-col bg-gray-50">
    <!-- top bar -->
    <header class="flex h-16 shrink-0 items-center gap-4 border-b border-gray-200 bg-white px-6">
      <div class="flex items-center gap-2">
        <span class="flex size-7 items-center justify-center rounded-md bg-red-600 text-sm font-bold text-white">H</span>
        <span class="text-base font-semibold tracking-wide text-gray-900">Campaign Calendar</span>
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
      <div class="flex items-center gap-2 border-l border-gray-200 pl-3">
        <div class="text-right leading-tight">
          <p class="text-sm font-medium text-gray-900">{{ displayName }}</p>
          <p class="text-[11px] text-gray-400">{{ roleLabel }}</p>
        </div>
        <div class="flex size-8 items-center justify-center rounded-full bg-red-600 text-xs font-semibold text-white">
          {{ initials }}
        </div>
        <UButton icon="i-lucide-log-out" color="neutral" variant="ghost" size="sm" aria-label="Sign out" @click="onLogout" />
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
