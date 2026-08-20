import type { User } from "@prisma/client";

export function toSafeUser(user: Pick<User, "id" | "email" | "tenantId">) {
  return {
    id: user.id,
    email: user.email,
    tenantId: user.tenantId,
  };
}