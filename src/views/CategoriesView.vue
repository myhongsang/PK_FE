<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
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

const categories = ref<CategoryItem[]>([])
const loading = ref(false)
const errorMessage = ref('')

const description = computed(() =>
  `Showing ${categories.value.length} categories.`,
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
  editing.value ? 'Edit category' : 'Add category',
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
    fieldErrors.name = 'Please enter the category name.'

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
      : 'An error occurred. Please try again.'
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
      : 'An error occurred. Please try again.'
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
      : 'Unable to load data. Please try again.'
  }
  finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>

<template>
  <ListCard
    title="Quản lý danh mục"
    :description="description"
    :loading="loading"
    :error-message="errorMessage"
    :is-empty="categories.length === 0"
    empty-text="Chưa có danh mục nào."
    @retry="loadData"
  >
    <template #action>
      <Button @click="openCreate">
        <PlusIcon aria-hidden="true" />
        Thêm danh mục
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
          {{ editing ? 'Cập nhật thông tin danh mục.' : 'Nhập thông tin danh mục mới.' }}
        </DialogDescription>
      </DialogHeader>

      <form class="grid gap-4" novalidate @submit.prevent="onSubmit">
        <div class="grid gap-2">
          <Label for="category-name">Tên danh mục</Label>
          <Input
            id="category-name"
            v-model="form.name"
            placeholder="Ví dụ: Đồ điện tử"
            :aria-invalid="fieldErrors.name ? true : undefined"
            :disabled="saving"
          />
          <p v-if="fieldErrors.name" class="text-xs text-destructive" role="alert">
            {{ fieldErrors.name }}
          </p>
        </div>

        <div class="grid gap-2">
          <Label for="category-description">Mô tả</Label>
          <Input
            id="category-description"
            v-model="form.description"
            placeholder="Mô tả ngắn (không bắt buộc)"
            :disabled="saving"
          />
        </div>

        <p v-if="formError" class="text-xs text-destructive" role="alert">
          {{ formError }}
        </p>

        <DialogFooter>
          <Button type="button" variant="outline" :disabled="saving" @click="formOpen = false">
            Huỷ
          </Button>
          <Button type="submit" :disabled="saving">
            <LoaderCircleIcon v-if="saving" class="animate-spin" aria-hidden="true" />
            {{ editing ? 'Lưu thay đổi' : 'Thêm danh mục' }}
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
          Bạn có chắc muốn xoá danh mục "{{ deleting?.name }}"? Hành động này không thể hoàn tác.
        </DialogDescription>
      </DialogHeader>

      <p v-if="deleteError" class="text-xs text-destructive" role="alert">
        {{ deleteError }}
      </p>

      <DialogFooter>
        <Button variant="outline" :disabled="deletingBusy" @click="deleteOpen = false">
          Huỷ
        </Button>
        <Button variant="destructive" :disabled="deletingBusy" @click="onConfirmDelete">
          <LoaderCircleIcon v-if="deletingBusy" class="animate-spin" aria-hidden="true" />
          Xoá
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
