<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { EyeIcon, EyeOffIcon, LoaderCircleIcon } from '@lucide/vue'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import { login, } from '@/api/auth'

const router = useRouter()
const { t } = useI18n()

const form = reactive({
  email: '',
  password: '',
})

const fieldErrors = reactive<{ email?: string, password?: string }>({})
const formError = ref('')
const loading = ref(false)
const showPassword = ref(false)

const emailInvalid = computed(() => Boolean(fieldErrors.email))

function validate(): boolean {
  fieldErrors.email = undefined
  fieldErrors.password = undefined

  if (!form.email.trim()) {
    fieldErrors.email = t('auth.emailRequired')
  }
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    fieldErrors.email = t('auth.emailInvalid')
  }

  if (!form.password) {
    fieldErrors.password = t('auth.passwordRequired')
  }
  else if (form.password.length < 6) {
    fieldErrors.password = t('auth.passwordTooShort')
  }

  return !fieldErrors.email && !fieldErrors.password
}

async function onSubmit() {
  formError.value = ''

  if (!validate())
    return

  loading.value = true
  try {
    await login({
      email: form.email.trim(),
      password: form.password,
    })

    router.replace('/dashboard')
  }
  catch (error) {
    formError.value = error instanceof Error
      ? error.message
      : t('common.genericError')
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="grid min-h-svh w-full">
    <div class="relative flex items-center justify-center bg-background p-6 md:p-10">
      <div class="absolute right-4 top-4">
        <LanguageSwitcher tone="light" />
      </div>

      <div class="w-full max-w-sm space-y-6">
        <div class="flex flex-col gap-1.5">
          <h1 class="text-2xl font-bold tracking-tight text-foreground">
            {{ $t('auth.title') }}
          </h1>
          <p class="text-sm text-muted-foreground">
            {{ $t('auth.subtitle') }}
          </p>
        </div>

        <Card class="shadow-lg shadow-zinc-950/5">
          <CardContent>
            <form class="grid gap-4" novalidate @submit.prevent="onSubmit">
              <div class="grid gap-2">
                <Label for="email">{{ $t('auth.email') }}</Label>
                <Input
                  id="email"
                  v-model="form.email"
                  type="email"
                  :placeholder="$t('auth.emailPlaceholder')"
                  autocomplete="email"
                  :aria-invalid="emailInvalid || undefined"
                  :disabled="loading"
                />
                <p v-if="fieldErrors.email" class="text-xs text-destructive" role="alert">
                  {{ fieldErrors.email }}
                </p>
              </div>

              <div class="grid gap-2">
                <div class="flex items-center justify-between">
                  <Label for="password">{{ $t('auth.password') }}</Label>
                </div>
                <div class="relative">
                  <Input
                    id="password"
                    v-model="form.password"
                    :type="showPassword ? 'text' : 'password'"
                    :placeholder="$t('auth.passwordPlaceholder')"
                    autocomplete="current-password"
                    class="pr-10"
                    :aria-invalid="fieldErrors.password ? true : undefined"
                    :disabled="loading"
                  />
                  <button
                    type="button"
                    class="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                    :aria-label="showPassword ? $t('auth.hidePassword') : $t('auth.showPassword')"
                    tabindex="-1"
                    @click="showPassword = !showPassword"
                  >
                    <EyeOffIcon v-if="showPassword" class="size-4" />
                    <EyeIcon v-else class="size-4" />
                  </button>
                </div>
                <p v-if="fieldErrors.password" class="text-xs text-destructive" role="alert">
                  {{ fieldErrors.password }}
                </p>
              </div>

              <Alert v-if="formError" variant="destructive">
                <AlertDescription>{{ formError }}</AlertDescription>
              </Alert>

              <Button type="submit" class="w-full" :disabled="loading">
                <LoaderCircleIcon v-if="loading" class="animate-spin" aria-hidden="true" />
                {{ loading ? $t('auth.submitting') : $t('auth.submit') }}
              </Button>
            </form>
          </CardContent>
        </Card>

      </div>
    </div>
  </div>


</template>
