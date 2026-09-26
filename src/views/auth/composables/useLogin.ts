import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

import { getRememberedEmail, getRememberPreference, login } from '@/api/auth'

export function useLogin() {
  const router = useRouter()
  const route = useRoute()
  const { t } = useI18n()

  const loading = ref(false)
  const showPassword = ref(false)
  const remember = ref(getRememberPreference())
  const rememberedEmail = getRememberedEmail()

  const form = reactive({
    email: rememberedEmail,
    password: '',
  })

  const fieldErrors = reactive<{ email?: string; password?: string }>({})
  const formError = ref('')

  const emailInvalid = computed(() => Boolean(fieldErrors.email))
  const sessionExpired = computed(() => route.query.reason === 'expired')

  function validate(): boolean {
    fieldErrors.email = undefined
    fieldErrors.password = undefined

    if (!form.email.trim()) {
      fieldErrors.email = t('auth.emailRequired')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      fieldErrors.email = t('auth.emailInvalid')
    }

    if (!form.password) {
      fieldErrors.password = t('auth.passwordRequired')
    } else if (form.password.length < 6) {
      fieldErrors.password = t('auth.passwordTooShort')
    }

    return !fieldErrors.email && !fieldErrors.password
  }

  async function onSubmit() {
    formError.value = ''

    if (!validate()) return

    loading.value = true
    try {
      await login({
        email: form.email.trim(),
        password: form.password,
        remember: remember.value,
      })

      router.replace('/dashboard')
    } catch (error) {
      formError.value =
        error instanceof Error ? error.message : t('common.genericError')
    } finally {
      loading.value = false
    }
  }

  return {
    form,
    fieldErrors,
    formError,
    loading,
    showPassword,
    remember,
    emailInvalid,
    sessionExpired,
    onSubmit,
  }
}
