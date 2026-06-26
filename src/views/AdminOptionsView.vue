<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import SettingsShell from '../components/SettingsShell.vue'
import { useOptions, OPTION_KINDS, type OptionKind } from '../composables/useOptions'
import { useOptionsAdmin } from '../composables/useOptionsAdmin'

const { optionRows } = useOptions()
const { addOption, updateOption, setOptionActive } = useOptionsAdmin()

const kind = ref<OptionKind>('sbu')
const kindLabel = computed(() => OPTION_KINDS.find((k) => k.kind === kind.value)?.label ?? '')
const rows = computed(() => optionRows(kind.value))

// ---- add / edit slideover ----
const open = ref(false)
const editingValue = ref<string | null>(null) // the original value when editing; null = create
const saving = ref(false)
const formError = ref('')
const form = reactive({ value: '', active: true, sort_order: 0 })

function openCreate() {
  editingValue.value = null
  formError.value = ''
  Object.assign(form, { value: '', active: true, sort_order: rows.value.length })
  open.value = true
}
function openEdit(row: { value: string; active: boolean; sort_order: number }) {
  editingValue.value = row.value
  formError.value = ''
  Object.assign(form, { value: row.value, active: row.active, sort_order: row.sort_order })
  open.value = true
}

async function save() {
  const value = form.value.trim()
  if (!value) {
    formError.value = 'Value is required.'
    return
  }
  saving.value = true
  const res = editingValue.value
    ? await updateOption(kind.value, editingValue.value, {
        value,
        sort_order: form.sort_order,
        active: form.active,
      })
    : await addOption(kind.value, value, form.sort_order)
  saving.value = false
  if (res.error) {
    formError.value = res.error
    return
  }
  open.value = false
}

async function toggleActive(row: { value: string; active: boolean }) {
  await setOptionActive(kind.value, row.value, !row.active)
}
</script>

<template>
  <SettingsShell>
    <div class="mb-5">
      <h1 class="text-xl font-semibold text-gray-900">Dropdown values</h1>
      <p class="text-sm text-gray-500">
        Add or rename the values offered in the campaign brief. Inactive values stay valid on
        existing campaigns but disappear from new briefs. To permanently delete a value, remove it
        in the database (so historical campaigns can be handled deliberately).
      </p>
    </div>

    <!-- List picker -->
    <div class="mb-5 flex flex-wrap gap-1.5">
      <button
        v-for="k in OPTION_KINDS"
        :key="k.kind"
        type="button"
        class="rounded-lg px-3 py-1.5 text-sm font-medium"
        :class="kind === k.kind ? 'bg-red-600 text-white' : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50'"
        @click="kind = k.kind"
      >
        {{ k.label }}
      </button>
    </div>

    <div class="mb-3 flex items-center justify-between">
      <h2 class="text-sm font-semibold text-gray-700">{{ kindLabel }} values</h2>
      <UButton icon="i-lucide-plus" :label="`Add ${kindLabel.toLowerCase()}`" color="primary" size="sm" @click="openCreate" />
    </div>

    <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-card">
      <table class="w-full text-sm">
        <thead class="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
          <tr>
            <th class="px-4 py-3">Value</th>
            <th class="px-4 py-3">Status</th>
            <th class="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-if="!rows.length"><td colspan="3" class="px-4 py-6 text-center text-gray-400">No values yet.</td></tr>
          <tr v-for="row in rows" :key="row.value" class="hover:bg-gray-50" :class="{ 'opacity-50': !row.active }">
            <td class="px-4 py-3 font-medium text-gray-900">{{ row.value }}</td>
            <td class="px-4 py-3">
              <span
                class="rounded-md px-2 py-0.5 text-xs font-medium"
                :class="row.active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'"
              >{{ row.active ? 'Active' : 'Inactive' }}</span>
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center justify-end gap-1">
                <UButton
                  :icon="row.active ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                  color="neutral" variant="ghost" size="xs"
                  :aria-label="row.active ? 'Deactivate' : 'Activate'"
                  @click="toggleActive(row)"
                />
                <UButton icon="i-lucide-pencil" color="neutral" variant="ghost" size="xs" aria-label="Edit" @click="openEdit(row)" />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <USlideover v-model:open="open" :title="editingValue ? `Edit ${kindLabel.toLowerCase()}` : `New ${kindLabel.toLowerCase()}`" :ui="{ content: 'w-[400px] max-w-[92vw]' }">
      <template #body>
        <div class="flex flex-col gap-4">
          <div>
            <label class="mb-1 block text-[13px] font-medium text-gray-500">Value</label>
            <UInput v-model="form.value" :placeholder="`e.g. ${rows[0]?.value ?? 'New value'}`" class="w-full" />
            <p v-if="editingValue" class="mt-1 text-xs text-gray-400">
              Renaming changes new briefs only — campaigns already using “{{ editingValue }}” keep that value.
            </p>
          </div>
          <div>
            <label class="mb-1 block text-[13px] font-medium text-gray-500">Sort order</label>
            <UInput v-model.number="form.sort_order" type="number" class="w-full" />
          </div>
          <label class="flex items-center gap-2 text-sm text-gray-700">
            <UCheckbox v-model="form.active" /> Active (shown in new-brief dropdowns)
          </label>
          <p v-if="formError" class="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{{ formError }}</p>
        </div>
      </template>
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton label="Cancel" color="neutral" variant="ghost" @click="open = false" />
          <UButton :label="editingValue ? 'Save changes' : 'Add value'" color="primary" :loading="saving" @click="save" />
        </div>
      </template>
    </USlideover>
  </SettingsShell>
</template>
