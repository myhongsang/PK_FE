import { computed, ref, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuery } from '@tanstack/vue-query'
import { refDebounced } from '@vueuse/core'

import { getProducts } from '@/api/products'
import { getAllCategories } from '@/api/categories'
import { useSearchList } from '@/composables/use-search-list'
import { resolveEmptyReason } from '@/lib/empty-state'
import { CATEGORY_OPTIONS_GC_TIME_MS, CATEGORY_OPTIONS_STALE_TIME_MS } from '@/lib/query-client'
import { queryKeys } from '@/lib/query-keys'
import { hasNumberInput, parseNumberInput } from '@/lib/price'
import type { ProductFilters } from '@/api/products'
import type { ProductItem } from '@/types/product'

let lastKnownProductsTotalPages = 1

export function useProductList() {
  const { t } = useI18n()

  const filterCategoryId = ref('')
  const filterMinPrice = ref<string | number>('')
  const filterMaxPrice = ref<string | number>('')
  const debouncedMinPrice = refDebounced(filterMinPrice, 300)
  const debouncedMaxPrice = refDebounced(filterMaxPrice, 300)

  const filters = computed<ProductFilters>(() => ({
    categoryId: filterCategoryId.value ? String(filterCategoryId.value) : undefined,
    minPrice: parseNumberInput(debouncedMinPrice.value),
    maxPrice: parseNumberInput(debouncedMaxPrice.value),
  }))

  const productsTotalPages = shallowRef(lastKnownProductsTotalPages)

  const base = useSearchList<ProductItem>({
    listKey: params => queryKeys.products.list(params),
    suggestKey: params => queryKeys.products.suggest(params),
    fetchList: (q, page, extra) =>
      getProducts(q, page, {
        categoryId: extra.categoryId,
        minPrice: extra.minPrice,
        maxPrice: extra.maxPrice,
      }),
    fetchSuggest: (q, extra) =>
      getProducts(q, 1, {
        categoryId: extra.categoryId,
        minPrice: extra.minPrice,
        maxPrice: extra.maxPrice,
      }),
    extraParams: () => ({
      categoryId: filters.value.categoryId,
      minPrice: filters.value.minPrice,
      maxPrice: filters.value.maxPrice,
    }),
    toSuggestion: product => ({
      label: product.name,
      detail: product.description,
    }),
    countKey: 'products',
    totalPagesHolder: productsTotalPages,
    extraResetSources: [filterCategoryId, debouncedMinPrice, debouncedMaxPrice],
  })

  const products = base.rows
  const displayedProducts = computed(() => products.value)
  const search = base.search
  const term = base.term
  const currentPage = base.currentPage
  const totalPages = base.totalPages

  const categoryOptionsQuery = useQuery({
    queryKey: queryKeys.categories.options,
    queryFn: getAllCategories,
    staleTime: CATEGORY_OPTIONS_STALE_TIME_MS,
    gcTime: CATEGORY_OPTIONS_GC_TIME_MS,
    refetchOnMount: false,
  })

  const categoryOptions = computed(() => categoryOptionsQuery.data.value ?? [])

  const visibleTotal = base.total

  const narrowedFurther = computed(() =>
    term.value !== ''
    || filters.value.minPrice !== undefined
    || filters.value.maxPrice !== undefined,
  )

  const categoryProbeQuery = useQuery({
    queryKey: computed(() => queryKeys.products.probe({ categoryId: filters.value.categoryId })),
    queryFn: () => getProducts(undefined, 1, { categoryId: filters.value.categoryId }),
    enabled: computed(() =>
      !!filters.value.categoryId && narrowedFurther.value && visibleTotal.value === 0,
    ),
  })

  const selectedCategoryIsEmpty = computed(() => {
    if (!filters.value.categoryId)
      return false

    if (!narrowedFurther.value)
      return visibleTotal.value === 0

    if (visibleTotal.value > 0)
      return false

    const probe = categoryProbeQuery.data.value
    if (!probe)
      return false

    return (probe.meta.total ?? probe.rows.length) === 0
  })

  const emptyText = computed(() => {
    const reason = resolveEmptyReason({
      categoryId: filters.value.categoryId ?? '',
      categoryIsEmpty: selectedCategoryIsEmpty.value,
      searchTerm: term.value,
      hasRangeFilter:
        hasNumberInput(debouncedMinPrice.value) || hasNumberInput(debouncedMaxPrice.value),
    })

    if (reason === 'category')
      return t('products.noCategoryProducts')

    return reason === 'filtered' ? t('products.noResults') : t('products.empty')
  })

  const description = base.description

  function clearFilters() {
    filterCategoryId.value = ''
    filterMinPrice.value = ''
    filterMaxPrice.value = ''
  }

  function goToPage(page: number) {
    base.goToPage(page)
    lastKnownProductsTotalPages = productsTotalPages.value
  }

  function loadData() {
    return base.loadData()
  }

  function removeItem(id: ProductItem['id']) {
    const target = String(id)

    base.removeCached(product => String(product.id) === target)
  }

  return {
    products,
    displayedProducts,
    loading: base.loading,
    errorMessage: base.errorMessage,
    search,
    suggestions: base.suggestions,
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
  }
}
