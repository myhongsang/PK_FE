import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { refDebounced, watchDebounced } from '@vueuse/core'

import { getUsers } from '@/api/users'
import { resolvePageTarget } from '@/lib/pagination-guard'
import { usePageQuery } from '@/lib/use-page-query'
import { counts } from '@/stores/counts'
import type { SearchSuggestion } from '@/lib/search'
import type { UserItem } from '@/types/user'

export function useUserList() {
  const { t } = useI18n()

  const users = ref<UserItem[]>([])
  const loading = ref(false)
  const errorMessage = ref('')

  const search = ref('')
  const debouncedSearch = refDebounced(search, 300)
  const searchResults = ref<UserItem[]>([])

  const currentPage = ref(1)
  const totalPages = ref(1)
  usePageQuery(currentPage)

  let searchSeq = 0
  let loadSeq = 0

  const displayedUsers = computed(() => users.value)

  const suggestions = computed<SearchSuggestion[]>(() => {
    const term = search.value.trim()
    if (!term || searchResults.value.length === 0) return []
    return searchResults.value.slice(0, 6).map((user) => ({
      label: user.name,
      detail: user.email,
    }))
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
      const result = await getUsers(clean)
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
      count: displayedUsers.value.length,
    }),
  )

  async function loadData(showLoading = true) {
    if (showLoading) loading.value = true
    errorMessage.value = ''
    const seq = ++loadSeq

    try {
      for (let attempt = 0; attempt < 3; attempt++) {
        const page = currentPage.value
        const term = debouncedSearch.value
        const result = await getUsers(term, page)

        if (seq !== loadSeq) return

        const target = resolvePageTarget(page, result.meta.totalPages)
        if (target.outOfRange) {
          currentPage.value = target.lastPage
          continue
        }

        users.value = result.rows
        totalPages.value = target.lastPage

        if (!term) counts.users = result.meta.total ?? result.rows.length
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

  onMounted(() => loadData())

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
