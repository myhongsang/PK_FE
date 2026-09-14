<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { LoaderCircleIcon, PlusIcon } from '@lucide/vue'

import { createCategory, deleteCategory, getCategories, updateCategory } from '@/api/categories'
import CategoriesTable from '@/components/CategoriesTable.vue'
import ListCard from '@/components/ListCard.vue'
import { counts } from '@/stores/counts'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { CategoryItem } from '@/types/category'

const { t } = useI18n()

const categories = ref<CategoryItem[]>([])
const loading = ref(false)
const errorMessage = ref('')

const description = computed(() =>
  t('categories.showing', { count: categories.value.length }),
)

const formOpen = ref(false)
const editing = ref<CategoryItem | null>(null)
const form = reactive({
  name: '',
  description: '',
})
const fieldErrors = reactive<{ name?: string }>({})
const formError = ref('')
const saving = ref(false)

const dialogTitle = computed(() =>
  editing.value ? t('categories.editTitle') : t('categories.createTitle'),
)

function openCreate() {
  editing.value = null
  form.name = ''
  form.description = ''
  fieldErrors.name = undefined
  formError.value = ''
  formOpen.value = true
}

function openEdit(category: CategoryItem) {
  editing.value = category
  form.name = category.name === '—' ? '' : category.name
  form.description = category.description === '—' ? '' : category.description
  fieldErrors.name = undefined
  formError.value = ''
  formOpen.value = true
}

function validate(): boolean {
  fieldErrors.name = undefined

  if (!form.name.trim())
    fieldErrors.name = t('categories.nameRequired')

  return !fieldErrors.name
}

async function onSubmit() {
  formError.value = ''

  if (!validate())
    return

  saving.value = true
  try {
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
    }

    if (editing.value)
      await updateCategory(editing.value.id, payload)
    else
      await createCategory(payload)

    formOpen.value = false
    await loadData()
  }
  catch (error) {
    formError.value = error instanceof Error
      ? error.message
      : t('common.genericError')
  }
  finally {
    saving.value = false
  }
}

const deleteOpen = ref(false)
const deleting = ref<CategoryItem | null>(null)
const deletingBusy = ref(false)
const deleteError = ref('')

function openDelete(category: CategoryItem) {
  deleting.value = category
  deleteError.value = ''
  deleteOpen.value = true
}

async function onConfirmDelete() {
  if (!deleting.value)
    return

  deletingBusy.value = true
  deleteError.value = ''
  try {
    await deleteCategory(deleting.value.id)
    deleteOpen.value = false
    await loadData()
  }
  catch (error) {
    deleteError.value = error instanceof Error
      ? error.message
      : t('common.genericError')
  }
  finally {
    deletingBusy.value = false
  }
}

async function loadData() {
  loading.value = true
  errorMessage.value = ''

  try {
    categories.value = await getCategories()
    counts.categories = categories.value.length
  }
  catch (error) {
    errorMessage.value = error instanceof Error
      ? error.message
      : t('common.unableToLoad')
  }
  finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>

<template>
  <ListCard
    :title="$t('categories.title')"
    :description="description"
    :loading="loading"
    :error-message="errorMessage"
    :is-empty="categories.length === 0"
    :empty-text="$t('categories.empty')"
    @retry="loadData"
  >
    <template #action>
      <Button @click="openCreate">
        <PlusIcon aria-hidden="true" />
        {{ $t('categories.add') }}
      </Button>
    </template>

    <CategoriesTable
      :categories="categories"
      @edit="openEdit"
      @remove="openDelete"
    />
  </ListCard>

  <Dialog v-model:open="formOpen">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{{ dialogTitle }}</DialogTitle>
        <DialogDescription>
          {{ editing ? $t('categories.editDescription') : $t('categories.createDescription') }}
        </DialogDescription>
      </DialogHeader>

      <form class="grid gap-4" novalidate @submit.prevent="onSubmit">
        <div class="grid gap-2">
          <Label for="category-name">{{ $t('categories.name') }}</Label>
          <Input
            id="category-name"
            v-model="form.name"
            :placeholder="$t('categories.namePlaceholder')"
            :aria-invalid="fieldErrors.name ? true : undefined"
            :disabled="saving"
          />
          <p v-if="fieldErrors.name" class="text-xs text-destructive" role="alert">
            {{ fieldErrors.name }}
          </p>
        </div>

        <div class="grid gap-2">
          <Label for="category-description">{{ $t('categories.description') }}</Label>
          <Input
            id="category-description"
            v-model="form.description"
            :placeholder="$t('categories.descriptionPlaceholder')"
            :disabled="saving"
          />
        </div>

        <p v-if="formError" class="text-xs text-destructive" role="alert">
          {{ formError }}
        </p>

        <DialogFooter>
          <Button type="button" variant="outline" :disabled="saving" @click="formOpen = false">
            {{ $t('common.cancel') }}
          </Button>
          <Button type="submit" :disabled="saving">
            <LoaderCircleIcon v-if="saving" class="animate-spin" aria-hidden="true" />
            {{ editing ? $t('common.save') : $t('categories.add') }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>

  <Dialog v-model:open="deleteOpen">
    <DialogContent class="sm:max-w-sm">
      <DialogHeader>
        <DialogTitle>Xoá danh mục</DialogTitle>
        <DialogDescription>
          {{ $t('categories.deleteDescription', { name: deleting?.name }) }}
        </DialogDescription>
      </DialogHeader>

      <p v-if="deleteError" class="text-xs text-destructive" role="alert">
        {{ deleteError }}
      </p>

      <DialogFooter>
        <Button variant="outline" :disabled="deletingBusy" @click="deleteOpen = false">
          {{ $t('common.cancel') }}
        </Button>
        <Button variant="destructive" :disabled="deletingBusy" @click="onConfirmDelete">
          <LoaderCircleIcon v-if="deletingBusy" class="animate-spin" aria-hidden="true" />
          {{ $t('common.delete') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
