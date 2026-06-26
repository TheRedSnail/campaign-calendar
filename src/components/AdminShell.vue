<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import AdminTabs from './AdminTabs.vue'

// Page chrome for the admin settings screens: header (logo, tabs, sign-out) + centered main.
defineProps<{ title: string }>()
const router = useRouter()
const { logout, displayName } = useAuth()

async function onLogout() {
  await logout()
  router.push('/login')
}
</script>

<template>
  <div class="flex min-h-screen flex-col bg-gray-50">
    <header class="flex h-16 shrink-0 items-center gap-4 border-b border-gray-200 bg-white px-6">
      <div class="flex items-center gap-2">
        <img src="/henkel-logo.png" alt="Henkel" class="h-12 w-auto" />
        <span class="text-base font-semibold tracking-wide text-gray-900">{{ title }}</span>
      </div>
      <AdminTabs />
      <div class="flex-1" />
      <span class="text-sm font-medium text-gray-500">{{ displayName }}</span>
      <UButton icon="i-lucide-log-out" color="neutral" variant="ghost" size="sm" aria-label="Sign out" @click="onLogout" />
    </header>
    <main class="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
      <slot />
    </main>
  </div>
</template>
