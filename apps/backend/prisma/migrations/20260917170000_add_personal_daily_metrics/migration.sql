-- CreateTable
CREATE TABLE "personal_daily_metrics" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "recorded_on" DATE NOT NULL,
    "focus_minutes" INTEGER NOT NULL DEFAULT 0,
    "meeting_minutes" INTEGER NOT NULL DEFAULT 0,
    "learning_minutes" INTEGER NOT NULL DEFAULT 0,
    "personal_minutes" INTEGER NOT NULL DEFAULT 0,
    "tasks_planned" INTEGER NOT NULL DEFAULT 0,
    "tasks_completed" INTEGER NOT NULL DEFAULT 0,
    "learning_sessions" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "personal_daily_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "personal_daily_metrics_user_id_recorded_on_key" ON "personal_daily_metrics"("user_id", "recorded_on");

-- CreateIndex
CREATE INDEX "personal_daily_metrics_tenant_id_user_id_recorded_on_idx" ON "personal_daily_metrics"("tenant_id", "user_id", "recorded_on");

-- AddForeignKey
ALTER TABLE "personal_daily_metrics" ADD CONSTRAINT "personal_daily_metrics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personal_daily_metrics" ADD CONSTRAINT "personal_daily_metrics_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
