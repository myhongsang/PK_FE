<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { PencilIcon, Trash2Icon } from '@lucide/vue'

import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { ProductItem } from '@/types/product'

const { t, locale } = useI18n()

defineProps<{
  products: ProductItem[]
}>()

const emit = defineEmits<{
  edit: [product: ProductItem]
  remove: [product: ProductItem]
}>()

function formatPrice(price: number | string) {
  if (typeof price !== 'number')
    return price

  return price.toLocaleString(locale.value === 'vi' ? 'vi-VN' : 'en-US')
}
</script>

<template>
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead class="w-16">{{ t('products.columns.id') }}</TableHead>
        <TableHead>{{ t('products.columns.name') }}</TableHead>
        <TableHead>{{ t('products.columns.description') }}</TableHead>
        <TableHead class="text-right">{{ t('products.columns.price') }}</TableHead>
        <TableHead class="text-center">{{ t('products.columns.stock') }}</TableHead>
        <TableHead class="w-28 text-right">{{ t('products.columns.actions') }}</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow v-for="item in products" :key="item.id">
        <TableCell class="text-muted-foreground">{{ item.id }}</TableCell>
        <TableCell class="font-medium">{{ item.name }}</TableCell>
        <TableCell class="text-muted-foreground">{{ item.description }}</TableCell>
        <TableCell class="text-right">{{ formatPrice(item.price) }}</TableCell>
        <TableCell class="text-center">{{ item.stock }}</TableCell>
        <TableCell>
          <div class="flex justify-end gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              :aria-label="t('products.editAction')"
              @click="emit('edit', item)"
            >
              <PencilIcon aria-hidden="true" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              class="text-destructive hover:text-destructive"
              :aria-label="t('products.deleteAction')"
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
