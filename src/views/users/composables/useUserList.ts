import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { keepPreviousData, useQuery } from '@tanstack/vue-query'
import { refDebounced } from '@vueuse/core'

import { getUsers } from '@/api/users'
import { queryKeys } from '@/lib/query-keys'
import { resolvePageTarget } from '@/lib/pagination-guard'
import { usePageQuery } from '@/lib/use-page-query'
import { counts } from '@/stores/counts'
import type { SearchSuggestion } from '@/lib/search'
import type { UserItem } from '@/types/user'

export function useUserList() {
  const { t } = useI18n()

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
    queryKey: computed(() => queryKeys.users.list(listParams.value)),
    queryFn: () => getUsers(listParams.value.q, listParams.value.page),
    placeholderData: keepPreviousData,
  })

  const users = computed<UserItem[]>(() => listQuery.data.value?.rows ?? [])
  const displayedUsers = computed(() => users.value)

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
    queryKey: computed(() => queryKeys.users.suggest(suggestParams.value)),
    queryFn: () => getUsers(suggestParams.value.q),
    enabled: computed(() => term.value !== ''),
  })

  const suggestions = computed<SearchSuggestion[]>(() => {
    const data = suggestQuery.data.value
    if (!search.value.trim() || !data)
      return []

    return data.rows.slice(0, 6).map(user => ({
      label: user.name,
      detail: user.email,
    }))
  })

  const description = computed(() =>
    t('common.showingPage', {
      page: currentPage.value,
      totalPages: totalPages.value,
      count: displayedUsers.value.length,
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

      counts.users = data.meta.total ?? data.rows.length
    },
    { immediate: true },
  )

  watch(debouncedSearch, () => {
    currentPage.value = 1
  })

  return {
    users,
    displayedUsers,
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
  }
}
