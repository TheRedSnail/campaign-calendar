<script setup lang="ts">
import { computed } from 'vue'
import FilterChip from './FilterChip.vue'
import StatusBadge from './StatusBadge.vue'
import { useCampaigns } from '../composables/useCampaigns'
import { useAuth } from '../composables/useAuth'
import {
  SBU_OPTIONS,
  BRAND_OPTIONS,
  REGION_OPTIONS,
  OWNER_OPTIONS,
  CHANNEL_OPTIONS,
  LEGEND_STATUSES,
  STATUS_META,
} from '../data/options'
import type { CampaignStatus } from '../types'

const { filters, viewMode, campaigns } = useCampaigns()
const { profile } = useAuth()
const statusLabel = (s: CampaignStatus) => STATUS_META[s].label

/** Order a set of values by the canonical list, appending any strays. */
function order(values: string[], canonical: readonly string[]) {
  const set = new Set(values.filter(Boolean))
  const ordered = canonical.filter((v) => set.has(v))
  const extras = [...set].filter((v) => !canonical.includes(v)).sort()
  return [...ordered, ...extras]
}

/**
 * SBU / Brand / Region filter options come from the user's account scope (profile.sbus /
 * brands / regions). When a dimension isn't scoped on the account, fall back to the values
 * present in their already-RLS-scoped visible campaigns — so a user never sees options they
 * can't reach, and admins (no scope) see everything that exists in the data.
 */
function scoped(accountScope: string[] | undefined, present: string[], canonical: readonly string[]) {
  return order(accountScope?.length ? accountScope : present, canonical)
}

const sbuOptions = computed(() =>
  scoped(profile.value?.sbus, campaigns.value.map((c) => c.sbu), SBU_OPTIONS),
)
const brandOptions = computed(() =>
  scoped(profile.value?.brands, campaigns.value.map((c) => c.brand), BRAND_OPTIONS),
)
const regionOptions = computed(() =>
  scoped(profile.value?.regions, campaigns.value.flatMap((c) => c.regions), REGION_OPTIONS),
)
const ownerOptions = computed(() => order(campaigns.value.map((c) => c.owner), OWNER_OPTIONS))
const channelOptions = computed(() => order(campaigns.value.flatMap((c) => c.channels), CHANNEL_OPTIONS))
</script>

<template>
  <div class="flex flex-wrap items-center gap-2 border-b border-gray-200 bg-white px-6 py-2.5">
    <span
      v-if="viewMode === 'timeline'"
      class="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700"
    >
      Group by: Brand
      <UIcon name="i-lucide-chevron-down" class="size-3.5 opacity-60" />
    </span>

    <FilterChip v-model="filters.sbu" label="SBU" :options="sbuOptions" />
    <FilterChip v-model="filters.brand" label="Brand" :options="brandOptions" />
    <FilterChip v-model="filters.region" label="Region" :options="regionOptions" />
    <FilterChip v-model="filters.owner" label="Owner" :options="ownerOptions" />
    <FilterChip v-model="filters.channel" label="Channel" :options="channelOptions" />
    <FilterChip v-model="filters.status" label="Status" :options="LEGEND_STATUSES" :format="statusLabel" />

    <div class="ml-auto flex items-center gap-4">
      <StatusBadge
        v-for="s in LEGEND_STATUSES"
        :key="s"
        :status="s"
        variant="dot"
      />
    </div>
  </div>
</template>
