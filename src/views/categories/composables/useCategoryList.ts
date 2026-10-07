import { computed } from 'vue'

import { getCategories } from '@/api/categories'
import { useSearchList } from '@/composables/use-search-list'
import { queryKeys } from '@/lib/query-keys'
import type { CategoryItem } from '@/types/category'

export function useCategoryList() {
  const base = useSearchList<CategoryItem>({
    listKey: params => queryKeys.categories.list(params),
    suggestKey: params => queryKeys.categories.suggest(params),
    fetchList: (q, page) => getCategories(q, page),
    toSuggestion: category => ({
      label: category.name,
      detail: category.description,
    }),
    countKey: 'categories',
  })

  const categories = base.rows
  const displayedCategories = computed(() => categories.value)

  function removeItem(id: CategoryItem['id']) {
    const target = String(id)

    base.removeCached(category => String(category.id) === target)
  }

  return {
    categories,
    displayedCategories,
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
    removeItem,
  }
}
