<script setup lang="ts">
import ListCard from '@/components/ListCard.vue'
import SearchInput from '@/components/SearchInput.vue'
import { Pagination } from '@/components/ui/pagination'

import { useUserList } from '@/views/users/composables/useUserList'
import UsersTable from '@/views/users/components/UsersTable.vue'

const {
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
} = useUserList()
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
        <SearchInput
          v-model="search"
          :placeholder="$t('users.searchPlaceholder')"
          :suggestions="suggestions"
        />
      </div>
    </template>

    <UsersTable :users="displayedUsers" />

    <Pagination
      :current-page="currentPage"
      :total-pages="totalPages"
      :disabled="loading"
      @update:current-page="goToPage"
    />
  </ListCard>
</template>
