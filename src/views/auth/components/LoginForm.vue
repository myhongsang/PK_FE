<script setup lang="ts">
import { EyeIcon, EyeOffIcon, LoaderCircleIcon } from '@lucide/vue'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { useLogin } from '@/views/auth/composables/useLogin'

const {
  form,
  fieldErrors,
  formError,
  loading,
  showPassword,
  remember,
  emailInvalid,
  sessionExpired,
  onSubmit,
} = useLogin()
</script>

<template>
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

        <div class="flex items-center gap-2">
          <Checkbox
            id="remember"
            :model-value="remember"
            :disabled="loading"
            @update:model-value="remember = $event === true"
          />
          <Label for="remember" class="text-sm font-normal">{{ $t('auth.rememberMe') }}</Label>
        </div>

        <Alert v-if="sessionExpired">
          <AlertDescription>{{ $t('auth.sessionExpired') }}</AlertDescription>
        </Alert>

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
</template>
