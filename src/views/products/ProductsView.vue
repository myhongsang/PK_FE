<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { deleteProduct } from '@/api/products'
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog.vue'
import CreateButton from '@/components/CreateButton.vue'
import ListCard from '@/components/ListCard.vue'
import { Pagination } from '@/components/ui/pagination'
import { usePermissions } from '@/lib/permissions'
import type { ProductItem } from '@/types/product'

import { useProductList } from '@/views/products/composables/useProductList'
import ProductFiltersBar from '@/views/products/components/ProductFiltersBar.vue'
import ProductsTable from '@/views/products/components/ProductsTable.vue'
import ProductFormDialog from '@/views/products/components/ProductFormDialog.vue'

const { t } = useI18n()
const { canCreate, isAdmin } = usePermissions()

const {
  displayedProducts,
  loading,
  errorMessage,
  search,
  suggestions,
  currentPage,
  totalPages,
  categoryOptions,
  filterCategoryId,
  filterMinPrice,
  filterMaxPrice,
  description,
  emptyText,
  loadData,
  clearFilters,
  goToPage,
  removeItem,
} = useProductList()

const formOpen = ref(false)
const editingProduct = ref<ProductItem | null>(null)

function openCreate() {
  editingProduct.value = null
  formOpen.value = true
}

function openEdit(product: ProductItem) {
  editingProduct.value = product
  formOpen.value = true
}

const deleteOpen = ref(false)
const deleting = ref<ProductItem | null>(null)
const deletingBusy = ref(false)
const deleteError = ref('')

function openDelete(product: ProductItem) {
  deleting.value = product
  deleteError.value = ''
  deleteOpen.value = true
}

async function onConfirmDelete() {
  const target = deleting.value
  if (!target) return

  deletingBusy.value = true
  deleteError.value = ''
  try {
    await deleteProduct(target.id)
    removeItem(target.id)
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
    :title="$t('products.title')"
    :description="description"
    :loading="loading"
    :error-message="errorMessage"
    :is-empty="displayedProducts.length === 0"
    :empty-text="emptyText"
    @retry="loadData"
  >
    <template #action>
      <CreateButton v-if="canCreate" :label="$t('products.add')" @click="openCreate" />
    </template>

    <template #toolbar>
      <ProductFiltersBar
        v-model:search="search"
        v-model:category-id="filterCategoryId"
        v-model:min-price="filterMinPrice"
        v-model:max-price="filterMaxPrice"
        :category-options="categoryOptions"
        :suggestions="suggestions"
        @clear="clearFilters"
      />
    </template>

    <ProductsTable
      :products="displayedProducts"
      :can-manage="isAdmin"
      @edit="openEdit"
      @remove="openDelete"
    />

    <template #pagination>
      <Pagination
        :current-page="currentPage"
        :total-pages="totalPages"
        :disabled="loading"
        @update:current-page="goToPage"
      />
    </template>
  </ListCard>

  <ProductFormDialog
    v-model:open="formOpen"
    :editing="editingProduct"
    :category-options="categoryOptions"
    @saved="loadData"
  />

  <ConfirmDeleteDialog
    v-model:open="deleteOpen"
    :title="$t('products.deleteTitle')"
    :description="$t('products.deleteDescription', { name: deleting?.name })"
    :loading="deletingBusy"
    :error-message="deleteError"
    @confirm="onConfirmDelete"
  />
</template>
