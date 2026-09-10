<script setup lang="ts">
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { ProductItem } from '@/types/product'

defineProps<{
  products: ProductItem[]
}>()

function formatPrice(price: number | string) {
  return typeof price === 'number' ? price.toLocaleString('vi-VN') : price
}
</script>

<template>
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead class="w-16">ID</TableHead>
        <TableHead>Tên sản phẩm</TableHead>
        <TableHead>Mô tả</TableHead>
        <TableHead class="text-right">Giá</TableHead>
        <TableHead class="text-center">Số lượng</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow v-for="item in products" :key="item.id">
        <TableCell class="text-muted-foreground">{{ item.id }}</TableCell>
        <TableCell class="font-medium">{{ item.name }}</TableCell>
        <TableCell class="text-muted-foreground">{{ item.description }}</TableCell>
        <TableCell class="text-right">{{ formatPrice(item.price) }}</TableCell>
        <TableCell class="text-center">{{ item.stock }}</TableCell>
      </TableRow>
    </TableBody>
  </Table>
</template>
