<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import AdminShell from '../components/AdminShell.vue'
import { useOptions } from '../composables/useOptions'
import { useOptionsAdmin } from '../composables/useOptionsAdmin'

const { state } = useOptions()
const { addRegion, updateRegion, addCountry, updateCountry } = useOptionsAdmin()

const UNASSIGNED = '__unassigned__'

const allRegions = computed(() =>
  state.regions.slice().sort((a, b) => a.sort_order - b.sort_order),
)
const allCountries = computed(() =>
  state.countries.slice().sort((a, b) => a.name.localeCompare(b.name)),
)

/** Region select items for the country form (plus an explicit "unassigned" choice). */
const regionItems = computed(() => [
  { label: '— Unassigned —', value: UNASSIGNED },
  ...allRegions.value.map((r) => ({ label: r.name, value: r.id })),
])

/** Countries grouped under each region, with a trailing "Unassigned" bucket. */
const grouped = computed(() => {
  const groups = allRegions.value.map((r) => ({
    id: r.id,
    name: r.name,
    active: r.active,
    countries: allCountries.value.filter((c) => c.region_id === r.id),
  }))
  const orphans = allCountries.value.filter((c) => !c.region_id)
  if (orphans.length) groups.push({ id: UNASSIGNED, name: 'Unassigned', active: true, countries: orphans })
  return groups
})

// ---- region slideover ----
const regionOpen = ref(false)
const regionEditId = ref<string | null>(null)
const regionSaving = ref(false)
const regionError = ref('')
const regionForm = reactive({ name: '', sort_order: 0, active: true })

function openRegionCreate() {
  regionEditId.value = null
  regionError.value = ''
  Object.assign(regionForm, { name: '', sort_order: allRegions.value.length, active: true })
  regionOpen.value = true
}
function openRegionEdit(r: { id: string; name: string; sort_order: number; active: boolean }) {
  regionEditId.value = r.id
  regionError.value = ''
  Object.assign(regionForm, { name: r.name, sort_order: r.sort_order, active: r.active })
  regionOpen.value = true
}
async function saveRegion() {
  const name = regionForm.name.trim()
  if (!name) { regionError.value = 'Name is required.'; return }
  regionSaving.value = true
  const res = regionEditId.value
    ? await updateRegion(regionEditId.value, { name, sort_order: regionForm.sort_order, active: regionForm.active })
    : await addRegion(name, regionForm.sort_order)
  regionSaving.value = false
  if (res.error) { regionError.value = res.error; return }
  regionOpen.value = false
}

// ---- country slideover ----
const countryOpen = ref(false)
const countryEditId = ref<string | null>(null)
const countrySaving = ref(false)
const countryError = ref('')
const countryForm = reactive({ name: '', region_id: UNASSIGNED, active: true })

function openCountryCreate(regionId?: string) {
  countryEditId.value = null
  countryError.value = ''
  Object.assign(countryForm, { name: '', region_id: regionId ?? UNASSIGNED, active: true })
  countryOpen.value = true
}
function openCountryEdit(c: { id: string; name: string; region_id: string | null; active: boolean }) {
  countryEditId.value = c.id
  countryError.value = ''
  Object.assign(countryForm, { name: c.name, region_id: c.region_id ?? UNASSIGNED, active: c.active })
  countryOpen.value = true
}
async function saveCountry() {
  const name = countryForm.name.trim()
  if (!name) { countryError.value = 'Name is required.'; return }
  const regionId = countryForm.region_id === UNASSIGNED ? null : countryForm.region_id
  countrySaving.value = true
  const res = countryEditId.value
    ? await updateCountry(countryEditId.value, { name, region_id: regionId, active: countryForm.active })
    : await addCountry(name, regionId, allCountries.value.length)
  countrySaving.value = false
  if (res.error) { countryError.value = res.error; return }
  countryOpen.value = false
}
</script>

<template>
  <AdminShell title="Admin settings">
    <div class="mb-5 flex items-start justify-between gap-4">
      <div>
        <h1 class="text-xl font-semibold text-gray-900">Regions &amp; countries</h1>
        <p class="text-sm text-gray-500">
          Group countries into regions. Assigning a user a region grants them visibility of every
          country in it; <span class="font-medium text-gray-700">Global</span> automatically sees all.
        </p>
      </div>
      <div class="flex shrink-0 gap-2">
        <UButton icon="i-lucide-plus" label="Region" color="neutral" variant="soft" size="sm" @click="openRegionCreate" />
        <UButton icon="i-lucide-plus" label="Country" color="primary" size="sm" @click="openCountryCreate()" />
      </div>
    </div>

    <p class="mb-4 inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700">
      <UIcon name="i-lucide-globe" class="size-4" />
      “Global” is automatic — a user scoped to Global (or a RUN-team member marked global) sees every country.
    </p>

    <div class="flex flex-col gap-5">
      <section
        v-for="g in grouped"
        :key="g.id"
        class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-card"
        :class="{ 'opacity-60': !g.active }"
      >
        <header class="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-4 py-2.5">
          <div class="flex items-center gap-2">
            <h2 class="text-sm font-semibold text-gray-900">{{ g.name }}</h2>
            <span class="text-xs text-gray-400">{{ g.countries.length }} countries</span>
            <span v-if="!g.active" class="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">Inactive</span>
          </div>
          <div class="flex items-center gap-1">
            <UButton icon="i-lucide-plus" color="neutral" variant="ghost" size="xs" label="Country"
              @click="openCountryCreate(g.id === UNASSIGNED ? undefined : g.id)" />
            <UButton v-if="g.id !== UNASSIGNED" icon="i-lucide-pencil" color="neutral" variant="ghost" size="xs"
              aria-label="Edit region" @click="openRegionEdit(g as any)" />
          </div>
        </header>
        <ul class="divide-y divide-gray-100">
          <li v-if="!g.countries.length" class="px-4 py-3 text-sm text-gray-400">No countries.</li>
          <li v-for="c in g.countries" :key="c.id" class="flex items-center justify-between px-4 py-2 hover:bg-gray-50"
            :class="{ 'opacity-50': !c.active }">
            <span class="text-sm text-gray-800">
              {{ c.name }}
              <span v-if="!c.active" class="ml-1 text-xs text-gray-400">(inactive)</span>
            </span>
            <UButton icon="i-lucide-pencil" color="neutral" variant="ghost" size="xs" aria-label="Edit country" @click="openCountryEdit(c)" />
          </li>
        </ul>
      </section>
    </div>

    <!-- Region slideover -->
    <USlideover v-model:open="regionOpen" :title="regionEditId ? 'Edit region' : 'New region'" :ui="{ content: 'w-[400px] max-w-[92vw]' }">
      <template #body>
        <div class="flex flex-col gap-4">
          <div>
            <label class="mb-1 block text-[13px] font-medium text-gray-500">Region name</label>
            <UInput v-model="regionForm.name" placeholder="e.g. Regional – Western Europe" class="w-full" />
          </div>
          <div>
            <label class="mb-1 block text-[13px] font-medium text-gray-500">Sort order</label>
            <UInput v-model.number="regionForm.sort_order" type="number" class="w-full" />
          </div>
          <label class="flex items-center gap-2 text-sm text-gray-700">
            <UCheckbox v-model="regionForm.active" /> Active
          </label>
          <p v-if="regionError" class="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{{ regionError }}</p>
        </div>
      </template>
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton label="Cancel" color="neutral" variant="ghost" @click="regionOpen = false" />
          <UButton :label="regionEditId ? 'Save changes' : 'Add region'" color="primary" :loading="regionSaving" @click="saveRegion" />
        </div>
      </template>
    </USlideover>

    <!-- Country slideover -->
    <USlideover v-model:open="countryOpen" :title="countryEditId ? 'Edit country' : 'New country'" :ui="{ content: 'w-[400px] max-w-[92vw]' }">
      <template #body>
        <div class="flex flex-col gap-4">
          <div>
            <label class="mb-1 block text-[13px] font-medium text-gray-500">Country name</label>
            <UInput v-model="countryForm.name" placeholder="e.g. Germany" class="w-full" />
          </div>
          <div>
            <label class="mb-1 block text-[13px] font-medium text-gray-500">Region</label>
            <USelect v-model="countryForm.region_id" :items="regionItems" class="w-full" />
          </div>
          <label class="flex items-center gap-2 text-sm text-gray-700">
            <UCheckbox v-model="countryForm.active" /> Active
          </label>
          <p v-if="countryError" class="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{{ countryError }}</p>
        </div>
      </template>
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton label="Cancel" color="neutral" variant="ghost" @click="countryOpen = false" />
          <UButton :label="countryEditId ? 'Save changes' : 'Add country'" color="primary" :loading="countrySaving" @click="saveCountry" />
        </div>
      </template>
    </USlideover>
  </AdminShell>
</template>
