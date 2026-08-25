// Cho phép trỏ toàn bộ FE sang 1 tenant khác qua .env.local mà không cần sửa code —
// dùng khi test tenant native mới tạo bằng dev-bootstrap-native-tenant.ts
export const TENANT_SUBDOMAIN = import.meta.env.VITE_TENANT_SUBDOMAIN || "acme";