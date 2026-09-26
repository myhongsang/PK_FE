<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { PlusIcon } from '@lucide/vue'

import { deleteCategory } from '@/api/categories'
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog.vue'
import ListCard from '@/components/ListCard.vue'
import SearchInput from '@/components/SearchInput.vue'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/ui/pagination'
import type { CategoryItem } from '@/types/category'

import { useCategoryList } from '@/views/categories/composables/useCategoryList'
import CategoriesTable from '@/views/categories/components/CategoriesTable.vue'
import CategoryFormDialog from '@/views/categories/components/CategoryFormDialog.vue'

const { t } = useI18n()

const {
  displayedCategories,
  loading,
  errorMessage,
  search,
  debouncedSearch,
  suggestions,
  currentPage,
  totalPages,
  description,
  loadData,
  goToPage,
} = useCategoryList()

const formOpen = ref(false)
const editingCategory = ref<CategoryItem | null>(null)

function openCreate() {
  editingCategory.value = null
  formOpen.value = true
}

function openEdit(category: CategoryItem) {
  editingCategory.value = category
  formOpen.value = true
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
  if (!deleting.value) return

  deletingBusy.value = true
  deleteError.value = ''
  try {
    await deleteCategory(deleting.value.id)
    deleteOpen.value = false
    await loadData()
  } catch (error) {
    deleteError.value =
      error instanceof Error ? error.message : t('common.genericError')
  } finally {
    deletingBusy.value = false
  }
}
</script>

<template>
  <ListCard
    :title="$t('categories.title')"
    :description="description"
    :loading="loading"
    :error-message="errorMessage"
    :is-empty="displayedCategories.length === 0"
    :empty-text="debouncedSearch ? $t('categories.noResults') : $t('categories.empty')"
    @retry="loadData"
  >
    <template #action>
      <Button @click="openCreate">
        <PlusIcon aria-hidden="true" />
        {{ $t('categories.add') }}
      </Button>
    </template>

    <template #toolbar>
      <div class="max-w-sm">
        <SearchInput
          v-model="search"
          :placeholder="$t('categories.searchPlaceholder')"
          :suggestions="suggestions"
        />
      </div>
    </template>

    <CategoriesTable
      :categories="displayedCategories"
      @edit="openEdit"
      @remove="openDelete"
    />

    <Pagination
      :current-page="currentPage"
      :total-pages="totalPages"
      :disabled="loading"
      @update:current-page="goToPage"
    />
  </ListCard>

  <CategoryFormDialog
    v-model:open="formOpen"
    :editing="editingCategory"
    @saved="loadData"
  />

  <ConfirmDeleteDialog
    v-model:open="deleteOpen"
    :title="$t('categories.deleteTitle')"
    :description="$t('categories.deleteDescription', { name: deleting?.name })"
    :loading="deletingBusy"
    :error-message="deleteError"
    @confirm="onConfirmDelete"
  />
</template>
