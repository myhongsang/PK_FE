import { computed, ref, watch, type WatchSource } from 'vue'
import { useI18n } from 'vue-i18n'
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/vue-query'
import { refDebounced } from '@vueuse/core'

import { resolvePageTarget } from '@/lib/pagination-guard'
import { usePageQuery } from '@/lib/use-page-query'
import { counts } from '@/stores/counts'
import type { ListQueryParams } from '@/lib/query-keys'
import type { SearchSuggestion } from '@/lib/search'
import type { PageResult } from '@/types/pagination'

export interface SearchListOptions<T> {
  listKey: (params: ListQueryParams) => readonly unknown[]
  suggestKey: (params: ListQueryParams) => readonly unknown[]
  fetchList: (q: string | undefined, page: number, extra: ListQueryParams) => Promise<PageResult<T>>
  fetchSuggest?: (q: string | undefined, extra: ListQueryParams) => Promise<PageResult<T>>
  extraParams?: () => ListQueryParams
  toSuggestion: (row: T) => SearchSuggestion
  countKey: keyof typeof counts
  debounceMs?: number
  suggestionLimit?: number
  totalPagesHolder?: { value: number }
  extraResetSources?: WatchSource[]
}

export function useSearchList<T>(options: SearchListOptions<T>) {
  const { t } = useI18n()
  const queryClient = useQueryClient()

  const search = ref('')
  const debouncedSearch = refDebounced(search, options.debounceMs ?? 500)

  const currentPage = ref(1)
  usePageQuery(currentPage)

  const term = computed(() => debouncedSearch.value.trim())
  const extra = computed<ListQueryParams>(() => options.extraParams?.() ?? {})

  const listParams = computed<ListQueryParams>(() => ({
    page: currentPage.value,
    q: term.value || undefined,
    ...extra.value,
  }))

  const listQuery = useQuery({
    queryKey: computed(() => options.listKey(listParams.value)),
    queryFn: () => options.fetchList(listParams.value.q, listParams.value.page ?? 1, extra.value),
    placeholderData: keepPreviousData,
  })

  const rows = computed<T[]>(() => listQuery.data.value?.rows ?? [])

  const total = computed(() => {
    const data = listQuery.data.value
    return data ? (data.meta.total ?? data.rows.length) : 0
  })

  const loading = computed(() => listQuery.isPending.value)

  const errorMessage = computed(() => {
    const error = listQuery.error.value
    if (!error)
      return ''
    return error instanceof Error ? error.message : t('common.unableToLoad')
  })

  const totalPages = computed(() => {
    const serverTotalPages = listQuery.data.value?.meta.totalPages

    if (serverTotalPages === undefined)
      return options.totalPagesHolder?.value ?? 1

    const lastPage = resolvePageTarget(currentPage.value, serverTotalPages).lastPage

    if (options.totalPagesHolder)
      options.totalPagesHolder.value = lastPage

    return lastPage
  })

  const suggestParams = computed<ListQueryParams>(() => ({
    q: term.value || undefined,
    ...extra.value,
  }))

  const suggestQuery = useQuery({
    queryKey: computed(() =>
      currentPage.value === 1
        ? options.listKey(listParams.value)
        : options.suggestKey(suggestParams.value),
    ),
    queryFn: () => {
      if (options.fetchSuggest)
        return options.fetchSuggest(suggestParams.value.q, extra.value)

      return options.fetchList(suggestParams.value.q, 1, extra.value)
    },
    enabled: computed(() => term.value !== ''),
  })

  const suggestions = computed<SearchSuggestion[]>(() => {
    const data = suggestQuery.data.value

    if (!search.value.trim() || !data)
      return []

    return data.rows.slice(0, options.suggestionLimit ?? 6).map(options.toSuggestion)
  })

  const description = computed(() =>
    t('common.showingPage', {
      page: currentPage.value,
      totalPages: totalPages.value,
      count: rows.value.length,
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

  function removeCached(predicate: (row: T) => boolean) {
    const drop = (
      old: PageResult<T> | undefined,
    ): PageResult<T> | undefined => {
      if (!old)
        return old

      return { ...old, rows: old.rows.filter(row => !predicate(row)) }
    }

    const listCacheKey = options.listKey(listParams.value)

    if (queryClient.getQueryData(listCacheKey))
      queryClient.setQueryData<PageResult<T>>(listCacheKey, drop)

    const suggestCacheKey = options.suggestKey(suggestParams.value)

    if (queryClient.getQueryData(suggestCacheKey))
      queryClient.setQueryData<PageResult<T>>(suggestCacheKey, drop)
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

      counts[options.countKey] = data.meta.total ?? data.rows.length
    },
    { immediate: true },
  )

  watch(debouncedSearch, () => {
    currentPage.value = 1
  })

  if (options.extraResetSources && options.extraResetSources.length > 0) {
    watch(options.extraResetSources, () => {
      currentPage.value = 1
    })
  }

  return {
    search,
    debouncedSearch,
    term,
    currentPage,
    totalPages,
    rows,
    total,
    loading,
    errorMessage,
    suggestions,
    description,
    goToPage,
    loadData,
    removeCached,
  }
}
