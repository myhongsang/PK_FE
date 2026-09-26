import { watch, type Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export function parsePageQuery(value: unknown): number {
  const parsed = Number(value)

  return Number.isInteger(parsed) && parsed >= 1 ? parsed : 1
}

export function usePageQuery(currentPage: Ref<number>) {
  const route = useRoute()
  const router = useRouter()

  currentPage.value = parsePageQuery(route.query.page)

  watch(currentPage, (page) => {
    const nextPage = String(page)

    if (route.query.page === nextPage)
      return

    void router.replace({ query: { ...route.query, page: nextPage } })
  })
}
