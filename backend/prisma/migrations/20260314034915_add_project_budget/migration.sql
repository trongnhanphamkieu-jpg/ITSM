-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('active', 'closed');

-- AlterTable
ALTER TABLE "actual_costs" ADD COLUMN     "project_id" UUID;

-- AlterTable
ALTER TABLE "budget_items" ADD COLUMN     "project_id" UUID;

-- CreateTable
CREATE TABLE "projects" (
    "id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "start_date" DATE,
    "end_date" DATE,
    "department" VARCHAR(100),
    "status" "ProjectStatus" NOT NULL DEFAULT 'active',
    "notes" TEXT,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "projects_code_key" ON "projects"("code");

-- CreateIndex
CREATE INDEX "projects_status_idx" ON "projects"("status");

-- CreateIndex
CREATE INDEX "projects_created_by_idx" ON "projects"("created_by");

-- CreateIndex
CREATE INDEX "actual_costs_project_id_idx" ON "actual_costs"("project_id");

-- CreateIndex
CREATE INDEX "budget_items_project_id_idx" ON "budget_items"("project_id");

-- AddForeignKey
ALTER TABLE "budget_items" ADD CONSTRAINT "budget_items_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actual_costs" ADD CONSTRAINT "actual_costs_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
