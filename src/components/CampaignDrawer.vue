<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import StatusBadge from './StatusBadge.vue'
import TagMultiSelect from './TagMultiSelect.vue'
import EmailTagInput from './EmailTagInput.vue'
import AssetCard from './AssetCard.vue'
import FileUpload from './FileUpload.vue'
import TrackingPixelsEditor from './TrackingPixelsEditor.vue'
import { useCampaigns } from '../composables/useCampaigns'
import { useCoordinator } from '../composables/useCoordinator'
import { useAuth } from '../composables/useAuth'
import { useCompletion, assetComplete, type SectionStatus } from '../composables/useCompletion'
import {
  SBU_OPTIONS,
  BRAND_OPTIONS,
  TYPE_OPTIONS,
  PRIORITY_OPTIONS,
  LANGUAGE_OPTIONS,
  REGION_OPTIONS,
  COUNTRY_OPTIONS,
  WEBSITE_OPTIONS,
  CHANNEL_OPTIONS,
  OWNER_OPTIONS,
  EMAIL_PROGRAM_OPTIONS,
  STATUS_META,
} from '../data/options'
import type { CampaignStatus } from '../types'

const router = useRouter()
const { selected, drawerOpen, closeDrawer, openBrief, touchSelected } = useCampaigns()
// Owners are locked to their own SBU + country (preselected on create).
const { isOwner } = useAuth()
const { ticketsFor } = useCoordinator()
const { sections, done, total, canBrief, percent } = useCompletion(selected)

/** Side fly-in vs. expanded full-width window (toggle in the header). */
const expanded = ref(false)
// When expanded, sections flow in two masonry columns to use the extra width.
const colsWrap = computed(() =>
  expanded.value
    ? 'columns-2 gap-x-8 [&>section]:mb-7 [&>section]:break-inside-avoid'
    : 'flex flex-col gap-7',
)
const cardsWrap = computed(() =>
  expanded.value
    ? 'columns-2 gap-x-4 [&>*]:mb-3 [&>*]:break-inside-avoid'
    : 'flex flex-col gap-2',
)

/** Production status exists once a brief is accepted and DevOps tickets are created. */
const hasProduction = computed(() => !!selected.value && ticketsFor(selected.value.id).length > 0)

const sectionMap = computed<Record<string, SectionStatus>>(() =>
  Object.fromEntries(sections.value.map((s) => [s.key, s])),
)

// Live status shown in the drawer header, derived from completion.
const headerStatus = computed<{ status: CampaignStatus; label: string }>(() => {
  const c = selected.value
  if (c && (c.status === 'briefed' || c.status === 'in_production')) {
    return { status: c.status, label: STATUS_META[c.status].label }
  }
  if (canBrief.value) return { status: 'ready', label: 'Ready to brief' }
  if (done.value > 0) return { status: 'in_progress', label: 'In progress' }
  return { status: 'draft', label: 'Draft' }
})

const isBriefed = computed(
  () => selected.value?.status === 'briefed' || selected.value?.status === 'in_production',
)

function onChange() {
  touchSelected()
}

function viewProduction() {
  if (!selected.value) return
  const id = selected.value.id
  closeDrawer()
  router.push({ name: 'production', params: { id } })
}

function badgeClass(s?: SectionStatus) {
  if (!s) return 'text-gray-400'
  if (s.complete) return 'text-green-600'
  if (s.done > 0) return 'text-amber-500'
  return 'text-gray-400'
}
function badgeText(s?: SectionStatus) {
  if (!s) return ''
  return s.complete ? 'Complete' : `${s.done} of ${s.total}`
}
const check = 'i-lucide-check'
</script>

<template>
  <USlideover v-model:open="drawerOpen" :title="selected?.name || 'New campaign'"
    :ui="{ content: expanded ? 'w-[min(1040px,96vw)] max-w-[96vw]' : 'w-[480px] max-w-[92vw]' }">
    <template #header>
      <div class="flex w-full items-start justify-between gap-3">
        <div>
          <p class="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Campaign details</p>
          <h2 class="mt-0.5 text-lg font-semibold text-gray-900 dark:text-white">
            {{ selected?.name || 'New campaign' }}
          </h2>
        </div>
        <div class="flex items-center gap-2">
          <StatusBadge :status="headerStatus.status" :label="headerStatus.label" />
          <UButton :icon="expanded ? 'i-lucide-minimize-2' : 'i-lucide-maximize-2'" color="neutral" variant="ghost"
            size="sm" :aria-label="expanded ? 'Collapse to side panel' : 'Expand to full window'"
            @click="expanded = !expanded" />
          <UButton icon="i-lucide-x" color="neutral" variant="ghost" size="sm" @click="closeDrawer" />
        </div>
      </div>
    </template>

    <template #body>
      <div v-if="selected" class="flex flex-col gap-7 pb-4">
        <!-- Synced state from Azure DevOps (read-only writeback) -->
        <a v-if="selected.devopsUrl" :href="selected.devopsUrl" target="_blank" rel="noopener"
          class="-mb-3 inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700 hover:bg-blue-100">
          <UIcon name="i-lucide-git-pull-request-arrow" class="size-4" />
          Synced from Azure DevOps<span v-if="selected.devopsState">: {{ selected.devopsState }}</span>
          <UIcon name="i-lucide-external-link" class="size-3.5" />
        </a>

        <p class="-mb-2 text-xs text-gray-400"><span class="text-red-500">*</span> Required to brief the campaign.</p>

        <!-- Campaign sections (two masonry columns when expanded) -->
        <div :class="colsWrap">
          <!-- Basics -->
          <section class="flex flex-col gap-3">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Basics</h3>
              <span class="text-xs font-medium" :class="badgeClass(sectionMap.basics)">{{ badgeText(sectionMap.basics)
              }}</span>
            </div>
            <div>
              <label class="mb-1 block text-[13px] font-medium text-gray-500">Campaign name <span
                  class="text-red-500">*</span></label>
              <UInput v-model="selected.name" placeholder="Campaign name" class="w-full"
                :trailing-icon="selected.name ? check : undefined" @update:model-value="onChange" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="mb-1 block text-[13px] font-medium text-gray-500">SBU <span
                    class="text-red-500">*</span></label>
                <USelect v-model="selected.sbu" :items="SBU_OPTIONS" placeholder="Select SBU" class="w-full"
                  :disabled="isOwner" @update:model-value="onChange" />
              </div>
              <div>
                <label class="mb-1 block text-[13px] font-medium text-gray-500">Country <span
                    class="text-red-500">*</span></label>
                <USelect v-model="selected.country" :items="COUNTRY_OPTIONS" placeholder="Select country" class="w-full"
                  :disabled="isOwner" @update:model-value="onChange" />
              </div>
              <div>
                <label class="mb-1 block text-[13px] font-medium text-gray-500">Brand <span
                    class="text-red-500">*</span></label>
                <USelect v-model="selected.brand" :items="BRAND_OPTIONS" class="w-full"
                  @update:model-value="onChange" />
              </div>
              <div>
                <label class="mb-1 block text-[13px] font-medium text-gray-500">Website <span
                    class="text-red-500">*</span></label>
                <USelect v-model="selected.website" :items="WEBSITE_OPTIONS" placeholder="Select website" class="w-full"
                  @update:model-value="onChange" />
              </div>
              <div>
                <label class="mb-1 block text-[13px] font-medium text-gray-500">Campaign type <span
                    class="text-red-500">*</span></label>
                <USelect v-model="selected.campaignType" :items="TYPE_OPTIONS" placeholder="Select type" class="w-full"
                  @update:model-value="onChange" />
              </div>
              <div>
                <label class="mb-1 block text-[13px] font-medium text-gray-500">Priority <span
                    class="text-red-500">*</span></label>
                <USelect v-model="selected.priority" :items="PRIORITY_OPTIONS" placeholder="Select priority"
                  class="w-full" @update:model-value="onChange" />
              </div>
              <div>
                <label class="mb-1 block text-[13px] font-medium text-gray-500">Language <span
                    class="text-red-500">*</span></label>
                <USelect v-model="selected.language" :items="LANGUAGE_OPTIONS" placeholder="Select language"
                  class="w-full" @update:model-value="onChange" />
              </div>
              <div>
                <label class="mb-1 block text-[13px] font-medium text-gray-500">Cost center <span
                    class="text-red-500">*</span></label>
                <UInput v-model="selected.costCenter" placeholder="e.g. CC-4021" class="w-full"
                  :trailing-icon="selected.costCenter ? check : undefined" @update:model-value="onChange" />
              </div>
            </div>
          </section>

          <!-- Schedule -->
          <section class="flex flex-col gap-3">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Schedule</h3>
              <span class="text-xs font-medium" :class="badgeClass(sectionMap.schedule)">{{
                badgeText(sectionMap.schedule) }}</span>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="mb-1 block text-[13px] font-medium text-gray-500">Start date <span
                    class="text-red-500">*</span></label>
                <UInput v-model="selected.startDate" type="date" class="w-full" @update:model-value="onChange" />
              </div>
              <div>
                <label class="mb-1 block text-[13px] font-medium text-gray-500">End date <span
                    class="text-red-500">*</span></label>
                <UInput v-model="selected.endDate" type="date" class="w-full" @update:model-value="onChange" />
              </div>
            </div>
          </section>

          <!-- Targeting -->
          <section class="flex flex-col gap-3">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Targeting</h3>
              <span class="text-xs font-medium" :class="badgeClass(sectionMap.targeting)">{{
                badgeText(sectionMap.targeting) }}</span>
            </div>
            <div>
              <label class="mb-1 block text-[13px] font-medium text-gray-500">Region(s) / countries <span
                  class="text-red-500">*</span></label>
              <TagMultiSelect v-model="selected.regions" :options="REGION_OPTIONS" placeholder="Add regions"
                @update:model-value="onChange" />
            </div>
            <div>
              <label class="mb-1 block text-[13px] font-medium text-gray-500">Channels <span
                  class="text-red-500">*</span></label>
              <TagMultiSelect v-model="selected.channels" :options="CHANNEL_OPTIONS" placeholder="Select channels"
                @update:model-value="onChange" />
            </div>
          </section>

          <!-- Goal / CTA -->
          <section class="flex flex-col gap-3">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Goal / CTA</h3>
              <span class="text-xs font-medium" :class="badgeClass(sectionMap.goal)">{{ badgeText(sectionMap.goal)
              }}</span>
            </div>
            <div>
              <label class="mb-1 block text-[13px] font-medium text-gray-500">Goal <span
                  class="text-red-500">*</span></label>
              <UInput v-model="selected.goal" placeholder="e.g. Generate 200 MQLs from OEM accounts" class="w-full"
                :trailing-icon="selected.goal ? check : undefined" @update:model-value="onChange" />
            </div>
            <div>
              <label class="mb-1 block text-[13px] font-medium text-gray-500">Call to action <span
                  class="text-red-500">*</span></label>
              <UInput v-model="selected.cta" placeholder="e.g. Request a free sample kit" class="w-full"
                :trailing-icon="selected.cta ? check : undefined" @update:model-value="onChange" />
            </div>
          </section>

          <!-- Ownership -->
          <section class="flex flex-col gap-3">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Ownership</h3>
              <span class="text-xs font-medium" :class="badgeClass(sectionMap.ownership)">{{
                badgeText(sectionMap.ownership) }}</span>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="mb-1 block text-[13px] font-medium text-gray-500">Owner <span
                    class="text-red-500">*</span></label>
                <USelect v-model="selected.owner" :items="OWNER_OPTIONS" placeholder="Select owner" class="w-full"
                  @update:model-value="onChange" />
              </div>
              <div>
                <label class="mb-1 block text-[13px] font-medium text-gray-500">Owner email <span
                    class="text-red-500">*</span></label>
                <UInput v-model="selected.ownerEmail" placeholder="name@henkel.com" class="w-full"
                  :trailing-icon="selected.ownerEmail ? check : undefined" @update:model-value="onChange" />
              </div>
            </div>
            <div>
              <label class="mb-1 block text-[13px] font-medium text-gray-500">CC watchers</label>
              <EmailTagInput v-model="selected.watchers" placeholder="Add email + Enter"
                @update:model-value="onChange" />
              <p class="mt-1 text-xs text-gray-400">People who stay in the loop — updated alongside the owner.</p>
            </div>
          </section>
        </div>

        <!-- Assets & briefings -->
        <section class="flex flex-col gap-3">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Assets &amp; briefings</h3>
            <span class="text-xs font-medium" :class="badgeClass(sectionMap.assets)">{{ badgeText(sectionMap.assets)
            }}</span>
          </div>
          <p class="-mt-1 text-xs text-gray-400">
            Select the assets &amp; briefings this campaign needs, then fill in each one.
          </p>
          <div :class="cardsWrap">
            <!-- Emails -->
            <AssetCard label="Emails" :selected="selected.assets.emails.selected"
              :complete="assetComplete('emails', selected.assets)"
              @update:selected="(v) => { selected!.assets.emails.selected = v; onChange() }">
              <div>
                <label class="mb-1 block text-[13px] font-medium text-gray-500">Which program do you need to create?
                  <span class="text-red-500">*</span></label>
                <USelect v-model="selected.assets.emails.program" :items="EMAIL_PROGRAM_OPTIONS"
                  placeholder="Select program" class="w-full" @update:model-value="onChange" />
              </div>
              <div>
                <label class="mb-1 block text-[13px] font-medium text-gray-500">Description</label>
                <UTextarea v-model="selected.assets.emails.description" :rows="2" placeholder="Describe the email program"
                  class="w-full" @update:model-value="onChange" />
              </div>
              <FileUpload v-model="selected.assets.emails.briefingDoc" @update:model-value="onChange" />
            </AssetCard>

            <!-- Landing pages -->
            <AssetCard label="Landing pages" :selected="selected.assets.landingPages.selected"
              :complete="assetComplete('landingPages', selected.assets)"
              @update:selected="(v) => { selected!.assets.landingPages.selected = v; onChange() }">
              <div>
                <label class="mb-1 block text-[13px] font-medium text-gray-500">Description (optional)</label>
                <UTextarea v-model="selected.assets.landingPages.description" :rows="2"
                  placeholder="What should the landing page do?" class="w-full" @update:model-value="onChange" />
              </div>
              <div>
                <label class="mb-1 block text-[13px] font-medium text-gray-500">External files / links</label>
                <UInput v-model="selected.assets.landingPages.externalLinks"
                  placeholder="WeTransfer / Drive link for large files" class="w-full" @update:model-value="onChange" />
              </div>
              <FileUpload v-model="selected.assets.landingPages.briefingDoc" @update:model-value="onChange" />
            </AssetCard>

            <!-- Forms -->
            <AssetCard label="Forms" :selected="selected.assets.forms.selected"
              :complete="assetComplete('forms', selected.assets)"
              @update:selected="(v) => { selected!.assets.forms.selected = v; onChange() }">
              <div>
                <label class="mb-1 block text-[13px] font-medium text-gray-500">Description (optional)</label>
                <UTextarea v-model="selected.assets.forms.description" :rows="2"
                  placeholder="What should the form capture?" class="w-full" @update:model-value="onChange" />
              </div>
              <div>
                <label class="mb-1 block text-[13px] font-medium text-gray-500">External files / links</label>
                <UInput v-model="selected.assets.forms.externalLinks"
                  placeholder="WeTransfer / Drive link for large files" class="w-full" @update:model-value="onChange" />
              </div>
              <FileUpload v-model="selected.assets.forms.briefingDoc" @update:model-value="onChange" />
            </AssetCard>

            <!-- Tracking pixels -->
            <AssetCard label="Tracking pixels" :selected="selected.assets.trackingPixels.selected"
              :complete="assetComplete('trackingPixels', selected.assets)"
              @update:selected="(v) => { selected!.assets.trackingPixels.selected = v; onChange() }">
              <p class="text-xs text-gray-400">Add one pixel to start; add more as needed.</p>
              <TrackingPixelsEditor v-model="selected.assets.trackingPixels.pixels" @change="onChange" />
            </AssetCard>

            <!-- Localization -->
            <AssetCard label="Localization" :selected="selected.assets.localization.selected"
              :complete="assetComplete('localization', selected.assets)"
              @update:selected="(v) => { selected!.assets.localization.selected = v; onChange() }">
              <div>
                <label class="mb-1 block text-[13px] font-medium text-gray-500">Languages</label>
                <TagMultiSelect v-model="selected.assets.localization.languages" :options="LANGUAGE_OPTIONS"
                  placeholder="Add languages" @update:model-value="onChange" />
              </div>
            </AssetCard>
          </div>
        </section>

        <!-- Notes -->
        <section class="flex flex-col gap-2">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Notes</h3>
          <UTextarea v-model="selected.notes" :rows="2" placeholder="Optional notes" class="w-full" />
        </section>
      </div>
    </template>

    <template #footer>
      <div v-if="selected" class="flex w-full flex-col gap-3">
        <button v-if="hasProduction" type="button"
          class="flex items-center justify-center gap-1 text-sm font-medium text-blue-600 hover:underline"
          @click="viewProduction">
          View production status
          <UIcon name="i-lucide-arrow-right" class="size-4" />
        </button>

        <div v-if="!isBriefed">
          <div class="mb-1.5 flex items-center justify-between text-xs">
            <span class="font-medium" :class="canBrief ? 'text-green-600' : 'text-gray-500'">
              {{ done }} / {{ total }} required fields complete
            </span>
            <span class="text-gray-400">{{ percent }}%</span>
          </div>
          <div class="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
            <div class="h-full rounded-full transition-all" :class="canBrief ? 'bg-green-600' : 'bg-amber-500'"
              :style="{ width: `${percent}%` }" />
          </div>
        </div>

        <UButton v-if="canBrief && !isBriefed" label="Brief campaign" color="primary" size="lg" block
          @click="openBrief" />
        <UButton v-else-if="!isBriefed" label="Brief campaign" icon="i-lucide-lock" color="neutral" variant="soft"
          size="lg" block disabled />
        <div v-else
          class="flex items-center justify-center gap-2 rounded-lg bg-green-50 py-2.5 text-sm font-medium text-green-700">
          <UIcon name="i-lucide-check-circle" class="size-4" />
          Briefed · {{ selected.briefId }}
        </div>
      </div>
    </template>
  </USlideover>
</template>
