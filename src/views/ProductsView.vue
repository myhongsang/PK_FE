<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { getProducts } from '@/api/products'
import ProductsTable from '@/components/ProductsTable.vue'
import ListCard from '@/components/ListCard.vue'
import { counts } from '@/stores/counts'
import type { ProductItem } from '@/types/product'

const { t } = useI18n()

const products = ref<ProductItem[]>([])
const loading = ref(false)
const errorMessage = ref('')

const description = computed(() =>
  t('common.showing', { count: products.value.length }),
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
    :title="$t('products.title')"
    :description="description"
    :loading="loading"
    :error-message="errorMessage"
    :is-empty="products.length === 0"
    :empty-text="$t('products.empty')"
    @retry="loadData"
  >
    <ProductsTable :products="products" />
  </ListCard>
</template>
