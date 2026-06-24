<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import KpiCard from '../components/KpiCard.vue'
import { useCampaigns } from '../composables/useCampaigns'
import type { ElementStage, ElementStatus } from '../types'

const route = useRoute()
const router = useRouter()
const { campaigns } = useCampaigns()

const campaign = computed(() => campaigns.value.find((c) => c.id === route.params.id))
const prod = computed(() => campaign.value?.production)

const STAGE_COLOR: Record<ElementStage, string> = {
  Briefed: 'bg-gray-400',
  Drafting: 'bg-amber-500',
  'In review': 'bg-blue-600',
  Approved: 'bg-green-600',
  Live: 'bg-green-600',
}

const STAGE_PILL: Record<ElementStage, string> = {
  Briefed: 'bg-gray-400 text-white',
  Drafting: 'bg-amber-500 text-white',
  'In review': 'bg-blue-600 text-white',
  Approved: 'bg-green-600 text-white',
  Live: 'border border-green-600 text-green-700',
}

const ELEMENT_STATUS: Record<ElementStatus, { badge: string; bar: string; text: string }> = {
  'On track': { badge: 'bg-green-50 text-green-700', bar: 'bg-blue-600', text: 'text-gray-700' },
  'At risk': { badge: 'bg-amber-50 text-amber-600', bar: 'bg-amber-500', text: 'text-amber-600' },
  Overdue: { badge: 'bg-red-50 text-red-600', bar: 'bg-red-500', text: 'text-red-600' },
}

function back() {
  router.push({ name: 'calendar' })
}
</script>

<template>
  <div class="min-h-screen bg-[#f7f8fa]">
    <div v-if="campaign && prod">
      <!-- Header -->
      <header class="flex items-center justify-between gap-4 border-b border-gray-200 bg-white px-6 py-3">
        <div class="flex items-center gap-3">
          <button
            type="button"
            class="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-700"
            @click="back"
          >
            <UIcon name="i-lucide-chevron-left" class="size-4" />
            Calendar
          </button>
          <span class="h-5 w-px bg-gray-200" />
          <h1 class="text-base font-semibold text-gray-900">{{ campaign.name }}</h1>
          <span class="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
            <span class="size-1.5 rounded-full bg-blue-600" />
            In production
          </span>
        </div>
        <div class="flex items-center gap-2">
          <span class="rounded-md bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
            Briefed <span class="font-semibold text-gray-800">{{ prod.briefedDate }}</span>
          </span>
          <span class="rounded-md bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
            Go-live <span class="font-semibold text-gray-800">{{ prod.goLiveDate }}</span>
          </span>
          <UButton label="View brief" color="neutral" variant="outline" size="sm" @click="back" />
        </div>
      </header>

      <div class="mx-auto flex max-w-[1280px] flex-col gap-4 p-6">
        <!-- KPI cards -->
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="Overall progress" :value="`${prod.overallProgress}%`" :progress="prod.overallProgress" />
          <KpiCard
            label="Avg throughput / element"
            :value="prod.avgThroughput"
            :caption="prod.avgThroughputCaption"
            caption-class="text-green-600"
          />
          <KpiCard label="SLA adherence" :value="prod.sla" :caption="prod.slaCaption" />
          <KpiCard label="Time to go-live" :value="prod.timeToGoLive" :caption="prod.timeToGoLiveCaption" />
        </div>

        <!-- Production flow -->
        <div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p class="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Production flow — avg time in stage
          </p>
          <div class="flex items-start">
            <template v-for="(stage, i) in prod.stages" :key="stage.label">
              <div class="flex flex-col items-center gap-1.5">
                <span
                  class="rounded-full px-3 py-1.5 text-sm font-medium"
                  :class="STAGE_PILL[stage.label]"
                >
                  {{ stage.label }}
                </span>
                <span class="text-xs text-gray-400">{{ stage.caption }}</span>
              </div>
              <div v-if="i < prod.stages.length - 1" class="flex flex-1 items-center justify-center px-2 pt-2">
                <span class="border-t border-dashed border-gray-200 flex-1" />
                <span class="px-2 text-xs font-medium text-blue-600 whitespace-nowrap">Ø {{ stage.avgAfter }}</span>
                <span class="border-t border-dashed border-gray-200 flex-1" />
              </div>
            </template>
          </div>
        </div>

        <!-- Element status table -->
        <div class="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div class="flex items-center justify-between px-5 py-4">
            <h2 class="text-base font-semibold text-gray-900">Element status</h2>
            <div class="flex items-center gap-4 text-xs">
              <span class="inline-flex items-center gap-1.5 text-gray-500"><span class="size-2 rounded-full bg-green-600" />5 on track</span>
              <span class="inline-flex items-center gap-1.5 text-gray-500"><span class="size-2 rounded-full bg-amber-500" />1 at risk</span>
              <span class="inline-flex items-center gap-1.5 text-gray-500"><span class="size-2 rounded-full bg-red-500" />1 overdue</span>
            </div>
          </div>

          <table class="w-full text-sm">
            <thead>
              <tr class="border-y border-gray-100 text-left text-[11px] font-medium uppercase tracking-wide text-gray-400">
                <th class="px-5 py-2 font-medium">Element</th>
                <th class="px-3 py-2 font-medium">Channel</th>
                <th class="px-3 py-2 font-medium">Owner</th>
                <th class="px-3 py-2 font-medium">Stage</th>
                <th class="px-3 py-2 font-medium">Status</th>
                <th class="px-3 py-2 font-medium">Days in stage</th>
                <th class="px-3 py-2 font-medium">Due</th>
                <th class="px-3 py-2 pr-5 font-medium">Progress</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="el in prod.elements" :key="el.id" class="border-b border-gray-50 last:border-0">
                <td class="px-5 py-3">
                  <div class="font-medium text-gray-900">{{ el.name }}</div>
                  <div class="text-xs text-gray-400">{{ el.id }}</div>
                </td>
                <td class="px-3 py-3 text-gray-500">{{ el.channel }}</td>
                <td class="px-3 py-3 text-gray-700">{{ el.owner }}</td>
                <td class="px-3 py-3">
                  <span class="inline-flex items-center gap-1.5 font-medium text-gray-700">
                    <span class="size-2 rounded-full" :class="STAGE_COLOR[el.stage]" />
                    {{ el.stage }}
                  </span>
                </td>
                <td class="px-3 py-3">
                  <span class="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium" :class="ELEMENT_STATUS[el.status].badge">
                    <span class="size-1.5 rounded-full" :class="ELEMENT_STATUS[el.status].bar" />
                    {{ el.status }}
                  </span>
                </td>
                <td class="px-3 py-3 font-medium" :class="ELEMENT_STATUS[el.status].text">{{ el.daysInStage.toFixed(1) }} d</td>
                <td class="px-3 py-3 text-gray-700">{{ el.due }}</td>
                <td class="px-3 py-3 pr-5">
                  <div class="flex items-center gap-2">
                    <div class="h-1.5 w-28 overflow-hidden rounded-full bg-gray-100">
                      <div class="h-full rounded-full" :class="ELEMENT_STATUS[el.status].bar" :style="{ width: `${el.progress}%` }" />
                    </div>
                    <span class="w-9 text-right text-xs font-medium text-gray-600">{{ el.progress }}%</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-else class="flex min-h-screen flex-col items-center justify-center gap-3 text-center">
      <p class="text-gray-500">No production data for this campaign.</p>
      <UButton label="Back to calendar" color="primary" @click="back" />
    </div>
  </div>
</template>
