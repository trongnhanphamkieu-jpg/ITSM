/*
  Warnings:

  - You are about to drop the column `estimated_cost` on the `vehicle_services` table. All the data in the column will be lost.
  - You are about to drop the `vehicle_cost_types` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "vehicle_services" DROP COLUMN "estimated_cost",
ADD COLUMN     "cost_type" VARCHAR(20) NOT NULL DEFAULT 'fixed',
ADD COLUMN     "default_cost" DECIMAL(15,2),
ALTER COLUMN "frequency" SET DEFAULT 'monthly';

-- DropTable
DROP TABLE "vehicle_cost_types";

-- CreateTable
CREATE TABLE "vehicle_service_subscriptions" (
    "id" UUID NOT NULL,
    "vehicle_id" UUID NOT NULL,
    "service_id" UUID NOT NULL,
    "monthly_cost" DECIMAL(15,2) NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicle_service_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "vehicle_service_subscriptions_vehicle_id_idx" ON "vehicle_service_subscriptions"("vehicle_id");

-- CreateIndex
CREATE INDEX "vehicle_service_subscriptions_service_id_idx" ON "vehicle_service_subscriptions"("service_id");

-- CreateIndex
CREATE INDEX "vehicle_service_subscriptions_is_active_idx" ON "vehicle_service_subscriptions"("is_active");

-- AddForeignKey
ALTER TABLE "vehicle_service_subscriptions" ADD CONSTRAINT "vehicle_service_subscriptions_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_service_subscriptions" ADD CONSTRAINT "vehicle_service_subscriptions_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "vehicle_services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_service_subscriptions" ADD CONSTRAINT "vehicle_service_subscriptions_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
