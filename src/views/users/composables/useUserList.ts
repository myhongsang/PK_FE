import { computed } from 'vue'

import { getUsers } from '@/api/users'
import { useSearchList } from '@/composables/use-search-list'
import { queryKeys } from '@/lib/query-keys'
import type { UserItem } from '@/types/user'

export function useUserList() {
  const base = useSearchList<UserItem>({
    listKey: params => queryKeys.users.list(params),
    suggestKey: params => queryKeys.users.suggest(params),
    fetchList: (q, page) => getUsers(q, page),
    toSuggestion: user => ({
      label: user.name,
      detail: user.email,
    }),
    countKey: 'users',
  })

  const users = base.rows
  const displayedUsers = computed(() => users.value)

  return {
    users,
    displayedUsers,
    loading: base.loading,
    errorMessage: base.errorMessage,
    search: base.search,
    debouncedSearch: base.debouncedSearch,
    suggestions: base.suggestions,
    currentPage: base.currentPage,
    totalPages: base.totalPages,
    description: base.description,
    loadData: base.loadData,
    goToPage: base.goToPage,
  }
}
