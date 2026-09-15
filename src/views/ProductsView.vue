<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import { getProducts } from '@/api/products'
import ProductsTable from '@/components/ProductsTable.vue'
import ListCard from '@/components/ListCard.vue'
import { counts } from '@/stores/counts'
import type { ProductItem } from '@/types/product'

const products = ref<ProductItem[]>([])
const loading = ref(false)
const errorMessage = ref('')

const description = computed(() =>
  `Đang hiển thị ${products.value.length} bản ghi.`,
)

async function loadData() {
  loading.value = true
  errorMessage.value = ''

  try {
    products.value = await getProducts()
    counts.products = products.value.length
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
    title="Danh sách sản phẩm"
    :description="description"
    :loading="loading"
    :error-message="errorMessage"
    :is-empty="products.length === 0"
    empty-text="Chưa có sản phẩm nào."
    @retry="loadData"
  >
    <ProductsTable :products="products" />
  </ListCard>
</template>
