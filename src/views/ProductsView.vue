<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { refDebounced, watchDebounced } from '@vueuse/core'

import { getProducts } from '@/api/products'
import SearchInput from '@/components/SearchInput.vue'
import ProductsTable from '@/components/ProductsTable.vue'
import ListCard from '@/components/ListCard.vue'
import { Pagination } from '@/components/ui/pagination'
import { counts } from '@/stores/counts'
import type { SearchSuggestion } from '@/lib/search'
import type { ProductItem } from '@/types/product'

const { t } = useI18n()

const products = ref<ProductItem[]>([])
const loading = ref(false)
const errorMessage = ref('')

const search = ref('')
const debouncedSearch = refDebounced(search, 300)
const searchResults = ref<ProductItem[]>([])

const currentPage = ref(1)
const totalPages = ref(1)

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
    const result = await getProducts(clean)
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

async function loadData(showLoading = true) {
  if (showLoading)
    loading.value = true
  errorMessage.value = ''

  const seq = ++loadSeq

  try {
    for (let attempt = 0; attempt < 3; attempt++) {
      const page = currentPage.value
      const term = debouncedSearch.value
      const result = await getProducts(term, page)

      if (seq !== loadSeq)
        return

      if (page > result.meta.totalPages) {
        currentPage.value = Math.max(1, result.meta.totalPages)
        continue
      }

      products.value = result.rows
      totalPages.value = result.meta.totalPages

      if (!term)
        counts.products = result.meta.total ?? result.rows.length

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

onMounted(() => loadData())
</script>

<template>
  <ListCard
    :title="$t('products.title')"
    :description="description"
    :loading="loading"
    :error-message="errorMessage"
    :is-empty="displayedProducts.length === 0"
    :empty-text="debouncedSearch ? $t('products.noResults') : $t('products.empty')"
    @retry="loadData"
  >
    <template #toolbar>
      <div class="max-w-sm">
        <SearchInput v-model="search" :placeholder="$t('products.searchPlaceholder')" :suggestions="suggestions" />
      </div>
    </template>

    <ProductsTable :products="displayedProducts" />

    <Pagination
      :current-page="currentPage"
      :total-pages="totalPages"
      :disabled="loading"
      @update:current-page="goToPage"
    />
  </ListCard>
</template>
