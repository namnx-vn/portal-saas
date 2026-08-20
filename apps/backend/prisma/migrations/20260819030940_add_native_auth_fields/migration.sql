/*
  Warnings:

  - A unique constraint covering the columns `[invite_token_hash]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenant_id,email]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "tenant_idp_config" ADD COLUMN     "auth_mode" TEXT NOT NULL DEFAULT 'entra';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "invite_expires_at" TIMESTAMP(3),
ADD COLUMN     "invite_token_hash" TEXT,
ADD COLUMN     "mfa_otp_expires_at" TIMESTAMP(3),
ADD COLUMN     "mfa_otp_hash" TEXT,
ADD COLUMN     "password_hash" TEXT,
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'member',
ALTER COLUMN "external_object_id" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_invite_token_hash_key" ON "users"("invite_token_hash");

-- CreateIndex
CREATE UNIQUE INDEX "users_tenant_id_email_key" ON "users"("tenant_id", "email");
