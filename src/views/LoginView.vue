<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { EyeIcon, EyeOffIcon, LoaderCircleIcon } from '@lucide/vue'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { login, type LoginResult } from '@/api/auth'

const emit = defineEmits<{
  loggedIn: [LoginResult]
}>()

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
    fieldErrors.email = 'Vui lòng nhập email.'
  }
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    fieldErrors.email = 'Địa chỉ email không hợp lệ.'
  }

  if (!form.password) {
    fieldErrors.password = 'Vui lòng nhập mật khẩu.'
  }
  else if (form.password.length < 6) {
    fieldErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự.'
  }

  return !fieldErrors.email && !fieldErrors.password
}

async function onSubmit() {
  formError.value = ''

  if (!validate())
    return

  loading.value = true
  try {
    const result = await login({
      email: form.email.trim(),
      password: form.password,
    })

    emit('loggedIn', result)
  }
  catch (error) {
    formError.value = error instanceof Error
      ? error.message
      : 'An error occurred. Please try again.'
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="grid min-h-svh w-full">
    <div class="relative flex items-center justify-center bg-background p-6 md:p-10">
      <div class="w-full max-w-sm space-y-6">
        <div class="flex flex-col gap-1.5">
          <h1 class="text-2xl font-bold tracking-tight text-foreground">
            Đăng nhập
          </h1>
          <p class="text-sm text-muted-foreground">
            Nhập email và mật khẩu để truy cập tài khoản của bạn.
          </p>
        </div>

        <Card class="shadow-lg shadow-zinc-950/5">
          <CardHeader>
            <CardTitle class="text-lg">
              Chào mừng trở lại
            </CardTitle>
            <CardDescription>
              Đăng nhập để tiếp tục sử dụng hệ thống.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form class="grid gap-4" novalidate @submit.prevent="onSubmit">
              <!-- Email -->
              <div class="grid gap-2">
                <Label for="email">Email</Label>
                <Input
                  id="email"
                  v-model="form.email"
                  type="email"
                  placeholder="email@email.com"
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
                  <Label for="password">Mật khẩu</Label>
                </div>
                <div class="relative">
                  <Input
                    id="password"
                    v-model="form.password"
                    :type="showPassword ? 'text' : 'password'"
                    placeholder="••••••••"
                    autocomplete="current-password"
                    class="pr-10"
                    :aria-invalid="fieldErrors.password ? true : undefined"
                    :disabled="loading"
                  />
                  <button
                    type="button"
                    class="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                    :aria-label="showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'"
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
                {{ loading ? 'Đang đăng nhập…' : 'Đăng nhập' }}
              </Button>
            </form>
          </CardContent>

          <CardFooter class="flex-col gap-3">
            <p class="text-xs text-muted-foreground">
              Chưa có tài khoản?
              <a
                href="#"
                class="font-medium text-foreground underline-offset-4 hover:underline"
              >Đăng ký ngay</a>
            </p>
          </CardFooter>
        </Card>

      </div>
    </div>
  </div>


</template>
