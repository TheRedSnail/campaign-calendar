<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCampaigns } from '../composables/useCampaigns'
import { useAuth } from '../composables/useAuth'
import { ROLE_LABELS } from '../data/options'
import { addMonths, monthLabel } from '../utils/dates'

const router = useRouter()
const { currentMonth, viewMode, filters, newCampaign } = useCampaigns()
const { canSeeCoordinator, isAdmin, isOwner, role, displayName, logout } = useAuth()

async function onLogout() {
  await logout()
  router.push('/login')
}

const roleLabel = computed(() => (role.value ? ROLE_LABELS[role.value] : ''))
const canCreate = computed(() => isOwner.value || isAdmin.value)

const periodLabel = computed(() =>
  viewMode.value === 'timeline' ? 'Jun – Jul 2026' : monthLabel(currentMonth.value),
)

function prev() {
  currentMonth.value = addMonths(currentMonth.value, -1)
}
function next() {
  currentMonth.value = addMonths(currentMonth.value, 1)
}
function today() {
  currentMonth.value = '2026-06-01'
}
</script>

<template>
  <header class="flex items-center justify-between gap-4 border-b border-gray-200 bg-white px-6 py-3">
    <div class="flex items-center gap-4">
      <div class="flex items-center gap-2.5">
        <img src="/henkel-logo.png" alt="Henkel" class="h-12 w-auto" />
        <h1 class="text-base font-semibold tracking-wide text-gray-900">Adhesives — Campaigns</h1>
      </div>
      <div class="flex items-center gap-1 text-gray-700">
        <UButton
          icon="i-lucide-chevron-left"
          color="neutral"
          variant="ghost"
          size="sm"
          aria-label="Previous month"
          @click="prev"
        />
        <span class="min-w-28 text-center text-sm font-medium">{{ periodLabel }}</span>
        <UButton
          icon="i-lucide-chevron-right"
          color="neutral"
          variant="ghost"
          size="sm"
          aria-label="Next month"
          @click="next"
        />
      </div>
      <UButton label="Today" color="neutral" variant="outline" size="sm" @click="today" />
    </div>

    <div class="flex items-center gap-3">
      <UInput
        v-model="filters.search"
        icon="i-lucide-search"
        placeholder="Search campaigns"
        size="sm"
        class="w-56"
      />

      <div class="flex rounded-lg border border-gray-200 bg-gray-50 p-0.5 text-sm font-medium">
        <button
          type="button"
          class="rounded-md px-3 py-1 transition"
          :class="viewMode === 'month' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'"
          @click="viewMode = 'month'"
        >
          Month
        </button>
        <button
          type="button"
          class="rounded-md px-3 py-1 transition"
          :class="viewMode === 'timeline' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'"
          @click="viewMode = 'timeline'"
        >
          Timeline
        </button>
      </div>

      <UButton
        v-if="canSeeCoordinator"
        to="/coordinator"
        icon="i-lucide-layout-dashboard"
        label="Coordinator"
        color="neutral"
        variant="outline"
        size="sm"
      />

      <UButton
        v-if="isAdmin"
        to="/admin"
        icon="i-lucide-users"
        label="Users"
        color="neutral"
        variant="outline"
        size="sm"
      />

      <UButton
        v-if="isAdmin"
        to="/config"
        icon="i-lucide-settings"
        label="Settings"
        color="neutral"
        variant="outline"
        size="sm"
      />

      <UButton v-if="canCreate" icon="i-lucide-plus" label="New campaign" color="primary" size="sm" @click="newCampaign" />

      <!-- User chip -->
      <div class="flex items-center gap-2 border-l border-gray-200 pl-3">
        <div class="text-right leading-tight">
          <p class="text-sm font-medium text-gray-900">{{ displayName }}</p>
          <p class="text-[11px] text-gray-400">{{ roleLabel }}</p>
        </div>
        <UButton icon="i-lucide-log-out" color="neutral" variant="ghost" size="sm" aria-label="Sign out" @click="onLogout" />
      </div>
    </div>
  </header>
</template>
