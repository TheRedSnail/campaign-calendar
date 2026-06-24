<script setup lang="ts">
import FilterChip from './FilterChip.vue'
import StatusBadge from './StatusBadge.vue'
import { useCampaigns } from '../composables/useCampaigns'
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

const { filters, viewMode } = useCampaigns()
const statusLabel = (s: CampaignStatus) => STATUS_META[s].label
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

    <FilterChip v-model="filters.sbu" label="SBU" :options="SBU_OPTIONS" />
    <FilterChip v-model="filters.brand" label="Brand" :options="BRAND_OPTIONS" />
    <FilterChip v-model="filters.region" label="Region" :options="REGION_OPTIONS" />
    <FilterChip v-model="filters.owner" label="Owner" :options="OWNER_OPTIONS" />
    <FilterChip v-model="filters.channel" label="Channel" :options="CHANNEL_OPTIONS" />
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
