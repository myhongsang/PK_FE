<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { LoaderCircleIcon } from '@lucide/vue'

import { createUser } from '@/api/users'
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
import { ROLE_ADMIN, ROLE_EMPLOYEE, type UserRole } from '@/constants/role'
import type { CreateUserPayload } from '@/types/user'

const emit = defineEmits<{
  'update:open': [value: boolean]
  saved: []
}>()

defineProps<{
  open: boolean
}>()

const { t } = useI18n()

const form = reactive({
  name: '',
  email: '',
  password: '',
  role: ROLE_EMPLOYEE as UserRole,
})

const fieldErrors = reactive<{ name?: string; email?: string; password?: string }>({})
const formError = ref('')
const saving = ref(false)

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function resetForm() {
  form.name = ''
  form.email = ''
  form.password = ''
  form.role = ROLE_EMPLOYEE
  fieldErrors.name = undefined
  fieldErrors.email = undefined
  fieldErrors.password = undefined
  formError.value = ''
}

function onOpenChange(isOpen: boolean) {
  if (isOpen)
    resetForm()
  emit('update:open', isOpen)
}

function validate(): boolean {
  fieldErrors.name = undefined
  fieldErrors.email = undefined
  fieldErrors.password = undefined

  if (!form.name.trim())
    fieldErrors.name = t('users.nameRequired')

  if (!form.email.trim())
    fieldErrors.email = t('users.emailRequired')
  else if (!EMAIL_PATTERN.test(form.email.trim()))
    fieldErrors.email = t('users.emailInvalid')

  if (!form.password)
    fieldErrors.password = t('users.passwordRequired')
  else if (form.password.length < 6)
    fieldErrors.password = t('users.passwordTooShort')

  return !fieldErrors.name && !fieldErrors.email && !fieldErrors.password
}

async function onSubmit() {
  formError.value = ''
  if (!validate())
    return

  saving.value = true
  try {
    const payload: CreateUserPayload = {
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      role: form.role === ROLE_ADMIN ? ROLE_ADMIN : ROLE_EMPLOYEE,
    }

    await createUser(payload)

    emit('update:open', false)
    emit('saved')
  } catch (error) {
    formError.value
      = error instanceof Error ? error.message : t('common.genericError')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Dialog :open="open" @update:open="onOpenChange">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{{ $t('users.createTitle') }}</DialogTitle>
        <DialogDescription>
          {{ $t('users.createDescription') }}
        </DialogDescription>
      </DialogHeader>

      <form class="grid gap-4" novalidate @submit.prevent="onSubmit">
        <div class="grid gap-2">
          <Label for="user-name">{{ $t('users.name') }}</Label>
          <Input
            id="user-name"
            v-model="form.name"
            :placeholder="$t('users.namePlaceholder')"
            :aria-invalid="fieldErrors.name ? true : undefined"
            :disabled="saving"
          />
          <p v-if="fieldErrors.name" class="text-xs text-destructive" role="alert">
            {{ fieldErrors.name }}
          </p>
        </div>

        <div class="grid gap-2">
          <Label for="user-email">{{ $t('users.email') }}</Label>
          <Input
            id="user-email"
            v-model="form.email"
            type="email"
            :placeholder="$t('users.emailPlaceholder')"
            :aria-invalid="fieldErrors.email ? true : undefined"
            :disabled="saving"
          />
          <p v-if="fieldErrors.email" class="text-xs text-destructive" role="alert">
            {{ fieldErrors.email }}
          </p>
        </div>

        <div class="grid gap-2">
          <Label for="user-password">{{ $t('users.password') }}</Label>
          <Input
            id="user-password"
            v-model="form.password"
            type="password"
            :placeholder="$t('users.passwordPlaceholder')"
            :aria-invalid="fieldErrors.password ? true : undefined"
            :disabled="saving"
          />
          <p v-if="fieldErrors.password" class="text-xs text-destructive" role="alert">
            {{ fieldErrors.password }}
          </p>
        </div>

        <div class="grid gap-2">
          <Label for="user-role">{{ $t('users.role') }}</Label>
          <select
            id="user-role"
            v-model="form.role"
            class="border-input dark:bg-input/30 flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            :disabled="saving"
          >
            <option :value="ROLE_EMPLOYEE">{{ $t('users.roleEmployee') }}</option>
            <option :value="ROLE_ADMIN">{{ $t('users.roleAdmin') }}</option>
          </select>
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
            {{ $t('users.add') }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
