<script setup lang="ts">
import { useRoute } from 'vue-router'

// Sub-navigation shared by the three admin screens (Users / Dropdown values / Regions).
const route = useRoute()
const tabs = [
  { to: '/admin', label: 'Users' },
  { to: '/admin/options', label: 'Dropdown values' },
  { to: '/admin/regions', label: 'Regions & countries' },
]
</script>

<template>
  <nav class="flex items-center gap-1 pl-3">
    <RouterLink to="/" class="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-50">
      Calendar
    </RouterLink>
    <RouterLink
      v-for="t in tabs"
      :key="t.to"
      :to="t.to"
      class="rounded-lg px-3 py-1.5 text-sm font-medium"
      :class="route.path === t.to ? 'bg-red-50 font-semibold text-red-600' : 'text-gray-500 hover:bg-gray-50'"
    >
      {{ t.label }}
    </RouterLink>
  </nav>
</template>
