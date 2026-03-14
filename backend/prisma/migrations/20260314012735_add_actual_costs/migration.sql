-- CreateTable
CREATE TABLE "actual_costs" (
    "id" UUID NOT NULL,
    "budget_item_id" UUID,
    "category_name" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(15,0) NOT NULL,
    "cost_date" DATE NOT NULL,
    "vendor" VARCHAR(255),
    "invoice_no" VARCHAR(100),
    "note" TEXT,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "actual_costs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "actual_costs_cost_date_idx" ON "actual_costs"("cost_date");

-- CreateIndex
CREATE INDEX "actual_costs_budget_item_id_idx" ON "actual_costs"("budget_item_id");

-- CreateIndex
CREATE INDEX "actual_costs_created_by_idx" ON "actual_costs"("created_by");

-- CreateIndex
CREATE INDEX "actual_costs_category_name_idx" ON "actual_costs"("category_name");

-- AddForeignKey
ALTER TABLE "actual_costs" ADD CONSTRAINT "actual_costs_budget_item_id_fkey" FOREIGN KEY ("budget_item_id") REFERENCES "budget_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actual_costs" ADD CONSTRAINT "actual_costs_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
