<script setup lang="ts">
import { PencilIcon, Trash2Icon } from '@lucide/vue'

import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { CategoryItem } from '@/types/category'

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
        <TableHead class="w-16">ID</TableHead>
        <TableHead>Tên danh mục</TableHead>
        <TableHead>Mô tả</TableHead>
        <TableHead class="w-28 text-right">Thao tác</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow v-for="item in categories" :key="item.id">
        <TableCell class="text-muted-foreground">{{ item.id }}</TableCell>
        <TableCell class="font-medium">{{ item.name }}</TableCell>
        <TableCell class="text-muted-foreground">{{ item.description }}</TableCell>
        <TableCell>
          <div class="flex justify-end gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Sửa danh mục"
              @click="emit('edit', item)"
            >
              <PencilIcon aria-hidden="true" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              class="text-destructive hover:text-destructive"
              aria-label="Xoá danh mục"
              @click="emit('remove', item)"
            >
              <Trash2Icon aria-hidden="true" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>
</template>
