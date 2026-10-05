<script setup lang="ts">
import { ref } from 'vue'

import CreateButton from '@/components/CreateButton.vue'
import ListCard from '@/components/ListCard.vue'
import SearchInput from '@/components/SearchInput.vue'
import { Pagination } from '@/components/ui/pagination'
import { usePermissions } from '@/lib/permissions'

import { useUserList } from '@/views/users/composables/useUserList'
import UsersTable from '@/views/users/components/UsersTable.vue'
import UserFormDialog from '@/views/users/components/UserFormDialog.vue'

const { isAdmin } = usePermissions()

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

const formOpen = ref(false)

function openCreate() {
  if (!isAdmin.value)
    return
  formOpen.value = true
}
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
    <template #action>
      <CreateButton v-if="isAdmin" :label="$t('users.add')" @click="openCreate" />
    </template>

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

  <UserFormDialog
    v-if="isAdmin"
    v-model:open="formOpen"
    @saved="loadData"
  />
</template>
