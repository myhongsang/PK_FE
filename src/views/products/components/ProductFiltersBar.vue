<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import SearchInput from '@/components/SearchInput.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { SearchSuggestion } from '@/lib/search'
import type { CategoryItem } from '@/types/category'

const props = defineProps<{
  categoryOptions: CategoryItem[]
  suggestions: SearchSuggestion[]
}>()

const search = defineModel<string>('search', { required: true })
const categoryId = defineModel<string>('categoryId', { required: true })
const minPrice = defineModel<string | number>('minPrice', { required: true })
const maxPrice = defineModel<string | number>('maxPrice', { required: true })

const emit = defineEmits<{
  clear: []
}>()

const { t } = useI18n()
</script>

<template>
  <div class="flex flex-wrap items-end gap-3">
    <div class="min-w-60 grow">
      <SearchInput
        v-model="search"
        :placeholder="t('products.searchPlaceholder')"
        :suggestions="suggestions"
      />
    </div>

    <div class="grid gap-1.5">
      <Label for="filter-category" class="text-xs text-muted-foreground">{{ t('products.category') }}</Label>
      <select
        id="filter-category"
        v-model="categoryId"
        class="border-input dark:bg-input/30 flex h-9 w-48 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-3 md:text-sm"
      >
        <option value="">{{ t('products.allCategories') }}</option>
        <option
          v-for="category in categoryOptions"
          :key="String(category.id)"
          :value="String(category.id)"
        >
          {{ category.name }}
        </option>
      </select>
    </div>

    <div class="grid gap-1.5">
      <Label for="filter-min-price" class="text-xs text-muted-foreground">{{ t('products.priceFrom') }}</Label>
      <Input
        id="filter-min-price"
        v-model="minPrice"
        type="number"
        min="0"
        class="w-32"
        :placeholder="t('products.priceMinPlaceholder')"
      />
    </div>

    <div class="grid gap-1.5">
      <Label for="filter-max-price" class="text-xs text-muted-foreground">{{ t('products.priceTo') }}</Label>
      <Input
        id="filter-max-price"
        v-model="maxPrice"
        type="number"
        min="0"
        class="w-32"
        :placeholder="t('products.priceMaxPlaceholder')"
      />
    </div>

    <Button
      variant="outline"
      size="sm"
      class="text-muted-foreground"
      @click="emit('clear')"
    >
      {{ t('products.clearFilters') }}
    </Button>
  </div>
</template>
