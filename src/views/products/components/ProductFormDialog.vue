<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { LoaderCircleIcon } from '@lucide/vue'

import { createProduct, updateProduct } from '@/api/products'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { hasNumberInput, parseIntegerInput, parseNumberInput } from '@/lib/price'
import type { CategoryItem } from '@/types/category'
import type { ProductItem, ProductPayload } from '@/types/product'
import type { ProductFormData } from '../types'

const props = defineProps<{
  open: boolean
  editing: ProductItem | null
  categoryOptions: CategoryItem[]
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  saved: []
}>()

const { t } = useI18n()

const form = reactive<ProductFormData>({
  name: '',
  description: '',
  price: '',
  stock: '',
  categoryId: '',
})

const fieldErrors = reactive<{ name?: string; price?: string; stock?: string }>({})
const formError = ref('')
const saving = ref(false)

const dialogTitle = computed(() =>
  props.editing ? t('products.editTitle') : t('products.createTitle'),
)

function resetForm() {
  if (props.editing) {
    form.name = props.editing.name === '—' ? '' : props.editing.name
    form.description = props.editing.description === '—' ? '' : props.editing.description
    form.price = props.editing.price === '—' ? '' : String(props.editing.price)
    form.stock = String(props.editing.stock)
    form.categoryId = props.editing.categoryId ? String(props.editing.categoryId) : ''
  } else {
    form.name = ''
    form.description = ''
    form.price = ''
    form.stock = ''
    form.categoryId = ''
  }
  fieldErrors.name = undefined
  fieldErrors.price = undefined
  fieldErrors.stock = undefined
  formError.value = ''
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) resetForm()
  },
)

function validate(): boolean {
  fieldErrors.name = undefined
  fieldErrors.price = undefined
  fieldErrors.stock = undefined

  if (!String(form.name ?? '').trim())
    fieldErrors.name = t('products.nameRequired')

  if (hasNumberInput(form.price) && parseNumberInput(form.price) === undefined)
    fieldErrors.price = t('products.priceInvalid')

  if (hasNumberInput(form.stock) && parseIntegerInput(form.stock) === undefined)
    fieldErrors.stock = t('products.stockInvalid')

  return !fieldErrors.name && !fieldErrors.price && !fieldErrors.stock
}

async function onSubmit() {
  formError.value = ''
  if (!validate()) return

  saving.value = true
  try {
    const price = parseNumberInput(form.price)
    const stock = parseIntegerInput(form.stock)

    const payload: ProductPayload = {
      name: String(form.name ?? '').trim(),
      description: String(form.description ?? '').trim(),
    }
    if (price !== undefined) payload.price = price
    if (stock !== undefined) payload.stock = stock
    if (form.categoryId) payload.categoryId = form.categoryId

    if (props.editing) await updateProduct(props.editing.id, payload)
    else await createProduct(payload)

    emit('update:open', false)
    emit('saved')
  } catch (error) {
    formError.value = error instanceof Error ? error.message : t('common.genericError')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Dialog :open="open" @update:open="(val) => emit('update:open', val)">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{{ dialogTitle }}</DialogTitle>
        <DialogDescription>
          {{ editing ? $t('products.editDescription') : $t('products.createDescription') }}
        </DialogDescription>
      </DialogHeader>

      <form class="grid gap-4" novalidate @submit.prevent="onSubmit">
        <div class="grid gap-2">
          <Label for="product-name">{{ $t('products.name') }}</Label>
          <Input
            id="product-name"
            v-model="form.name"
            :placeholder="$t('products.namePlaceholder')"
            :aria-invalid="fieldErrors.name ? true : undefined"
            :disabled="saving"
          />
          <p v-if="fieldErrors.name" class="text-xs text-destructive" role="alert">
            {{ fieldErrors.name }}
          </p>
        </div>

        <div class="grid gap-2">
          <Label for="product-category">{{ $t('products.category') }}</Label>
          <select
            id="product-category"
            v-model="form.categoryId"
            class="border-input dark:bg-input/30 flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            :disabled="saving"
          >
            <option value="">{{ $t('products.noCategory') }}</option>
            <option v-for="category in categoryOptions" :key="String(category.id)" :value="String(category.id)">
              {{ category.name }}
            </option>
          </select>
        </div>

        <div class="grid gap-2">
          <Label for="product-description">{{ $t('products.description') }}</Label>
          <Input
            id="product-description"
            v-model="form.description"
            :placeholder="$t('products.descriptionPlaceholder')"
            :disabled="saving"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="grid gap-2">
            <Label for="product-price">{{ $t('products.price') }}</Label>
            <Input
              id="product-price"
              v-model="form.price"
              type="number"
              min="0"
              step="0.01"
              :placeholder="$t('products.pricePlaceholder')"
              :aria-invalid="fieldErrors.price ? true : undefined"
              :disabled="saving"
            />
            <p v-if="fieldErrors.price" class="text-xs text-destructive" role="alert">
              {{ fieldErrors.price }}
            </p>
          </div>

          <div class="grid gap-2">
            <Label for="product-stock">{{ $t('products.stock') }}</Label>
            <Input
              id="product-stock"
              v-model="form.stock"
              type="number"
              min="0"
              step="1"
              :placeholder="$t('products.stockPlaceholder')"
              :aria-invalid="fieldErrors.stock ? true : undefined"
              :disabled="saving"
            />
            <p v-if="fieldErrors.stock" class="text-xs text-destructive" role="alert">
              {{ fieldErrors.stock }}
            </p>
          </div>
        </div>

        <p v-if="formError" class="text-xs text-destructive" role="alert">
          {{ formError }}
        </p>

        <DialogFooter>
          <Button type="button" variant="outline" :disabled="saving" @click="emit('update:open', false)">
            {{ $t('common.cancel') }}
          </Button>
          <Button type="submit" :disabled="saving">
            <LoaderCircleIcon v-if="saving" class="animate-spin" aria-hidden="true" />
            {{ editing ? $t('common.save') : $t('products.add') }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
