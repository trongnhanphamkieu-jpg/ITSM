-- AlterTable
ALTER TABLE "actual_costs" ADD COLUMN     "vendor_id" UUID;

-- AlterTable
ALTER TABLE "cost_forecast_items" ADD COLUMN     "vendor_id" UUID;

-- CreateIndex
CREATE INDEX "actual_costs_vendor_id_idx" ON "actual_costs"("vendor_id");

-- AddForeignKey
ALTER TABLE "actual_costs" ADD CONSTRAINT "actual_costs_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cost_forecast_items" ADD CONSTRAINT "cost_forecast_items_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;
