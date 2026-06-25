<script setup lang="ts">
import AppHeader from '../components/AppHeader.vue'
import FilterBar from '../components/FilterBar.vue'
import MonthGrid from '../components/MonthGrid.vue'
import TimelineGantt from '../components/TimelineGantt.vue'
import CampaignDrawer from '../components/CampaignDrawer.vue'
import BriefModal from '../components/BriefModal.vue'
import { useCampaigns } from '../composables/useCampaigns'

const { viewMode } = useCampaigns()
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
