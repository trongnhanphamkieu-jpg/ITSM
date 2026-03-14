-- CreateEnum
CREATE TYPE "BudgetStatus" AS ENUM ('draft', 'pending', 'approved', 'rejected');

-- CreateTable
CREATE TABLE "budget_plans" (
    "id" UUID NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "year" INTEGER NOT NULL,
    "quarter" INTEGER,
    "description" TEXT,
    "total_amount" DECIMAL(15,0) NOT NULL DEFAULT 0,
    "status" "BudgetStatus" NOT NULL DEFAULT 'draft',
    "rejection_note" TEXT,
    "created_by" UUID NOT NULL,
    "approved_by" UUID,
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "budget_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budget_categories" (
    "id" UUID NOT NULL,
    "plan_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "budget_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budget_items" (
    "id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "unit" VARCHAR(50),
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unit_price" DECIMAL(15,0) NOT NULL DEFAULT 0,
    "total_price" DECIMAL(15,0) NOT NULL DEFAULT 0,
    "note" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "budget_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "budget_plans_code_key" ON "budget_plans"("code");

-- CreateIndex
CREATE INDEX "budget_plans_year_status_idx" ON "budget_plans"("year", "status");

-- CreateIndex
CREATE INDEX "budget_plans_created_by_idx" ON "budget_plans"("created_by");

-- CreateIndex
CREATE INDEX "budget_categories_plan_id_idx" ON "budget_categories"("plan_id");

-- CreateIndex
CREATE INDEX "budget_items_category_id_idx" ON "budget_items"("category_id");

-- AddForeignKey
ALTER TABLE "budget_plans" ADD CONSTRAINT "budget_plans_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_plans" ADD CONSTRAINT "budget_plans_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_categories" ADD CONSTRAINT "budget_categories_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "budget_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_items" ADD CONSTRAINT "budget_items_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "budget_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
