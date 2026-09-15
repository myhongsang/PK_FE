<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { refDebounced, watchDebounced } from '@vueuse/core'

import { getProducts } from '@/api/products'
import SearchInput from '@/components/SearchInput.vue'
import ProductsTable from '@/components/ProductsTable.vue'
import ListCard from '@/components/ListCard.vue'
import { counts } from '@/stores/counts'
import { matchesSearch, type SearchSuggestion } from '@/lib/search'
import type { ProductItem } from '@/types/product'

const { t } = useI18n()

const products = ref<ProductItem[]>([])
const loading = ref(false)
const errorMessage = ref('')

const search = ref('')
const debouncedSearch = refDebounced(search, 300)
const searchResults = ref<ProductItem[]>([])

let searchSeq = 0

const displayedProducts = computed(() => {
  const term = debouncedSearch.value.trim()

  if (!term)
    return products.value

  const base = searchResults.value.length > 0 ? searchResults.value : products.value

  return base.filter(product =>
    matchesSearch(product.name, term)
    || matchesSearch(product.description, term))
})

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
    const rows = await getProducts(clean)
    if (seq === searchSeq)
      searchResults.value = rows
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
  t('common.showing', { count: displayedProducts.value.length }),
)

async function loadData(showLoading = true) {
  if (showLoading)
    loading.value = true
  errorMessage.value = ''

  try {
    products.value = await getProducts(debouncedSearch.value)

    if (!debouncedSearch.value)
      counts.products = products.value.length
      if (seq !== loadSeq)
        return

      if (result.meta.totalPages < 1) {
        products.value = []
        totalPages.value = 1

        if (!term)
          counts.products = result.meta.total ?? 0

        return
      }

      if (page > result.meta.totalPages) {
        currentPage.value = result.meta.totalPages
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
    errorMessage.value = error instanceof Error
      ? error.message
      : t('common.unableToLoad')
  }
  finally {
    loading.value = false
  }
}

watch(debouncedSearch, () => {
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
  </ListCard>
</template>
