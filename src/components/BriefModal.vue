<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import StatusBadge from './StatusBadge.vue'
import HelpHint from './HelpHint.vue'
import { useCampaigns } from '../composables/useCampaigns'
import { shortDate } from '../utils/dates'

const router = useRouter()
const { selected, briefOpen, briefCampaign, closeDrawer, drawerOpen } = useCampaigns()

const step = ref<1 | 2>(1)
const loading = ref(false)
watch(briefOpen, (open) => {
  if (open) step.value = 1
})

const recipients = computed(() =>
  selected.value?.recipients.length
    ? selected.value.recipients
    : [{ name: selected.value?.owner || 'Owner', role: 'Owner' }],
)

const assetList = computed(() => {
  const a = selected.value?.assets
  return [
    { label: 'Emails', on: a?.emails.selected },
    { label: 'Landing pages', on: a?.landingPages.selected },
    { label: 'Forms', on: a?.forms.selected },
    { label: 'Tracking pixels', on: a?.trackingPixels.selected },
    { label: 'Localization', on: a?.localization.selected },
  ]
})

const dateRange = computed(() => {
  const c = selected.value
  if (!c?.startDate || !c?.endDate) return '—'
  return `${shortDate(c.startDate)} – ${shortDate(c.endDate)} 2026`
})

async function send() {
  loading.value = true
  await briefCampaign()
  loading.value = false
  step.value = 2
}
function done() {
  briefOpen.value = false
  closeDrawer()
}
function viewOnCalendar() {
  briefOpen.value = false
  closeDrawer()
  router.push({ name: 'calendar' })
}
function handleBack() {
  drawerOpen.value = true
  briefOpen.value = false
}

interface Row {
  k: string
  v: string
}
const basics = computed<Row[]>(() => {
  const c = selected.value
  if (!c) return []
  return [
    { k: 'Brand', v: c.brand },
    { k: 'SBU', v: c.sbu },
    { k: 'Website', v: c.website },
    { k: 'Type', v: c.campaignType },
    { k: 'Priority', v: c.priority },
    { k: 'Language', v: c.language },
    { k: 'Cost center', v: c.costCenter },
  ]
})
</script>

<template>
  <UModal v-model:open="briefOpen" :title="step === 1 ? 'Review campaign brief' : 'Campaign briefed'"
    :ui="{ content: 'max-w-2xl' }">
    <template #content>
      <div v-if="selected" class="p-6">
        <!-- STEP 1 -->
        <template v-if="step === 1">
          <div class="mb-5 flex items-start justify-between">
            <div>
              <h2 class="text-lg font-semibold text-gray-900">Review campaign brief</h2>
              <p class="mt-0.5 text-sm text-gray-500">
                {{ selected.name }} · {{ selected.brand }} · {{ selected.sbu }}
              </p>
            </div>
            <UButton icon="i-lucide-x" color="neutral" variant="ghost" size="sm" @click="briefOpen = false" />
          </div>

          <div class="grid grid-cols-2 gap-x-8 gap-y-5 border-t border-gray-100 pt-5">
            <div>
              <p class="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Basics</p>
              <dl class="space-y-1 text-sm">
                <div v-for="row in basics" :key="row.k" class="flex gap-3">
                  <dt class="w-24 shrink-0 text-gray-400">{{ row.k }}</dt>
                  <dd class="font-medium text-gray-800">{{ row.v || '—' }}</dd>
                </div>
              </dl>
              <p class="mb-2 mt-4 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Schedule</p>
              <div class="flex gap-3 text-sm">
                <span class="w-24 shrink-0 text-gray-400">Dates</span>
                <span class="font-medium text-gray-800">{{ dateRange }}</span>
              </div>
              <p class="mb-2 mt-4 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Targeting</p>
              <div class="space-y-1 text-sm">
                <div class="flex gap-3">
                  <span class="w-24 shrink-0 text-gray-400">Regions</span>
                  <span class="font-medium text-gray-800">{{ selected.regions.join(', ') || '—' }}</span>
                </div>
                <div class="flex gap-3">
                  <span class="w-24 shrink-0 text-gray-400">Channels</span>
                  <span class="font-medium text-gray-800">{{ selected.channels.join(' · ') || '—' }}</span>
                </div>
              </div>
            </div>

            <div>
              <p class="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Goal / CTA</p>
              <div class="space-y-1 text-sm">
                <div class="flex gap-3">
                  <span class="w-16 shrink-0 text-gray-400">Goal</span>
                  <span class="font-medium text-gray-800">{{ selected.goal || '—' }}</span>
                </div>
                <div class="flex gap-3">
                  <span class="w-16 shrink-0 text-gray-400">CTA</span>
                  <span class="font-medium text-gray-800">{{ selected.cta ? `“${selected.cta}”` : '—' }}</span>
                </div>
              </div>
              <p class="mb-2 mt-4 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Ownership</p>
              <div class="space-y-1 text-sm">
                <div class="flex gap-3">
                  <span class="w-16 shrink-0 text-gray-400">Owner</span>
                  <span class="font-medium text-gray-800">{{ selected.owner || '—' }}</span>
                </div>
                <div class="flex gap-3">
                  <span class="w-16 shrink-0 text-gray-400">Email</span>
                  <span class="font-medium text-gray-800">{{ selected.ownerEmail || '—' }}</span>
                </div>
              </div>
              <p class="mb-2 mt-4 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Notes</p>
              <p class="text-sm font-medium text-gray-800">{{ selected.notes || '—' }}</p>
            </div>
          </div>

          <div class="mt-5 border-t border-gray-100 pt-4">
            <p class="mb-2 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Assets &amp; briefings <HelpHint topic="brief.assetsChecklist" /></p>
            <div class="flex flex-wrap gap-x-5 gap-y-2">
              <span v-for="a in assetList" :key="a.label" class="inline-flex items-center gap-1.5 text-sm"
                :class="a.on ? 'text-green-700' : 'text-gray-400'">
                <UIcon :name="a.on ? 'i-lucide-check' : 'i-lucide-minus'" class="size-4" />
                {{ a.label }}
              </span>
            </div>
          </div>

          <div class="mt-5 border-t border-gray-100 pt-4">
            <p class="mb-2 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Brief will be sent to <HelpHint topic="brief.recipients" /></p>
            <div class="flex flex-wrap gap-2">
              <span v-for="r in recipients" :key="r.name"
                class="inline-flex items-center gap-2 rounded-full bg-gray-50 py-1 pl-1 pr-3 text-sm">
                <span
                  class="flex size-6 items-center justify-center rounded-full bg-blue-100 text-[11px] font-semibold text-blue-700">
                  {{ r.name.charAt(0) }}
                </span>
                <span class="font-medium text-gray-800">{{ r.name }}</span>
                <span v-if="r.role" class="text-gray-400">· {{ r.role }}</span>
              </span>
              <span v-for="w in selected.watchers" :key="w"
                class="inline-flex items-center gap-2 rounded-full bg-gray-50 py-1 pl-1 pr-3 text-sm">
                <span
                  class="flex size-6 items-center justify-center rounded-full bg-gray-200 text-[11px] font-semibold text-gray-600">
                  <UIcon name="i-lucide-eye" class="size-3" />
                </span>
                <span class="font-medium text-gray-800">{{ w }}</span>
                <span class="text-gray-400">· CC</span>
              </span>
            </div>
          </div>

          <div class="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
            <p class="flex items-center gap-1 text-sm text-gray-400">You cannot edit after briefing. <HelpHint topic="brief.afterSend" /></p>
            <div class="flex gap-2">
              <UButton label="Back to edit" color="neutral" variant="outline" :disabled="loading" @click="handleBack" />
              <UButton label="Send brief" icon="i-lucide-arrow-right" trailing color="primary" :loading @click="send" />
            </div>
          </div>
        </template>

        <!-- STEP 2 -->
        <template v-else>
          <div class="flex flex-col items-center px-6 py-4 text-center">
            <div class="flex size-16 items-center justify-center rounded-full bg-green-100">
              <UIcon name="i-lucide-check" class="size-8 text-green-600" />
            </div>
            <h2 class="mt-5 text-2xl font-semibold text-gray-900">Campaign briefed</h2>
            <p class="mt-2 max-w-sm text-sm text-gray-500">
              “{{ selected.name }}” was sent to {{ recipients.length }} recipients and added to the
              briefing queue.
            </p>

            <div class="mt-6 w-full rounded-xl bg-gray-50 p-4 text-left">
              <div class="flex items-center justify-between border-b border-gray-200/70 py-2">
                <span class="text-sm text-gray-500">Calendar status</span>
                <StatusBadge status="briefed" variant="dot" />
              </div>
              <div class="flex items-center justify-between border-b border-gray-200/70 py-2">
                <span class="text-sm text-gray-500">Brief ID</span>
                <span class="text-sm font-semibold text-gray-800">{{ selected.briefId }}</span>
              </div>
              <div class="flex items-center justify-between py-2">
                <span class="text-sm text-gray-500">Sent</span>
                <span class="text-sm font-semibold text-gray-800">{{ selected.briefedAt }}</span>
              </div>
            </div>

            <div class="mt-6 flex w-full gap-3">
              <UButton label="View on calendar" color="neutral" variant="outline" block @click="viewOnCalendar" />
              <UButton label="Done" color="primary" block @click="done" />
            </div>
          </div>
        </template>
      </div>
    </template>
  </UModal>
</template>
