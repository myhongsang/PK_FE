import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/vue-query'
import { refDebounced } from '@vueuse/core'

import { getCategories } from '@/api/categories'
import { queryKeys } from '@/lib/query-keys'
import { resolvePageTarget } from '@/lib/pagination-guard'
import { usePageQuery } from '@/lib/use-page-query'
import { counts } from '@/stores/counts'
import type { SearchSuggestion } from '@/lib/search'
import type { PageResult } from '@/types/pagination'
import type { CategoryItem } from '@/types/category'

export function useCategoryList() {
  const { t } = useI18n()
  const queryClient = useQueryClient()

  const search = ref('')
  const debouncedSearch = refDebounced(search, 300)

  const currentPage = ref(1)
  usePageQuery(currentPage)

  const term = computed(() => debouncedSearch.value.trim())

  const listParams = computed(() => ({
    page: currentPage.value,
    q: term.value || undefined,
  }))

  const listQuery = useQuery({
    queryKey: computed(() => queryKeys.categories.list(listParams.value)),
    queryFn: () => getCategories(listParams.value.q, listParams.value.page),
    placeholderData: keepPreviousData,
  })

  const categories = computed<CategoryItem[]>(() => listQuery.data.value?.rows ?? [])
  const displayedCategories = computed(() => categories.value)

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

  const suggestParams = computed(() => ({ q: term.value || undefined }))

  const suggestQuery = useQuery({
    queryKey: computed(() => queryKeys.categories.suggest(suggestParams.value)),
    queryFn: () => getCategories(suggestParams.value.q),
    enabled: computed(() => term.value !== ''),
  })

  const suggestions = computed<SearchSuggestion[]>(() => {
    const data = suggestQuery.data.value
    if (!search.value.trim() || !data)
      return []

    return data.rows.slice(0, 6).map(category => ({
      label: category.name,
      detail: category.description,
    }))
  })

  const description = computed(() =>
    t('common.showingPage', {
      page: currentPage.value,
      totalPages: totalPages.value,
      count: displayedCategories.value.length,
    }),
  )

  function goToPage(page: number) {
    if (page < 1 || page > totalPages.value || page === currentPage.value)
      return

    currentPage.value = page
  }

  function loadData() {
    return listQuery.refetch()
  }

  function removeItem(id: CategoryItem['id']) {
    const target = String(id)

    const drop = (
      old: PageResult<CategoryItem> | undefined,
    ): PageResult<CategoryItem> | undefined => {
      if (!old)
        return old

      return { ...old, rows: old.rows.filter(category => String(category.id) !== target) }
    }

    const listKey = queryKeys.categories.list(listParams.value)

    if (queryClient.getQueryData(listKey))
      queryClient.setQueryData<PageResult<CategoryItem>>(listKey, drop)

    const suggestKey = queryKeys.categories.suggest(suggestParams.value)

    if (queryClient.getQueryData(suggestKey))
      queryClient.setQueryData<PageResult<CategoryItem>>(suggestKey, drop)
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

      counts.categories = data.meta.total ?? data.rows.length
    },
    { immediate: true },
  )

  watch(debouncedSearch, () => {
    currentPage.value = 1
  })

  return {
    categories,
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
    removeItem,
  }
}
