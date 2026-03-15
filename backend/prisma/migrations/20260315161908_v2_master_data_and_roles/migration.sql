/*
  Warnings:

  - A unique constraint covering the columns `[tax_code]` on the table `vendors` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'partial_paid', 'paid', 'cancelled');

-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'payment_overdue';

-- AlterTable
ALTER TABLE "actual_costs" ADD COLUMN     "contract_id" UUID,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "master_category_id" UUID,
ADD COLUMN     "paid_amount" DECIMAL(18,2),
ADD COLUMN     "paid_at" DATE,
ADD COLUMN     "payment_due_date" DATE,
ADD COLUMN     "payment_status" "PaymentStatus" NOT NULL DEFAULT 'pending',
ADD COLUMN     "po_number" VARCHAR(100),
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(18,2);

-- AlterTable
ALTER TABLE "budget_categories" ADD COLUMN     "master_category_id" UUID;

-- AlterTable
ALTER TABLE "budget_items" ALTER COLUMN "unit_price" SET DATA TYPE DECIMAL(18,2),
ALTER COLUMN "total_price" SET DATA TYPE DECIMAL(18,2);

-- AlterTable
ALTER TABLE "budget_plans" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1,
ALTER COLUMN "total_amount" SET DATA TYPE DECIMAL(18,2);

-- AlterTable
ALTER TABLE "contracts" ADD COLUMN     "alert_days" INTEGER NOT NULL DEFAULT 30,
ADD COLUMN     "auto_renew" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "contract_type" VARCHAR(50),
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "sign_date" DATE,
ALTER COLUMN "value" SET DATA TYPE DECIMAL(18,2);

-- AlterTable
ALTER TABLE "email_accounts" ADD COLUMN     "cost_per_year" DECIMAL(18,2),
ADD COLUMN     "department" VARCHAR(100),
ADD COLUMN     "display_name" VARCHAR(255),
ADD COLUMN     "expire_date" DATE,
ADD COLUMN     "plan" VARCHAR(100);

-- AlterTable
ALTER TABLE "hardware_assets" ADD COLUMN     "master_category_id" UUID,
ALTER COLUMN "cost" SET DATA TYPE DECIMAL(18,2);

-- AlterTable
ALTER TABLE "software_licenses" ALTER COLUMN "cost" SET DATA TYPE DECIMAL(18,2);

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "dynamic_role_id" UUID;

-- AlterTable
ALTER TABLE "vehicles" ADD COLUMN     "contract_id" UUID,
ALTER COLUMN "cost" SET DATA TYPE DECIMAL(18,2);

-- AlterTable
ALTER TABLE "vendors" ADD COLUMN     "category" VARCHAR(100),
ADD COLUMN     "website" VARCHAR(255);

-- AlterTable
ALTER TABLE "vps_servers" ADD COLUMN     "cost_per_month" DECIMAL(18,2),
ADD COLUMN     "environment" VARCHAR(20),
ADD COLUMN     "region" VARCHAR(100);

-- CreateTable
CREATE TABLE "master_data_items" (
    "id" UUID NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "master_data_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "master_categories" (
    "id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "parent_id" UUID,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "master_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dynamic_roles" (
    "id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dynamic_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "id" UUID NOT NULL,
    "role_id" UUID NOT NULL,
    "module" VARCHAR(50) NOT NULL,
    "can_view" BOOLEAN NOT NULL DEFAULT false,
    "can_create" BOOLEAN NOT NULL DEFAULT false,
    "can_edit" BOOLEAN NOT NULL DEFAULT false,
    "can_delete" BOOLEAN NOT NULL DEFAULT false,
    "can_export" BOOLEAN NOT NULL DEFAULT false,
    "can_import" BOOLEAN NOT NULL DEFAULT false,
    "can_approve" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_reconciliations" (
    "id" UUID NOT NULL,
    "vendor_id" UUID NOT NULL,
    "reconciliation_date" DATE NOT NULL,
    "total_outstanding" DECIMAL(18,2) NOT NULL,
    "total_paid" DECIMAL(18,2) NOT NULL,
    "confirmed_by" UUID NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vendor_reconciliations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_reconciliation_items" (
    "id" UUID NOT NULL,
    "reconciliation_id" UUID NOT NULL,
    "actual_cost_id" UUID NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "note" TEXT,

    CONSTRAINT "vendor_reconciliation_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contract_payments" (
    "id" UUID NOT NULL,
    "contract_id" UUID NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "payment_date" DATE NOT NULL,
    "method" VARCHAR(50),
    "reference" VARCHAR(100),
    "note" TEXT,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contract_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cost_attachments" (
    "id" UUID NOT NULL,
    "actual_cost_id" UUID NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "file_size" INTEGER NOT NULL,
    "mime_type" VARCHAR(100) NOT NULL,
    "storage_key" VARCHAR(500) NOT NULL,
    "uploaded_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cost_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file_uploads" (
    "id" UUID NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "file_size" INTEGER NOT NULL,
    "mime_type" VARCHAR(100) NOT NULL,
    "storage_key" VARCHAR(500) NOT NULL,
    "uploaded_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "file_uploads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budget_plan_history" (
    "id" UUID NOT NULL,
    "plan_id" UUID NOT NULL,
    "version" INTEGER NOT NULL,
    "snapshot" JSONB NOT NULL,
    "changed_by" UUID NOT NULL,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "budget_plan_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "license_assignments" (
    "id" UUID NOT NULL,
    "license_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMP(3),
    "assigned_by" UUID NOT NULL,

    CONSTRAINT "license_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset_assignments" (
    "id" UUID NOT NULL,
    "asset_id" UUID NOT NULL,
    "assigned_to" VARCHAR(255) NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "returned_at" TIMESTAMP(3),
    "assigned_by" UUID NOT NULL,
    "note" TEXT,

    CONSTRAINT "asset_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset_maintenance_logs" (
    "id" UUID NOT NULL,
    "asset_id" UUID NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "description" TEXT NOT NULL,
    "cost" DECIMAL(18,2),
    "performed_at" DATE NOT NULL,
    "performed_by" VARCHAR(255),
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "asset_maintenance_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "master_data_items_type_is_active_idx" ON "master_data_items"("type", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "master_data_items_type_code_key" ON "master_data_items"("type", "code");

-- CreateIndex
CREATE UNIQUE INDEX "master_categories_code_key" ON "master_categories"("code");

-- CreateIndex
CREATE INDEX "master_categories_type_is_active_idx" ON "master_categories"("type", "is_active");

-- CreateIndex
CREATE INDEX "master_categories_parent_id_idx" ON "master_categories"("parent_id");

-- CreateIndex
CREATE UNIQUE INDEX "dynamic_roles_code_key" ON "dynamic_roles"("code");

-- CreateIndex
CREATE INDEX "role_permissions_role_id_idx" ON "role_permissions"("role_id");

-- CreateIndex
CREATE UNIQUE INDEX "role_permissions_role_id_module_key" ON "role_permissions"("role_id", "module");

-- CreateIndex
CREATE INDEX "vendor_reconciliations_vendor_id_reconciliation_date_idx" ON "vendor_reconciliations"("vendor_id", "reconciliation_date");

-- CreateIndex
CREATE INDEX "vendor_reconciliation_items_reconciliation_id_idx" ON "vendor_reconciliation_items"("reconciliation_id");

-- CreateIndex
CREATE INDEX "contract_payments_contract_id_idx" ON "contract_payments"("contract_id");

-- CreateIndex
CREATE INDEX "contract_payments_payment_date_idx" ON "contract_payments"("payment_date");

-- CreateIndex
CREATE INDEX "cost_attachments_actual_cost_id_idx" ON "cost_attachments"("actual_cost_id");

-- CreateIndex
CREATE INDEX "file_uploads_uploaded_by_idx" ON "file_uploads"("uploaded_by");

-- CreateIndex
CREATE INDEX "budget_plan_history_plan_id_version_idx" ON "budget_plan_history"("plan_id", "version");

-- CreateIndex
CREATE INDEX "license_assignments_license_id_idx" ON "license_assignments"("license_id");

-- CreateIndex
CREATE INDEX "license_assignments_user_id_idx" ON "license_assignments"("user_id");

-- CreateIndex
CREATE INDEX "asset_assignments_asset_id_idx" ON "asset_assignments"("asset_id");

-- CreateIndex
CREATE INDEX "asset_maintenance_logs_asset_id_idx" ON "asset_maintenance_logs"("asset_id");

-- CreateIndex
CREATE INDEX "asset_maintenance_logs_performed_at_idx" ON "asset_maintenance_logs"("performed_at");

-- CreateIndex
CREATE INDEX "actual_costs_master_category_id_idx" ON "actual_costs"("master_category_id");

-- CreateIndex
CREATE INDEX "actual_costs_contract_id_idx" ON "actual_costs"("contract_id");

-- CreateIndex
CREATE INDEX "actual_costs_payment_status_idx" ON "actual_costs"("payment_status");

-- CreateIndex
CREATE INDEX "actual_costs_payment_due_date_idx" ON "actual_costs"("payment_due_date");

-- CreateIndex
CREATE INDEX "budget_categories_master_category_id_idx" ON "budget_categories"("master_category_id");

-- CreateIndex
CREATE INDEX "contracts_name_idx" ON "contracts"("name");

-- CreateIndex
CREATE INDEX "domains_vendor_id_idx" ON "domains"("vendor_id");

-- CreateIndex
CREATE INDEX "domains_contract_id_idx" ON "domains"("contract_id");

-- CreateIndex
CREATE INDEX "email_accounts_vendor_id_idx" ON "email_accounts"("vendor_id");

-- CreateIndex
CREATE INDEX "email_accounts_contract_id_idx" ON "email_accounts"("contract_id");

-- CreateIndex
CREATE INDEX "hardware_assets_master_category_id_idx" ON "hardware_assets"("master_category_id");

-- CreateIndex
CREATE INDEX "hardware_assets_vendor_id_idx" ON "hardware_assets"("vendor_id");

-- CreateIndex
CREATE INDEX "hardware_assets_contract_id_idx" ON "hardware_assets"("contract_id");

-- CreateIndex
CREATE INDEX "infra_resources_vendor_id_idx" ON "infra_resources"("vendor_id");

-- CreateIndex
CREATE INDEX "software_licenses_vendor_id_idx" ON "software_licenses"("vendor_id");

-- CreateIndex
CREATE INDEX "software_licenses_contract_id_idx" ON "software_licenses"("contract_id");

-- CreateIndex
CREATE INDEX "ssl_certificates_vendor_id_idx" ON "ssl_certificates"("vendor_id");

-- CreateIndex
CREATE INDEX "ssl_certificates_contract_id_idx" ON "ssl_certificates"("contract_id");

-- CreateIndex
CREATE INDEX "users_dynamic_role_id_idx" ON "users"("dynamic_role_id");

-- CreateIndex
CREATE INDEX "vehicles_contract_id_idx" ON "vehicles"("contract_id");

-- CreateIndex
CREATE UNIQUE INDEX "vendors_tax_code_key" ON "vendors"("tax_code");

-- CreateIndex
CREATE INDEX "vendors_name_idx" ON "vendors"("name");

-- CreateIndex
CREATE INDEX "vps_servers_vendor_id_idx" ON "vps_servers"("vendor_id");

-- CreateIndex
CREATE INDEX "vps_servers_contract_id_idx" ON "vps_servers"("contract_id");

-- AddForeignKey
ALTER TABLE "master_categories" ADD CONSTRAINT "master_categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "master_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "dynamic_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_dynamic_role_id_fkey" FOREIGN KEY ("dynamic_role_id") REFERENCES "dynamic_roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_categories" ADD CONSTRAINT "budget_categories_master_category_id_fkey" FOREIGN KEY ("master_category_id") REFERENCES "master_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actual_costs" ADD CONSTRAINT "actual_costs_master_category_id_fkey" FOREIGN KEY ("master_category_id") REFERENCES "master_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actual_costs" ADD CONSTRAINT "actual_costs_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "contracts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_reconciliations" ADD CONSTRAINT "vendor_reconciliations_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_reconciliations" ADD CONSTRAINT "vendor_reconciliations_confirmed_by_fkey" FOREIGN KEY ("confirmed_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_reconciliation_items" ADD CONSTRAINT "vendor_reconciliation_items_reconciliation_id_fkey" FOREIGN KEY ("reconciliation_id") REFERENCES "vendor_reconciliations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_payments" ADD CONSTRAINT "contract_payments_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "contracts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_payments" ADD CONSTRAINT "contract_payments_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cost_attachments" ADD CONSTRAINT "cost_attachments_actual_cost_id_fkey" FOREIGN KEY ("actual_cost_id") REFERENCES "actual_costs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cost_attachments" ADD CONSTRAINT "cost_attachments_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_uploads" ADD CONSTRAINT "file_uploads_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hardware_assets" ADD CONSTRAINT "hardware_assets_master_category_id_fkey" FOREIGN KEY ("master_category_id") REFERENCES "master_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "contracts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_plan_history" ADD CONSTRAINT "budget_plan_history_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "budget_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_plan_history" ADD CONSTRAINT "budget_plan_history_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "license_assignments" ADD CONSTRAINT "license_assignments_license_id_fkey" FOREIGN KEY ("license_id") REFERENCES "software_licenses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "license_assignments" ADD CONSTRAINT "license_assignments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "license_assignments" ADD CONSTRAINT "license_assignments_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_assignments" ADD CONSTRAINT "asset_assignments_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "hardware_assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_assignments" ADD CONSTRAINT "asset_assignments_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_maintenance_logs" ADD CONSTRAINT "asset_maintenance_logs_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "hardware_assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_maintenance_logs" ADD CONSTRAINT "asset_maintenance_logs_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
