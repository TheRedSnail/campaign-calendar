<script setup lang="ts">
import AppHeader from '../components/AppHeader.vue'
import FilterBar from '../components/FilterBar.vue'
import MonthGrid from '../components/MonthGrid.vue'
import TimelineGantt from '../components/TimelineGantt.vue'
import CampaignDrawer from '../components/CampaignDrawer.vue'
import BriefModal from '../components/BriefModal.vue'
import { useCampaigns } from '../composables/useCampaigns'
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { supabase } from '../lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

const { viewMode, campaigns } = useCampaigns()

watch(campaigns, (vals) => console.log(vals))

// Shape of the devops_webhook_events row fields this view reads off a realtime change.
interface WebhookEventRow {
  work_item_id: number
  payload: { resource: { revision: { fields: Record<string, string> } } }
}

let channel: RealtimeChannel | null = null
const changes = ref(null)
onMounted(() => {
  channel = supabase.channel('custom-all-channel')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'devops_webhook_events' },
      (payload) => {
        const row = payload.new as WebhookEventRow
        const idx = campaigns.value.findIndex(c => c.devopsId == row.work_item_id)
        console.log(row)
        const { fields } = row.payload.resource.revision
        const campaign = campaigns.value[idx]
        console.log({ campaign, fields })
        campaigns.value[idx] = {
          ...campaign,
          name: fields['System.Title'],
          devopsState: fields['System.State'],
          sbu: fields['Custom.SBU'],
          brand: fields['Custom.WebsiteorBrand'],
          campaignType: fields['Custom.Campaigntype'],
          costCenter: fields['Custom.CostCenter'],
          language: fields['Custom.Language'],
          ownerEmail: fields['Custom.Primarycontact'],
          startDate: fields['Microsoft.VSTS.Scheduling.StartDate'],
          endDate: fields['Microsoft.VSTS.Scheduling.TargetDate']
        }
      }
    )
    .subscribe()
})

watch(changes, (values) => console.log(values))

onUnmounted(() => {
  if (channel) {
    supabase.removeChannel(channel)
  }
  channel = null
})

</script>

<template>
  <div class="flex h-screen flex-col bg-gray-50">
    <AppHeader />
    <FilterBar />
    <main class="flex flex-1 flex-col overflow-hidden p-4">
      <div class="flex flex-1 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-card">
        <MonthGrid v-if="viewMode === 'month'" />
        <TimelineGantt v-else />
      </div>
    </main>

    <CampaignDrawer />
    <BriefModal />
  </div>
</template>
