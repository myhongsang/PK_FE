import i18n from '@/i18n'
import { API_ENDPOINTS } from '@/constants/api'
import { fetchRowsPage } from '@/api/search'

import type { PageResult } from '@/types/pagination'
import type { ProductItem } from '@/types/product'

function mapProduct(raw: any): ProductItem {
  return {
    id: raw?.id,
    name: raw?.name ?? raw?.title ?? '—',
    description: raw?.description ?? raw?.desc ?? '—',
    price: raw?.price ?? '—',
    stock: raw?.stock ?? raw?.quantity ?? 0,
  }
}

export async function getProducts(
  search?: string,
  page = 1,
): Promise<PageResult<ProductItem>> {
  try {
    const term = search?.trim() ?? ''

    const result = await fetchRowsPage<ProductItem>(
      API_ENDPOINTS.PRODUCTS,
      page,
      term ? { q: term } : undefined,
    )

    return {
      rows: result.rows.map(mapProduct),
      meta: result.meta,
    }
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
      i18n.global.t('products.loadFailed')
    )
  }
}