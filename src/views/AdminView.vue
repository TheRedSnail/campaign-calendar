<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAdmin } from '../composables/useAdmin'
import { useAuth, type Profile } from '../composables/useAuth'
import { ROLE_LABELS, SBU_OPTIONS, COUNTRY_OPTIONS } from '../data/options'
import type { AppRole } from '../types/database'
import TagMultiSelect from '../components/TagMultiSelect.vue'

const router = useRouter()
const { listUsers, createUser, updateUser, resetPassword, deleteUser } = useAdmin()
const { logout, displayName } = useAuth()

async function onLogout() {
  await logout()
  router.push('/login')
}

const users = ref<Profile[]>([])
const loading = ref(true)

async function refresh() {
  loading.value = true
  users.value = await listUsers()
  loading.value = false
}
onMounted(refresh)

const roleItems = (Object.keys(ROLE_LABELS) as AppRole[]).map((value) => ({
  value,
  label: ROLE_LABELS[value],
}))

// ---- create / edit form -------------------------------------------------

const open = ref(false)
const editingId = ref<string | null>(null)
const saving = ref(false)
const formError = ref('')
const form = reactive({
  email: '',
  password: '',
  full_name: '',
  role: 'campaign_owner' as AppRole,
  sbus: [] as string[],
  countries: [] as string[],
  is_global: false,
})

function openCreate() {
  editingId.value = null
  formError.value = ''
  Object.assign(form, {
    email: '', password: '', full_name: '', role: 'campaign_owner',
    sbus: [], countries: [], is_global: false,
  })
  open.value = true
}

function openEdit(u: Profile) {
  editingId.value = u.id
  formError.value = ''
  Object.assign(form, {
    email: u.email, password: '', full_name: u.full_name, role: u.role,
    sbus: [...u.sbus], countries: [...u.countries], is_global: u.is_global,
  })
  open.value = true
}

async function save() {
  saving.value = true
  formError.value = ''
  let res
  if (editingId.value) {
    res = await updateUser(editingId.value, {
      full_name: form.full_name, role: form.role,
      sbus: form.sbus, countries: form.countries, is_global: form.is_global,
    })
    if (!res.error && form.password) {
      res = await resetPassword(editingId.value, form.password)
    }
  } else {
    res = await createUser({
      email: form.email, password: form.password, full_name: form.full_name,
      role: form.role, sbus: form.sbus, countries: form.countries, is_global: form.is_global,
    })
  }
  saving.value = false
  if (res?.error) {
    formError.value = res.error
    return
  }
  open.value = false
  await refresh()
}

async function remove(u: Profile) {
  if (!confirm(`Delete ${u.email}? This cannot be undone.`)) return
  const res = await deleteUser(u.id)
  if (res.error) {
    alert(res.error)
    return
  }
  await refresh()
}

function scopeLabel(u: Profile): string {
  if (u.role === 'admin') return 'Everything'
  if (u.role === 'run_team') return u.is_global ? 'All countries' : (u.countries.join(', ') || '—')
  return u.sbus.join(', ') || '—'
}
</script>

<template>
  <div class="flex min-h-screen flex-col bg-gray-50">
    <header class="flex h-16 shrink-0 items-center gap-4 border-b border-gray-200 bg-white px-6">
      <div class="flex items-center gap-2">
        <img src="/henkel-logo.png" alt="Henkel" class="h-12 w-auto" />
        <span class="text-base font-semibold tracking-wide text-gray-900">User management</span>
      </div>
      <nav class="flex items-center gap-1 pl-3">
        <RouterLink to="/" class="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-50">Calendar</RouterLink>
        <span class="rounded-lg bg-red-50 px-3 py-1.5 text-sm font-semibold text-red-600">Admin</span>
      </nav>
      <div class="flex-1" />
      <span class="text-sm font-medium text-gray-500">{{ displayName }}</span>
      <UButton icon="i-lucide-log-out" color="neutral" variant="ghost" size="sm" aria-label="Sign out" @click="onLogout" />
    </header>

    <main class="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
      <div class="mb-5 flex items-center justify-between">
        <div>
          <h1 class="text-xl font-semibold text-gray-900">Users</h1>
          <p class="text-sm text-gray-500">Create accounts, set roles &amp; scope, and reset passwords.</p>
        </div>
        <UButton icon="i-lucide-plus" label="New user" color="primary" @click="openCreate" />
      </div>

      <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-card">
        <table class="w-full text-sm">
          <thead class="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
            <tr>
              <th class="px-4 py-3">Name</th>
              <th class="px-4 py-3">Email</th>
              <th class="px-4 py-3">Role</th>
              <th class="px-4 py-3">Scope</th>
              <th class="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-if="loading"><td colspan="5" class="px-4 py-6 text-center text-gray-400">Loading…</td></tr>
            <tr v-for="u in users" :key="u.id" class="hover:bg-gray-50">
              <td class="px-4 py-3 font-medium text-gray-900">{{ u.full_name || '—' }}</td>
              <td class="px-4 py-3 text-gray-600">{{ u.email }}</td>
              <td class="px-4 py-3">
                <span class="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">{{ ROLE_LABELS[u.role] }}</span>
              </td>
              <td class="px-4 py-3 text-gray-600">{{ scopeLabel(u) }}</td>
              <td class="px-4 py-3">
                <div class="flex items-center justify-end gap-1">
                  <UButton icon="i-lucide-pencil" color="neutral" variant="ghost" size="xs" aria-label="Edit" @click="openEdit(u)" />
                  <UButton icon="i-lucide-trash-2" color="neutral" variant="ghost" size="xs" aria-label="Delete" @click="remove(u)" />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>

    <!-- Create / edit slideover -->
    <USlideover v-model:open="open" :title="editingId ? 'Edit user' : 'New user'" :ui="{ content: 'w-[440px] max-w-[92vw]' }">
      <template #body>
        <div class="flex flex-col gap-4">
          <div>
            <label class="mb-1 block text-[13px] font-medium text-gray-500">Full name</label>
            <UInput v-model="form.full_name" placeholder="Jane Doe" class="w-full" />
          </div>
          <div>
            <label class="mb-1 block text-[13px] font-medium text-gray-500">Email</label>
            <UInput v-model="form.email" type="email" placeholder="jane@henkel.com" class="w-full" :disabled="!!editingId" />
          </div>
          <div>
            <label class="mb-1 block text-[13px] font-medium text-gray-500">Role</label>
            <USelect v-model="form.role" :items="roleItems" class="w-full" />
          </div>

          <div v-if="form.role === 'campaign_owner' || form.role === 'campaign_coordinator'">
            <label class="mb-1 block text-[13px] font-medium text-gray-500">
              {{ form.role === 'campaign_owner' ? 'SBU (assign one)' : 'SBUs (one or more)' }}
            </label>
            <TagMultiSelect v-model="form.sbus" :options="SBU_OPTIONS" placeholder="Add SBU" />
          </div>

          <div v-if="form.role === 'campaign_owner'">
            <label class="mb-1 block text-[13px] font-medium text-gray-500">Country (assign one)</label>
            <TagMultiSelect v-model="form.countries" :options="COUNTRY_OPTIONS" placeholder="Add country" />
          </div>

          <template v-if="form.role === 'run_team'">
            <label class="flex items-center gap-2 text-sm text-gray-700">
              <UCheckbox v-model="form.is_global" /> Global — sees every country
            </label>
            <div v-if="!form.is_global">
              <label class="mb-1 block text-[13px] font-medium text-gray-500">Countries (one or more)</label>
              <TagMultiSelect v-model="form.countries" :options="COUNTRY_OPTIONS" placeholder="Add countries" />
            </div>
          </template>

          <div>
            <label class="mb-1 block text-[13px] font-medium text-gray-500">
              {{ editingId ? 'Set new password (optional)' : 'Password' }}
            </label>
            <UInput v-model="form.password" type="text" :placeholder="editingId ? 'Leave blank to keep current' : 'Initial password'" class="w-full" />
          </div>

          <p v-if="formError" class="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{{ formError }}</p>
        </div>
      </template>
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton label="Cancel" color="neutral" variant="ghost" @click="open = false" />
          <UButton :label="editingId ? 'Save changes' : 'Create user'" color="primary" :loading="saving" @click="save" />
        </div>
      </template>
    </USlideover>
  </div>
</template>
