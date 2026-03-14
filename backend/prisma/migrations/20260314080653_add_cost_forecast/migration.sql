-- CreateEnum
CREATE TYPE "ForecastStatus" AS ENUM ('draft', 'pending', 'approved', 'rejected', 'closed');

-- CreateEnum
CREATE TYPE "ForecastPriority" AS ENUM ('critical', 'high', 'medium', 'low');

-- CreateTable
CREATE TABLE "cost_forecasts" (
    "id" UUID NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "total_amount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'VND',
    "status" "ForecastStatus" NOT NULL DEFAULT 'draft',
    "approved_by" UUID,
    "approved_at" TIMESTAMP(3),
    "reject_reason" TEXT,
    "notes" TEXT,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cost_forecasts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cost_forecast_items" (
    "id" UUID NOT NULL,
    "forecast_id" UUID NOT NULL,
    "item_name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "estimated_amount" DECIMAL(18,2) NOT NULL,
    "vendor" VARCHAR(255),
    "project_id" UUID,
    "priority" "ForecastPriority" NOT NULL DEFAULT 'medium',
    "notes" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cost_forecast_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cost_forecast_history" (
    "id" UUID NOT NULL,
    "forecast_id" UUID NOT NULL,
    "action" VARCHAR(50) NOT NULL,
    "comment" TEXT,
    "performed_by" UUID NOT NULL,
    "performed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cost_forecast_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cost_forecasts_status_idx" ON "cost_forecasts"("status");

-- CreateIndex
CREATE INDEX "cost_forecasts_created_by_idx" ON "cost_forecasts"("created_by");

-- CreateIndex
CREATE UNIQUE INDEX "cost_forecasts_year_month_key" ON "cost_forecasts"("year", "month");

-- CreateIndex
CREATE INDEX "cost_forecast_items_forecast_id_idx" ON "cost_forecast_items"("forecast_id");

-- CreateIndex
CREATE INDEX "cost_forecast_items_project_id_idx" ON "cost_forecast_items"("project_id");

-- CreateIndex
CREATE INDEX "cost_forecast_history_forecast_id_idx" ON "cost_forecast_history"("forecast_id");

-- AddForeignKey
ALTER TABLE "cost_forecasts" ADD CONSTRAINT "cost_forecasts_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cost_forecasts" ADD CONSTRAINT "cost_forecasts_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cost_forecast_items" ADD CONSTRAINT "cost_forecast_items_forecast_id_fkey" FOREIGN KEY ("forecast_id") REFERENCES "cost_forecasts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cost_forecast_items" ADD CONSTRAINT "cost_forecast_items_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cost_forecast_items" ADD CONSTRAINT "cost_forecast_items_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cost_forecast_history" ADD CONSTRAINT "cost_forecast_history_forecast_id_fkey" FOREIGN KEY ("forecast_id") REFERENCES "cost_forecasts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cost_forecast_history" ADD CONSTRAINT "cost_forecast_history_performed_by_fkey" FOREIGN KEY ("performed_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
