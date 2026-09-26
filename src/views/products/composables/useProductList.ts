import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { refDebounced, watchDebounced } from '@vueuse/core'

import { getProducts } from '@/api/products'
import { getAllCategories } from '@/api/categories'
import { resolveEmptyReason } from '@/lib/empty-state'
import { hasNumberInput, parseNumberInput } from '@/lib/price'
import { resolvePageTarget } from '@/lib/pagination-guard'
import { usePageQuery } from '@/lib/use-page-query'
import { counts } from '@/stores/counts'
import type { ProductFilters } from '@/api/products'
import type { CategoryItem } from '@/types/category'
import type { SearchSuggestion } from '@/lib/search'
import type { ProductItem } from '@/types/product'

export function useProductList() {
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
    if (!term || searchResults.value.length === 0) return []
    return searchResults.value.slice(0, 6).map((product) => ({
      label: product.name,
      detail: product.description,
    }))
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
      hasRangeFilter:
        hasNumberInput(debouncedMinPrice.value) || hasNumberInput(debouncedMaxPrice.value),
    })

    if (reason === 'category') return t('products.noCategoryProducts')
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
      if (seq === searchSeq) searchResults.value = result.rows
    } catch (error) {
      if (seq === searchSeq) {
        errorMessage.value =
          error instanceof Error ? error.message : t('common.unableToLoad')
      }
    } finally {
      if (seq === searchSeq) loading.value = false
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
      if (seq !== loadSeq) return
      selectedCategoryIsEmpty.value = (probe.meta.total ?? probe.rows.length) === 0
    } catch {
      if (seq === loadSeq) selectedCategoryIsEmpty.value = false
    }
  }

  async function loadData(showLoading = true) {
    if (showLoading) loading.value = true
    errorMessage.value = ''
    const seq = ++loadSeq

    try {
      for (let attempt = 0; attempt < 3; attempt++) {
        const page = currentPage.value
        const term = debouncedSearch.value
        const filters = currentFilters()
        const result = await getProducts(term, page, filters)

        if (seq !== loadSeq) return

        const target = resolvePageTarget(page, result.meta.totalPages)
        if (target.outOfRange) {
          currentPage.value = target.lastPage
          continue
        }

        products.value = result.rows
        totalPages.value = target.lastPage

        if (!term) counts.products = result.meta.total ?? result.rows.length

        await syncSelectedCategoryIsEmpty(
          seq,
          result.meta.total ?? result.rows.length,
          term.trim(),
          filters,
        )
        return
      }
    } catch (error) {
      if (seq !== loadSeq) return
      errorMessage.value =
        error instanceof Error ? error.message : t('common.unableToLoad')
    } finally {
      if (seq === loadSeq) loading.value = false
    }
  }

  function goToPage(page: number) {
    if (page < 1 || page > totalPages.value || page === currentPage.value) return
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
    } catch {
      categoryOptions.value = []
    }
  }

  onMounted(() => {
    void loadData()
    void loadCategoryOptions()
  })

  return {
    products,
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
  }
}

