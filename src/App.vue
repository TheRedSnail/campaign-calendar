<script setup lang="ts">
import { watch } from 'vue'
import { useAuth } from './composables/useAuth'
import { useCampaigns } from './composables/useCampaigns'
import { useCoordinator } from './composables/useCoordinator'
import TutorialOverlay from './components/TutorialOverlay.vue'

const { session } = useAuth()
const { loadCampaigns, reset } = useCampaigns()
const { loadTickets, resetTickets } = useCoordinator()

// Hydrate the Supabase-backed stores when a user is present, clear them on logout.
// Keyed on the user id so a token refresh doesn't trigger a needless reload, but a
// different user logging in does.
watch(
  () => session.value?.user.id,
  async (id) => {
    if (id) {
      await Promise.all([loadCampaigns(), loadTickets()])
    } else {
      reset()
      resetTickets()
    }
  },
  { immediate: true },
)
</script>

<template>
  <UApp>
    <RouterView />
    <TutorialOverlay />
  </UApp>
</template>
