<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { refDebounced, watchDebounced } from '@vueuse/core'

import { getUsers } from '@/api/users'
import SearchInput from '@/components/SearchInput.vue'
import UsersTable from '@/components/UsersTable.vue'
import ListCard from '@/components/ListCard.vue'
import { counts } from '@/stores/counts'
import { matchesSearch, type SearchSuggestion } from '@/lib/search'
import type { UserItem } from '@/types/user'

const { t } = useI18n()

const users = ref<UserItem[]>([])
const loading = ref(false)
const errorMessage = ref('')

const search = ref('')
const debouncedSearch = refDebounced(search, 300)
const searchResults = ref<UserItem[]>([])

let searchSeq = 0

const displayedUsers = computed(() => {
  const term = debouncedSearch.value.trim()

  if (!term)
    return users.value

  const base = searchResults.value.length > 0 ? searchResults.value : users.value

  return base.filter(user =>
    matchesSearch(user.name, term)
    || matchesSearch(user.email, term))
})

const suggestions = computed<SearchSuggestion[]>(() => {
  const term = search.value.trim()

  if (!term || searchResults.value.length === 0)
    return []

  return searchResults.value
    .slice(0, 6)
    .map(user => ({ label: user.name, detail: user.email }))
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
    const rows = await getUsers(clean)
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
  t('common.showing', { count: displayedUsers.value.length }),
)

async function loadData(showLoading = true) {
  if (showLoading)
    loading.value = true
  errorMessage.value = ''

  try {
    users.value = await getUsers(debouncedSearch.value)

      if (seq !== loadSeq)
        return

      if (result.meta.totalPages < 1) {
        users.value = []
        totalPages.value = 1

        if (!term)
          counts.users = result.meta.total ?? 0

        return
      }

      if (page > result.meta.totalPages) {
        currentPage.value = result.meta.totalPages
        continue
      }

      users.value = result.rows
      totalPages.value = result.meta.totalPages

      if (!term)
        counts.users = result.meta.total ?? result.rows.length

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
    :title="$t('users.title')"
    :description="description"
    :loading="loading"
    :error-message="errorMessage"
    :is-empty="displayedUsers.length === 0"
    :empty-text="debouncedSearch ? $t('users.noResults') : $t('users.empty')"
    @retry="loadData"
  >
    <template #toolbar>
      <div class="max-w-sm">
        <SearchInput v-model="search" :placeholder="$t('users.searchPlaceholder')" :suggestions="suggestions" />
      </div>
    </template>

    <UsersTable :users="displayedUsers" />
  </ListCard>
</template>
