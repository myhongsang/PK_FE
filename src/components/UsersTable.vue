<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { UserItem } from '@/types/user'

const { t } = useI18n()

defineProps<{
  users: UserItem[]
}>()
</script>

<template>
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead class="w-16">{{ t('users.columns.id') }}</TableHead>
        <TableHead>{{ t('users.columns.name') }}</TableHead>
        <TableHead>{{ t('users.columns.email') }}</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow v-for="item in users" :key="item.id">
        <TableCell class="text-muted-foreground">{{ item.id }}</TableCell>
        <TableCell class="font-medium">{{ item.name }}</TableCell>
        <TableCell class="text-muted-foreground">{{ item.email }}</TableCell>
      </TableRow>
    </TableBody>
  </Table>
</template>
