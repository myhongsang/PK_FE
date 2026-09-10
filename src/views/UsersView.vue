<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import { getUsers } from '@/api/users'
import UsersTable from '@/components/UsersTable.vue'
import ListCard from '@/components/ListCard.vue'
import { counts } from '@/stores/counts'
import type { UserItem } from '@/types/user'

const users = ref<UserItem[]>([])
const loading = ref(false)
const errorMessage = ref('')

const description = computed(() =>
  `Đang hiển thị ${users.value.length} bản ghi.`,
)

async function loadData() {
  loading.value = true
  errorMessage.value = ''

  try {
    users.value = await getUsers()
    counts.users = users.value.length
  }
  catch (error) {
    errorMessage.value = error instanceof Error
      ? error.message
      : 'Unable to load data. Please try again.'
  }
  finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>

<template>
  <ListCard
    title="Danh sách người dùng"
    :description="description"
    :loading="loading"
    :error-message="errorMessage"
    :is-empty="users.length === 0"
    empty-text="Chưa có người dùng nào."
    @retry="loadData"
  >
    <UsersTable :users="users" />
  </ListCard>
</template>
