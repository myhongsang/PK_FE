<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import TableRowActions from '@/components/TableRowActions.vue'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { CategoryItem } from '@/types/category'

const { t } = useI18n()

defineProps<{
  categories: CategoryItem[]
}>()

const emit = defineEmits<{
  edit: [category: CategoryItem]
  remove: [category: CategoryItem]
}>()
</script>

<template>
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead class="w-16">{{ t('categories.columns.id') }}</TableHead>
        <TableHead>{{ t('categories.columns.name') }}</TableHead>
        <TableHead>{{ t('categories.columns.description') }}</TableHead>
        <TableHead class="w-28 text-right">{{ t('categories.columns.actions') }}</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow v-for="item in categories" :key="item.id">
        <TableCell class="text-muted-foreground">{{ item.id }}</TableCell>
        <TableCell class="font-medium">{{ item.name }}</TableCell>
        <TableCell class="text-muted-foreground">{{ item.description }}</TableCell>
        <TableCell>
          <TableRowActions
            :edit-label="t('categories.editAction')"
            :delete-label="t('categories.deleteAction')"
            @edit="emit('edit', item)"
            @delete="emit('remove', item)"
          />
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>
</template>
