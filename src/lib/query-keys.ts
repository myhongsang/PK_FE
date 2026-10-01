export interface ListQueryParams {
  page?: number
  q?: string
  categoryId?: string
  minPrice?: number
  maxPrice?: number
}

export const queryKeys = {
  products: {
    all: ['products'] as const,
    list: (params: ListQueryParams) => ['products', 'list', params] as const,
    suggest: (params: ListQueryParams) => ['products', 'suggest', params] as const,
    probe: (params: ListQueryParams) => ['products', 'probe', params] as const,
  },
  categories: {
    all: ['categories'] as const,
    list: (params: ListQueryParams) => ['categories', 'list', params] as const,
    suggest: (params: ListQueryParams) => ['categories', 'suggest', params] as const,
    options: ['categories', 'options'] as const,
  },
  users: {
    all: ['users'] as const,
    list: (params: ListQueryParams) => ['users', 'list', params] as const,
    suggest: (params: ListQueryParams) => ['users', 'suggest', params] as const,
  },
} as const
