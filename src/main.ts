import { createApp } from 'vue'
import { VueQueryPlugin } from '@tanstack/vue-query'

import '@/style.css'
import App from '@/App.vue'
import i18n from '@/i18n'
import { queryClient } from '@/lib/query-client'
import router from '@/router'
import { initTheme } from '@/stores/theme'

initTheme()
document.documentElement.lang = i18n.global.locale.value

createApp(App)
  .use(i18n)
  .use(router)
  .use(VueQueryPlugin, { queryClient })
  .mount('#app')

