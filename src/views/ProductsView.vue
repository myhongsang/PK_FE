<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { refDebounced, watchDebounced } from '@vueuse/core'
import { LoaderCircleIcon, PlusIcon } from '@lucide/vue'

import { createProduct, deleteProduct, getProducts, updateProduct } from '@/api/products'
import { getAllCategories } from '@/api/categories'
import { resolveEmptyReason } from '@/lib/empty-state'
import { hasNumberInput, parseIntegerInput, parseNumberInput } from '@/lib/price'
import { resolvePageTarget } from '@/lib/pagination-guard'
import { usePageQuery } from '@/lib/use-page-query'
import SearchInput from '@/components/SearchInput.vue'
import ProductsTable from '@/components/ProductsTable.vue'
import ListCard from '@/components/ListCard.vue'
import { Pagination } from '@/components/ui/pagination'
import { counts } from '@/stores/counts'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { ProductFilters } from '@/api/products'
import type { CategoryItem } from '@/types/category'
import type { SearchSuggestion } from '@/lib/search'
import type { ProductItem, ProductPayload } from '@/types/product'

const { t } = useI18n()

const products = ref<ProductItem[]>([])
const loading = ref(false)
const errorMessage = ref('')

const search = ref('')
const debouncedSearch = refDebounced(search, 300)
const searchResults = ref<ProductItem[]>([])

const currentPage = ref(1)
const totalPages = ref(1)

usePageQuery(currentPage)

const categoryOptions = ref<CategoryItem[]>([])

const filterCategoryId = ref('')
const filterMinPrice = ref<string | number>('')
const filterMaxPrice = ref<string | number>('')
const debouncedMinPrice = refDebounced(filterMinPrice, 300)
const debouncedMaxPrice = refDebounced(filterMaxPrice, 300)

const selectedCategoryIsEmpty = ref(false)

let searchSeq = 0
let loadSeq = 0

const displayedProducts = computed(() => products.value)

const suggestions = computed<SearchSuggestion[]>(() => {
  const term = search.value.trim()

  if (!term || searchResults.value.length === 0)
    return []

  return searchResults.value
    .slice(0, 6)
    .map(product => ({ label: product.name, detail: product.description }))
})

function currentFilters(): ProductFilters {
  return {
    categoryId: filterCategoryId.value ? String(filterCategoryId.value) : undefined,
    minPrice: parseNumberInput(debouncedMinPrice.value),
    maxPrice: parseNumberInput(debouncedMaxPrice.value),
  }
}

function clearFilters() {
  filterCategoryId.value = ''
  filterMinPrice.value = ''
  filterMaxPrice.value = ''
}

const emptyText = computed(() => {
  const reason = resolveEmptyReason({
    categoryId: filterCategoryId.value ? String(filterCategoryId.value) : '',
    categoryIsEmpty: selectedCategoryIsEmpty.value,
    searchTerm: debouncedSearch.value.trim(),
    hasRangeFilter: hasNumberInput(debouncedMinPrice.value) || hasNumberInput(debouncedMaxPrice.value),
  })

  if (reason === 'category')
    return t('products.noCategoryProducts')

  return reason === 'filtered' ? t('products.noResults') : t('products.empty')
})

async function runSearch(term: string) {
  const clean = term.trim()
  const seq = ++searchSeq

  if (!clean) {
    searchResults.value = []
    return
  }

  loading.value = true
  errorMessage.value = ''
  searchResults.value = []

  try {
    const result = await getProducts(clean, 1, currentFilters())
    if (seq === searchSeq)
      searchResults.value = result.rows
  }
  catch (error) {
    if (seq === searchSeq) {
      errorMessage.value = error instanceof Error
        ? error.message
        : t('common.unableToLoad')
    }
  }
  finally {
    if (seq === searchSeq)
      loading.value = false
  }
}

watchDebounced(search, (value) => { void runSearch(value) }, { debounce: 300 })

const description = computed(() =>
  t('common.showingPage', {
    page: currentPage.value,
    totalPages: totalPages.value,
    count: displayedProducts.value.length,
  }),
)

const formOpen = ref(false)
const editing = ref<ProductItem | null>(null)
const form = reactive<{
  name: string
  description: string
  price: string | number
  stock: string | number
  categoryId: string
}>({
  name: '',
  description: '',
  price: '',
  stock: '',
  categoryId: '',
})
const fieldErrors = reactive<{ name?: string; price?: string; stock?: string }>({})
const formError = ref('')
const saving = ref(false)

const dialogTitle = computed(() =>
  editing.value ? t('products.editTitle') : t('products.createTitle'),
)

function openCreate() {
  editing.value = null
  form.name = ''
  form.description = ''
  form.price = ''
  form.stock = ''
  form.categoryId = ''
  fieldErrors.name = undefined
  fieldErrors.price = undefined
  fieldErrors.stock = undefined
  formError.value = ''
  formOpen.value = true
}

function openEdit(product: ProductItem) {
  editing.value = product
  form.name = product.name === '—' ? '' : product.name
  form.description = product.description === '—' ? '' : product.description
  form.price = product.price === '—' ? '' : String(product.price)
  form.stock = String(product.stock)
  form.categoryId = product.categoryId ? String(product.categoryId) : ''
  fieldErrors.name = undefined
  fieldErrors.price = undefined
  fieldErrors.stock = undefined
  formError.value = ''
  formOpen.value = true
}

function validate(): boolean {
  fieldErrors.name = undefined
  fieldErrors.price = undefined
  fieldErrors.stock = undefined

  if (!String(form.name ?? '').trim())
    fieldErrors.name = t('products.nameRequired')

  if (hasNumberInput(form.price) && parseNumberInput(form.price) === undefined)
    fieldErrors.price = t('products.priceInvalid')

  if (hasNumberInput(form.stock) && parseIntegerInput(form.stock) === undefined)
    fieldErrors.stock = t('products.stockInvalid')

  return !fieldErrors.name && !fieldErrors.price && !fieldErrors.stock
}

async function onSubmit() {
  formError.value = ''

  if (!validate())
    return

  saving.value = true
  try {
    const price = parseNumberInput(form.price)
    const stock = parseIntegerInput(form.stock)

    const payload: ProductPayload = {
      name: String(form.name ?? '').trim(),
      description: String(form.description ?? '').trim(),
    }

    if (price !== undefined)
      payload.price = price

    if (stock !== undefined)
      payload.stock = stock

    if (form.categoryId)
      payload.categoryId = form.categoryId

    if (editing.value)
      await updateProduct(editing.value.id, payload)
    else
      await createProduct(payload)

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
const deleting = ref<ProductItem | null>(null)
const deletingBusy = ref(false)
const deleteError = ref('')

function openDelete(product: ProductItem) {
  deleting.value = product
  deleteError.value = ''
  deleteOpen.value = true
}

async function onConfirmDelete() {
  if (!deleting.value)
    return

  deletingBusy.value = true
  deleteError.value = ''
  try {
    await deleteProduct(deleting.value.id)
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

async function syncSelectedCategoryIsEmpty(
  seq: number,
  visibleTotal: number,
  term: string,
  filters: ProductFilters,
) {
  const categoryId = filters.categoryId

  if (!categoryId) {
    selectedCategoryIsEmpty.value = false
    return
  }

  const narrowedFurther =
    term !== '' || filters.minPrice !== undefined || filters.maxPrice !== undefined

  if (!narrowedFurther) {
    selectedCategoryIsEmpty.value = visibleTotal === 0
    return
  }

  if (visibleTotal > 0) {
    selectedCategoryIsEmpty.value = false
    return
  }

  try {
    const probe = await getProducts(undefined, 1, { categoryId })

    if (seq !== loadSeq)
      return

    selectedCategoryIsEmpty.value = (probe.meta.total ?? probe.rows.length) === 0
  }
  catch {
    if (seq === loadSeq)
      selectedCategoryIsEmpty.value = false
  }
}

async function loadData(showLoading = true) {
  if (showLoading)
    loading.value = true
  errorMessage.value = ''

  const seq = ++loadSeq

  try {
    for (let attempt = 0; attempt < 3; attempt++) {
      const page = currentPage.value
      const term = debouncedSearch.value
      const filters = currentFilters()
      const result = await getProducts(term, page, filters)

      if (seq !== loadSeq)
        return

      const target = resolvePageTarget(page, result.meta.totalPages)

      if (target.outOfRange) {
        currentPage.value = target.lastPage
        continue
      }

      products.value = result.rows
      totalPages.value = target.lastPage

      if (!term)
        counts.products = result.meta.total ?? result.rows.length

      await syncSelectedCategoryIsEmpty(
        seq,
        result.meta.total ?? result.rows.length,
        term.trim(),
        filters,
      )

      return
    }
  }
  catch (error) {
    if (seq !== loadSeq)
      return

    errorMessage.value = error instanceof Error
      ? error.message
      : t('common.unableToLoad')
  }
  finally {
    if (seq === loadSeq)
      loading.value = false
  }
}

function goToPage(page: number) {
  if (page < 1 || page > totalPages.value || page === currentPage.value)
    return

  currentPage.value = page
  void loadData(false)
}

watch(debouncedSearch, () => {
  currentPage.value = 1
  void loadData(false)
})

watch([filterCategoryId, debouncedMinPrice, debouncedMaxPrice], () => {
  currentPage.value = 1
  void loadData(false)
})

async function loadCategoryOptions() {
  try {
    categoryOptions.value = await getAllCategories()
  }
  catch {
    categoryOptions.value = []
  }
}

onMounted(() => {
  void loadData()
  void loadCategoryOptions()
})
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
      <Button @click="openCreate">
        <PlusIcon aria-hidden="true" />
        {{ $t('products.add') }}
      </Button>
    </template>

    <template #toolbar>
      <div class="flex flex-wrap items-end gap-3">
        <div class="min-w-60 grow">
          <SearchInput v-model="search" :placeholder="$t('products.searchPlaceholder')" :suggestions="suggestions" />
        </div>

        <div class="grid gap-1.5">
          <Label for="filter-category" class="text-xs text-muted-foreground">{{ $t('products.category') }}</Label>
          <select
            id="filter-category"
            v-model="filterCategoryId"
            class="border-input dark:bg-input/30 flex h-9 w-48 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-3 md:text-sm"
          >
            <option value="">{{ $t('products.allCategories') }}</option>
            <option v-for="category in categoryOptions" :key="String(category.id)" :value="String(category.id)">
              {{ category.name }}
            </option>
          </select>
        </div>

        <div class="grid gap-1.5">
          <Label for="filter-min-price" class="text-xs text-muted-foreground">{{ $t('products.priceFrom') }}</Label>
          <Input
            id="filter-min-price"
            v-model="filterMinPrice"
            type="number"
            min="0"
            class="w-32"
            :placeholder="$t('products.priceMinPlaceholder')"
          />
        </div>

        <div class="grid gap-1.5">
          <Label for="filter-max-price" class="text-xs text-muted-foreground">{{ $t('products.priceTo') }}</Label>
          <Input
            id="filter-max-price"
            v-model="filterMaxPrice"
            type="number"
            min="0"
            class="w-32"
            :placeholder="$t('products.priceMaxPlaceholder')"
          />
        </div>

        <Button variant="outline" size="sm" class="text-muted-foreground" @click="clearFilters">
          {{ $t('products.clearFilters') }}
        </Button>
      </div>
    </template>

    <ProductsTable
      :products="displayedProducts"
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

  <Dialog v-model:open="formOpen">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{{ dialogTitle }}</DialogTitle>
        <DialogDescription>
          {{ editing ? $t('products.editDescription') : $t('products.createDescription') }}
        </DialogDescription>
      </DialogHeader>

      <form class="grid gap-4" novalidate @submit.prevent="onSubmit">
        <div class="grid gap-2">
          <Label for="product-name">{{ $t('products.name') }}</Label>
          <Input
            id="product-name"
            v-model="form.name"
            :placeholder="$t('products.namePlaceholder')"
            :aria-invalid="fieldErrors.name ? true : undefined"
            :disabled="saving"
          />
          <p v-if="fieldErrors.name" class="text-xs text-destructive" role="alert">
            {{ fieldErrors.name }}
          </p>
        </div>

        <div class="grid gap-2">
          <Label for="product-category">{{ $t('products.category') }}</Label>
          <select
            id="product-category"
            v-model="form.categoryId"
            class="border-input dark:bg-input/30 flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            :disabled="saving"
          >
            <option value="">{{ $t('products.noCategory') }}</option>
            <option v-for="category in categoryOptions" :key="String(category.id)" :value="String(category.id)">
              {{ category.name }}
            </option>
          </select>
        </div>

        <div class="grid gap-2">
          <Label for="product-description">{{ $t('products.description') }}</Label>
          <Input
            id="product-description"
            v-model="form.description"
            :placeholder="$t('products.descriptionPlaceholder')"
            :disabled="saving"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="grid gap-2">
            <Label for="product-price">{{ $t('products.price') }}</Label>
            <Input
              id="product-price"
              v-model="form.price"
              type="number"
              min="0"
              step="0.01"
              :placeholder="$t('products.pricePlaceholder')"
              :aria-invalid="fieldErrors.price ? true : undefined"
              :disabled="saving"
            />
            <p v-if="fieldErrors.price" class="text-xs text-destructive" role="alert">
              {{ fieldErrors.price }}
            </p>
          </div>

          <div class="grid gap-2">
            <Label for="product-stock">{{ $t('products.stock') }}</Label>
            <Input
              id="product-stock"
              v-model="form.stock"
              type="number"
              min="0"
              step="1"
              :placeholder="$t('products.stockPlaceholder')"
              :aria-invalid="fieldErrors.stock ? true : undefined"
              :disabled="saving"
            />
            <p v-if="fieldErrors.stock" class="text-xs text-destructive" role="alert">
              {{ fieldErrors.stock }}
            </p>
          </div>
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
            {{ editing ? $t('common.save') : $t('products.add') }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>

  <Dialog v-model:open="deleteOpen">
    <DialogContent class="sm:max-w-sm">
      <DialogHeader>
        <DialogTitle>{{ $t('products.deleteTitle') }}</DialogTitle>
        <DialogDescription>
          {{ $t('products.deleteDescription', { name: deleting?.name }) }}
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
