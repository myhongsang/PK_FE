<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { getUsers } from '@/api/users'
import UsersTable from '@/components/UsersTable.vue'
import ListCard from '@/components/ListCard.vue'
import { counts } from '@/stores/counts'
import type { UserItem } from '@/types/user'

const { t } = useI18n()

const users = ref<UserItem[]>([])
const loading = ref(false)
const errorMessage = ref('')

const description = computed(() =>
  t('common.showing', { count: users.value.length }),
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
      : t('common.unableToLoad')
  }
  finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>

<template>
  <ListCard
    :title="$t('users.title')"
    :description="description"
    :loading="loading"
    :error-message="errorMessage"
    :is-empty="users.length === 0"
    :empty-text="$t('users.empty')"
    @retry="loadData"
  >
    <UsersTable :users="users" />
  </ListCard>
</template>
