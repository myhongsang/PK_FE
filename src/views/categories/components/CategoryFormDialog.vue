<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { LoaderCircleIcon } from '@lucide/vue'

import { createCategory, updateCategory } from '@/api/categories'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { CategoryItem, CategoryPayload } from '@/types/category'

const props = defineProps<{
  open: boolean
  editing: CategoryItem | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  saved: []
}>()

const { t } = useI18n()

const form = reactive({
  name: '',
  description: '',
})

const fieldErrors = reactive<{ name?: string }>({})
const formError = ref('')
const saving = ref(false)

const dialogTitle = computed(() =>
  props.editing ? t('categories.editTitle') : t('categories.createTitle'),
)

function resetForm() {
  if (props.editing) {
    form.name = props.editing.name === '—' ? '' : props.editing.name
    form.description = props.editing.description === '—' ? '' : props.editing.description
  } else {
    form.name = ''
    form.description = ''
  }
  fieldErrors.name = undefined
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

  if (!form.name.trim()) {
    fieldErrors.name = t('categories.nameRequired')
  }

  return !fieldErrors.name
}

async function onSubmit() {
  formError.value = ''
  if (!validate()) return

  saving.value = true
  try {
    const payload: CategoryPayload = {
      name: form.name.trim(),
      description: form.description.trim(),
    }

    if (props.editing) await updateCategory(props.editing.id, payload)
    else await createCategory(payload)

    emit('update:open', false)
    emit('saved')
  } catch (error) {
    formError.value =
      error instanceof Error ? error.message : t('common.genericError')
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
          {{ editing ? $t('categories.editDescription') : $t('categories.createDescription') }}
        </DialogDescription>
      </DialogHeader>

      <form class="grid gap-4" novalidate @submit.prevent="onSubmit">
        <div class="grid gap-2">
          <Label for="category-name">{{ $t('categories.name') }}</Label>
          <Input
            id="category-name"
            v-model="form.name"
            :placeholder="$t('categories.namePlaceholder')"
            :aria-invalid="fieldErrors.name ? true : undefined"
            :disabled="saving"
          />
          <p v-if="fieldErrors.name" class="text-xs text-destructive" role="alert">
            {{ fieldErrors.name }}
          </p>
        </div>

        <div class="grid gap-2">
          <Label for="category-description">{{ $t('categories.description') }}</Label>
          <Input
            id="category-description"
            v-model="form.description"
            :placeholder="$t('categories.descriptionPlaceholder')"
            :disabled="saving"
          />
        </div>

        <p v-if="formError" class="text-xs text-destructive" role="alert">
          {{ formError }}
        </p>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            :disabled="saving"
            @click="emit('update:open', false)"
          >
            {{ $t('common.cancel') }}
          </Button>
          <Button type="submit" :disabled="saving">
            <LoaderCircleIcon v-if="saving" class="animate-spin" aria-hidden="true" />
            {{ editing ? $t('common.save') : $t('categories.add') }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
