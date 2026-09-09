# PK FE

Giao diện người dùng (Frontend) xây dựng bằng **Vite + Vue 3 + TypeScript**, UI library dùng
[shadcn-vue](https://www.shadcn-vue.com/) (port của [shadcn/ui](https://ui.shadcn.com/) cho Vue)
+ [Tailwind CSS v4](https://tailwindcss.com/).

## Màn hình hiện có

- **Login** (`src/views/LoginView.vue`) — form đăng nhập với validation, hiển thị/ẩn mật khẩu,
  trạng thái loading, thông báo lỗi, "Ghi nhớ đăng nhập" và đăng nhập bằng Google/GitHub (mock).

Tài khoản demo: `admin@example.com` / `123456`

## Cấu trúc thư mục

```
src/
├── api/auth.ts           # Mock auth service (thay bằng API thật khi backend sẵn sàng)
├── components/
│   └── ui/               # Các component shadcn-vue (button, input, card, ...)
├── lib/utils.ts          # Hàm cn() gộp class Tailwind
├── views/LoginView.vue   # Màn hình đăng nhập
├── App.vue
├── main.ts
└── style.css             # Theme Tailwind v4 + CSS variables của shadcn
```

## Cài đặt

```bash
npm install
```

## Chạy dev server

```bash
npm run dev
```

Mở trình duyệt tại địa chỉ được in ra terminal (mặc định `http://localhost:5173`).

## Build production

```bash
npm run build
```

## Thêm component shadcn-vue mới

```bash
npx shadcn-vue@latest add dialog
```

## Ký thuật chính

- **Vite** — dev server & build cực nhanh
- **Vue 3** với `<script setup lang="ts">`
- **Tailwind CSS v4** — cấu hình qua CSS (`@theme inline`), dùng plugin `@tailwindcss/vite`
- **shadcn-vue** — source code component nằm trực tiếp trong `src/components/ui`, dễ chỉnh sửa
- **reka-ui** — primitives xây dựng component có accessibility (a11y)
- **@lucide/vue** — bộ icon
