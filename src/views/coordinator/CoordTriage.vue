<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Campaign } from '../../types'
import { useCoordinator } from '../../composables/useCoordinator'
import { computeSections } from '../../composables/useCompletion'
import { teamsForChannels, TEAM_DELIVERABLE, TEAM_SLUG, fmtDate } from '../../data/coordinator'
import StatusBadge from '../../components/StatusBadge.vue'

const { triage, acceptBrief, requestChanges } = useCoordinator()

const pickedId = ref<string | null>(null)
const selected = computed(() => {
  const list = triage.value
  return list.find((c) => c.id === pickedId.value) ?? list[0] ?? null
})

const sections = computed(() => (selected.value ? computeSections(selected.value) : []))
const done = computed(() => sections.value.reduce((a, s) => a + s.done, 0))
const total = computed(() => sections.value.reduce((a, s) => a + s.total, 0))

const teams = computed(() => (selected.value ? teamsForChannels(selected.value.channels) : []))

function completeness(c: Campaign) {
  const s = computeSections(c)
  return {
    done: s.reduce((a, x) => a + x.done, 0),
    total: s.reduce((a, x) => a + x.total, 0),
  }
}

function accept() {
  if (selected.value) acceptBrief(selected.value.id)
}
function sendBack() {
  if (selected.value) requestChanges(selected.value.id)
}
</script>

<template>
  <div class="mx-auto max-w-[1440px] space-y-5 p-6">
    <div>
      <h1 class="text-2xl font-semibold text-gray-900">Brief intake</h1>
      <p class="mt-1 text-sm text-gray-500">
        Accepting a brief creates one Azure DevOps work item per operational team, derived from its channels.
      </p>
    </div>

    <div class="grid grid-cols-1 gap-5 lg:grid-cols-5">
      <!-- queue -->
      <div class="space-y-3 lg:col-span-2">
        <p class="text-xs font-semibold uppercase tracking-wide text-gray-400">Incoming queue · {{ triage.length }}</p>
        <button
          v-for="c in triage"
          :key="c.id"
          type="button"
          class="block w-full rounded-xl border bg-white p-4 text-left shadow-sm transition"
          :class="selected && selected.id === c.id ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-200 hover:border-gray-300'"
          @click="pickedId = c.id"
        >
          <div class="flex items-center justify-between gap-2">
            <span class="font-semibold text-gray-900">{{ c.name }}</span>
            <span class="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">{{ c.priority }}</span>
          </div>
          <p class="mt-1 text-xs text-gray-500">{{ c.brand }} · {{ c.sbu }} · {{ c.owner || '—' }}</p>
          <div class="mt-2 flex items-center gap-2">
            <span class="h-1.5 w-32 overflow-hidden rounded-full bg-gray-100">
              <span
                class="block h-full rounded-full"
                :class="completeness(c).done === completeness(c).total ? 'bg-green-600' : 'bg-amber-500'"
                :style="{ width: `${(completeness(c).done / completeness(c).total) * 100}%` }"
              />
            </span>
            <span class="text-xs font-semibold text-gray-600">{{ completeness(c).done }}/{{ completeness(c).total }}</span>
          </div>
          <p class="mt-2 text-xs text-gray-500">{{ c.channels.join(' · ') || 'no channels' }} · go-live {{ fmtDate(c.endDate) }}</p>
        </button>

        <p v-if="!triage.length" class="rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-400">
          No briefs waiting. Brief a campaign on the calendar to see it here.
        </p>
      </div>

      <!-- detail -->
      <div v-if="selected" class="space-y-4 lg:col-span-3">
        <div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div class="flex items-start justify-between gap-3">
            <div>
              <h2 class="text-lg font-semibold text-gray-900">{{ selected.name }}</h2>
              <p class="mt-1 text-sm text-gray-500">
                {{ selected.brand }} · {{ selected.sbu }} · Owner: {{ selected.owner || '—' }} · {{ selected.briefId }}
              </p>
            </div>
            <StatusBadge status="briefed" :label="`${done}/${total} complete`" />
          </div>
        </div>

        <div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 class="mb-3 text-base font-semibold text-gray-900">Brief summary</h3>
          <dl class="grid grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <dt class="text-xs font-semibold uppercase tracking-wide text-gray-400">Goal</dt>
              <dd class="mt-0.5 text-sm text-gray-900">{{ selected.goal || '—' }}</dd>
            </div>
            <div>
              <dt class="text-xs font-semibold uppercase tracking-wide text-gray-400">Call to action</dt>
              <dd class="mt-0.5 text-sm text-gray-900">{{ selected.cta || '—' }}</dd>
            </div>
            <div>
              <dt class="text-xs font-semibold uppercase tracking-wide text-gray-400">Regions</dt>
              <dd class="mt-0.5 text-sm text-gray-900">{{ selected.regions.join(', ') || '—' }}</dd>
            </div>
            <div>
              <dt class="text-xs font-semibold uppercase tracking-wide text-gray-400">Channels</dt>
              <dd class="mt-0.5 text-sm text-gray-900">{{ selected.channels.join(', ') || '—' }}</dd>
            </div>
            <div>
              <dt class="text-xs font-semibold uppercase tracking-wide text-gray-400">Schedule</dt>
              <dd class="mt-0.5 text-sm text-gray-900">{{ fmtDate(selected.startDate) }} → {{ fmtDate(selected.endDate) }}</dd>
            </div>
            <div>
              <dt class="text-xs font-semibold uppercase tracking-wide text-gray-400">Coordinator</dt>
              <dd class="mt-0.5 text-sm text-gray-900">{{ selected.coordinator }}</dd>
            </div>
          </dl>
          <div class="mt-4 flex flex-wrap gap-2 border-t border-gray-100 pt-4">
            <span
              v-for="s in sections"
              :key="s.key"
              class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
              :class="s.complete ? 'bg-green-50 text-gray-900' : 'bg-gray-100 text-gray-500'"
            >
              <span :class="s.complete ? 'text-green-600' : 'text-gray-400'">{{ s.complete ? '✓' : '○' }}</span>
              {{ s.label }}
            </span>
          </div>
        </div>

        <!-- accept / tickets -->
        <div class="rounded-xl border border-blue-500 bg-blue-50 p-5">
          <h3 class="text-base font-semibold text-gray-900">
            On accept — {{ teams.length }} Azure DevOps work item{{ teams.length === 1 ? '' : 's' }} will be created
          </h3>
          <p class="mt-1 text-xs text-gray-500">One per operational team, derived from the brief’s channels. Each starts at “Briefed”.</p>

          <div class="mt-3 divide-y divide-gray-100 overflow-hidden rounded-lg border border-gray-200 bg-white">
            <div v-for="team in teams" :key="team" class="flex items-center gap-3 px-4 py-3">
              <span class="rounded-md bg-gray-50 px-2 py-1 text-xs font-semibold text-blue-600">
                {{ selected.briefId }}-{{ TEAM_SLUG[team] }}
              </span>
              <div class="min-w-0 flex-1">
                <p class="text-sm font-semibold text-gray-900">{{ team }} team</p>
                <p class="truncate text-xs text-gray-500">{{ TEAM_DELIVERABLE[team] }}</p>
              </div>
            </div>
          </div>

          <div class="mt-4 flex items-center gap-3">
            <button
              type="button"
              class="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              @click="accept"
            >
              Accept brief &amp; create {{ teams.length }} ticket{{ teams.length === 1 ? '' : 's' }}
            </button>
            <button
              type="button"
              class="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              @click="sendBack"
            >
              Request changes
            </button>
          </div>
        </div>
      </div>

      <div v-else class="lg:col-span-3">
        <div class="rounded-xl border border-dashed border-gray-300 p-10 text-center text-sm text-gray-400">
          Select a brief to review.
        </div>
      </div>
    </div>
  </div>
</template>
