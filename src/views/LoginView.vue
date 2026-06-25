<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const route = useRoute()
const { login } = useAuth()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function onSubmit() {
  error.value = ''
  loading.value = true
  const { error: err } = await login(email.value.trim(), password.value)
  loading.value = false
  if (err) {
    error.value = err.message || 'Could not sign in'
    return
  }
  const redirect = (route.query.redirect as string) || '/'
  router.replace(redirect)
}

// Demo accounts (prototype only) — click to prefill.
const demos = [
  { label: 'Admin', email: 'admin@demo.henkel' },
  { label: 'Campaign owner', email: 'owner@demo.henkel' },
  { label: 'Coordinator', email: 'coordinator@demo.henkel' },
  { label: 'RUN team', email: 'run@demo.henkel' },
]
function useDemo(e: string) {
  email.value = e
  password.value = 'Demo1234!'
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-50 px-4">
    <div class="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-8 shadow-card">
      <div class="mb-6 flex items-center gap-2.5">
        <img src="/henkel-logo.png" alt="Henkel" class="h-12 w-auto" />
        <div>
          <h1 class="text-base font-semibold tracking-wide text-gray-900">Campaign Calendar</h1>
          <p class="text-xs text-gray-500">Henkel Adhesives</p>
        </div>
      </div>

      <form class="flex flex-col gap-3" @submit.prevent="onSubmit">
        <div>
          <label class="mb-1 block text-[13px] font-medium text-gray-500">Email</label>
          <UInput v-model="email" type="email" placeholder="you@henkel.com" autocomplete="username" class="w-full" required />
        </div>
        <div>
          <label class="mb-1 block text-[13px] font-medium text-gray-500">Password</label>
          <UInput v-model="password" type="password" placeholder="••••••••" autocomplete="current-password" class="w-full" required />
        </div>

        <p v-if="error" class="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{{ error }}</p>

        <UButton type="submit" label="Sign in" color="primary" size="lg" block :loading="loading" class="mt-1" />
      </form>

      <div class="mt-6 border-t border-gray-100 pt-4">
        <p class="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Demo accounts</p>
        <div class="grid grid-cols-2 gap-2">
          <button
            v-for="d in demos"
            :key="d.email"
            type="button"
            class="rounded-md border border-gray-200 px-2.5 py-1.5 text-left text-xs font-medium text-gray-600 transition hover:border-red-300 hover:bg-red-50"
            @click="useDemo(d.email)"
          >
            {{ d.label }}
          </button>
        </div>
        <p class="mt-2 text-[11px] text-gray-400">Password for all demo users: <code>Demo1234!</code></p>
      </div>
    </div>
  </div>
</template>
