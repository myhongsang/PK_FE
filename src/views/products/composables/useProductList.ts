import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/vue-query'
import { refDebounced } from '@vueuse/core'

import { getProducts } from '@/api/products'
import { getAllCategories } from '@/api/categories'
import { resolveEmptyReason } from '@/lib/empty-state'
import { queryKeys } from '@/lib/query-keys'
import { resolvePageTarget } from '@/lib/pagination-guard'
import { hasNumberInput, parseNumberInput } from '@/lib/price'
import { usePageQuery } from '@/lib/use-page-query'
import { counts } from '@/stores/counts'
import type { ProductFilters } from '@/api/products'
import type { SearchSuggestion } from '@/lib/search'
import type { PageResult } from '@/types/pagination'
import type { ProductItem } from '@/types/product'

export function useProductList() {
  const { t } = useI18n()
  const queryClient = useQueryClient()

  const search = ref('')
  const debouncedSearch = refDebounced(search, 300)

  const currentPage = ref(1)
  usePageQuery(currentPage)

  const filterCategoryId = ref('')
  const filterMinPrice = ref<string | number>('')
  const filterMaxPrice = ref<string | number>('')
  const debouncedMinPrice = refDebounced(filterMinPrice, 300)
  const debouncedMaxPrice = refDebounced(filterMaxPrice, 300)

  const term = computed(() => debouncedSearch.value.trim())

  const filters = computed<ProductFilters>(() => ({
    categoryId: filterCategoryId.value ? String(filterCategoryId.value) : undefined,
    minPrice: parseNumberInput(debouncedMinPrice.value),
    maxPrice: parseNumberInput(debouncedMaxPrice.value),
  }))

  const listParams = computed(() => ({
    page: currentPage.value,
    q: term.value || undefined,
    categoryId: filters.value.categoryId,
    minPrice: filters.value.minPrice,
    maxPrice: filters.value.maxPrice,
  }))

  const listQuery = useQuery({
    queryKey: computed(() => queryKeys.products.list(listParams.value)),
    queryFn: () => {
      const { q, page, categoryId, minPrice, maxPrice } = listParams.value
      return getProducts(q, page, { categoryId, minPrice, maxPrice })
    },
    placeholderData: keepPreviousData,
  })

  const products = computed<ProductItem[]>(() => listQuery.data.value?.rows ?? [])
  const displayedProducts = computed(() => products.value)

  const loading = computed(() => listQuery.isPending.value)

  const errorMessage = computed(() => {
    const error = listQuery.error.value
    if (!error)
      return ''
    return error instanceof Error ? error.message : t('common.unableToLoad')
  })

  const totalPages = computed(() =>
    resolvePageTarget(currentPage.value, listQuery.data.value?.meta.totalPages ?? 1).lastPage,
  )

  const suggestParams = computed(() => ({
    q: term.value || undefined,
    categoryId: filters.value.categoryId,
    minPrice: filters.value.minPrice,
    maxPrice: filters.value.maxPrice,
  }))

  const suggestQuery = useQuery({
    queryKey: computed(() => queryKeys.products.suggest(suggestParams.value)),
    queryFn: () => {
      const { q, categoryId, minPrice, maxPrice } = suggestParams.value
      return getProducts(q, 1, { categoryId, minPrice, maxPrice })
    },
    enabled: computed(() => term.value !== ''),
  })

  const suggestions = computed<SearchSuggestion[]>(() => {
    const data = suggestQuery.data.value
    if (!search.value.trim() || !data)
      return []

    return data.rows.slice(0, 6).map(product => ({
      label: product.name,
      detail: product.description,
    }))
  })

  const categoryOptionsQuery = useQuery({
    queryKey: queryKeys.categories.options,
    queryFn: getAllCategories,
  })

  const categoryOptions = computed(() => categoryOptionsQuery.data.value ?? [])

  const visibleTotal = computed(() => {
    const data = listQuery.data.value
    return data ? (data.meta.total ?? data.rows.length) : 0
  })

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

  const description = computed(() =>
    t('common.showingPage', {
      page: currentPage.value,
      totalPages: totalPages.value,
      count: displayedProducts.value.length,
    }),
  )

  function clearFilters() {
    filterCategoryId.value = ''
    filterMinPrice.value = ''
    filterMaxPrice.value = ''
  }

  function goToPage(page: number) {
    if (page < 1 || page > totalPages.value || page === currentPage.value)
      return

    currentPage.value = page
  }

  function loadData() {
    return listQuery.refetch()
  }

  function removeItem(id: ProductItem['id']) {
    const target = String(id)

    const drop = (
      old: PageResult<ProductItem> | undefined,
    ): PageResult<ProductItem> | undefined => {
      if (!old)
        return old

      return { ...old, rows: old.rows.filter(product => String(product.id) !== target) }
    }

    const listKey = queryKeys.products.list(listParams.value)

    if (queryClient.getQueryData(listKey))
      queryClient.setQueryData<PageResult<ProductItem>>(listKey, drop)

    const suggestKey = queryKeys.products.suggest(suggestParams.value)

    if (queryClient.getQueryData(suggestKey))
      queryClient.setQueryData<PageResult<ProductItem>>(suggestKey, drop)
  }

  watch(
    () => listQuery.data.value?.meta.totalPages,
    (serverTotalPages) => {
      if (serverTotalPages === undefined)
        return

      const target = resolvePageTarget(currentPage.value, serverTotalPages)

      if (target.outOfRange)
        currentPage.value = target.lastPage
    },
  )

  watch(
    () => listQuery.data.value,
    (data) => {
      if (!data || term.value)
        return

      counts.products = data.meta.total ?? data.rows.length
    },
    { immediate: true },
  )

  watch(debouncedSearch, () => {
    currentPage.value = 1
  })

  watch([filterCategoryId, debouncedMinPrice, debouncedMaxPrice], () => {
    currentPage.value = 1
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
    removeItem,
  }
}
