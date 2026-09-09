<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { LoaderCircleIcon, LogOutIcon, PackageIcon, RefreshCwIcon, TriangleAlertIcon, UsersIcon,} from '@lucide/vue'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getProducts, type ProductItem } from '@/api/products'
import { getUsers, type UserItem } from '@/api/users'
import type { LoginResult } from '@/api/auth'

const props = defineProps<{
  user: LoginResult
}>()

const emit = defineEmits<{
  signOut: []
}>()

type TabKey = 'users' | 'products'

const activeTab = ref<TabKey>('users')
const users = ref<UserItem[]>([])
const products = ref<ProductItem[]>([])
const loading = ref(false)
const errorMessage = ref('')

const displayName = computed(() =>
  props.user?.user?.name || props.user?.user?.email || 'Người dùng',
)
const avatarLetter = computed(() =>
  (displayName.value || 'U').charAt(0).toUpperCase(),
)
const isEmpty = computed(() =>
  activeTab.value === 'users' ? users.value.length === 0 : products.value.length === 0,
)

function formatPrice(price: number | string) {
  return typeof price === 'number' ? price.toLocaleString('vi-VN') : price
}

async function loadData() {
  loading.value = true
  errorMessage.value = ''

  try {
    if (activeTab.value === 'users')
      users.value = await getUsers()
    else
      products.value = await getProducts()
  }
  catch (error) {
    errorMessage.value = error instanceof Error
      ? error.message
      : 'Không thể tải dữ liệu. Vui lòng thử lại.'
  }
  finally {
    loading.value = false
  }
}

function switchTab(tab: TabKey) {
  if (activeTab.value === tab)
    return

  activeTab.value = tab
  loadData()
}

onMounted(loadData)
</script>

<template>
  <div class="flex h-svh flex-col bg-background">
    <header class="flex h-14 shrink-0 items-center justify-between border-b bg-[#16587B] px-4 md:px-6 text-white">
      <div class="flex items-center gap-2">
        <span class="flex size-8 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground">PK</span>
        <span class="text-sm font-semibold">PK Dashboard</span>
      </div>

      <div class="flex items-center gap-3">
        <div class="hidden text-right sm:block">
          <p class="text-sm leading-none font-medium">{{ displayName }}</p>
          <p class="text-muted-foreground mt-1 text-xs">{{ user?.user?.email }}</p>
        </div>
        <span class="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary uppercase">
          {{ avatarLetter }}
        </span>
      </div>
    </header>

    <div class="flex min-h-0 flex-1">
      <aside class="hidden w-56 shrink-0 flex-col border-r bg-[#84B3CE] p-3 sm:flex">
        <p class="text-muted-foreground px-3 pb-2 pt-1 text-xs font-medium tracking-wide uppercase">Chức năng</p>
        <nav class="grid gap-1">
          <button
            type="button"
            class="inline-flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors"
            :class="activeTab === 'users' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-foreground'"
            @click="switchTab('users')"
          >
            <UsersIcon class="size-4" aria-hidden="true" />
            Người dùng
            <span class="ml-auto rounded-full bg-primary/10 px-1.5 py-0.5 text-xs text-primary">{{ users.length }}</span>
          </button>

          <button
            type="button"
            class="inline-flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors"
            :class="activeTab === 'products' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-foreground'"
            @click="switchTab('products')"
          >
            <PackageIcon class="size-4" aria-hidden="true" />
            Sản phẩm
            <span class="ml-auto rounded-full bg-primary/10 px-1.5 py-0.5 text-xs text-primary">{{ products.length }}</span>
          </button>
        </nav>

        <div class="mt-auto border-t pt-3">
          <button
            type="button"
            class="inline-flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
            @click="emit('signOut')"
          >
            <LogOutIcon class="size-4" aria-hidden="true" />
            Đăng xuất
          </button>
        </div>
      </aside>

      <main class="min-w-0 flex-1 space-y-6 overflow-y-auto bg-[#F5EEDD] p-4 md:p-6">
        <Card class="shadow-lg shadow-zinc-950/5">
          <CardHeader>
            <CardTitle class="text-lg">
              Danh sách {{ activeTab === 'users' ? 'người dùng' : 'sản phẩm' }}
            </CardTitle>
            <CardDescription>
              Đang hiển thị {{ activeTab === 'users' ? users.length : products.length }} bản ghi.
            </CardDescription>
          </CardHeader>

          <CardContent class="grid gap-4">
            <Alert v-if="errorMessage" variant="destructive">
              <TriangleAlertIcon aria-hidden="true" />
              <AlertDescription class="flex flex-wrap items-center justify-between gap-3">
                <span>{{ errorMessage }}</span>
                <Button size="sm" variant="outline" @click="loadData">
                  <RefreshCwIcon aria-hidden="true" />
                  Thử lại
                </Button>
              </AlertDescription>
            </Alert>

            <div v-if="loading" class="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
              <LoaderCircleIcon class="size-5 animate-spin" aria-hidden="true" />
              Đang tải dữ liệu…
            </div>

            <p v-else-if="isEmpty" class="py-12 text-center text-sm text-muted-foreground">
              {{ activeTab === 'users' ? 'Chưa có người dùng nào.' : 'Chưa có sản phẩm nào.' }}
            </p>

            <Table v-else-if="activeTab === 'users'">
              <TableHeader>
                <TableRow>
                  <TableHead class="w-16">ID</TableHead>
                  <TableHead>Tên</TableHead>
                  <TableHead>Email</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="item in users" :key="item.id">
                  <TableCell class="text-muted-foreground">{{ item.id }}</TableCell>
                  <TableCell class="font-medium">{{ item.name }}</TableCell>
                  <TableCell class="text-muted-foreground">{{ item.email }}</TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <Table v-else>
              <TableHeader>
                <TableRow>
                  <TableHead class="w-16">ID</TableHead>
                  <TableHead>Tên sản phẩm</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead class="text-right">Giá</TableHead>
                  <TableHead class="text-center">Số lượng</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="item in products" :key="item.id">
                  <TableCell class="text-muted-foreground">{{ item.id }}</TableCell>
                  <TableCell class="font-medium">{{ item.name }}</TableCell>
                  <TableCell class="text-muted-foreground">{{ item.description }}</TableCell>
                  <TableCell class="text-right">{{ formatPrice(item.price) }}</TableCell>
                  <TableCell class="text-center">{{ item.stock }}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  </div>
</template>