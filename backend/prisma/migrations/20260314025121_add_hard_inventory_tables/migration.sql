-- CreateEnum
CREATE TYPE "HardAssetStatus" AS ENUM ('in_use', 'available', 'maintenance', 'disposed');

-- CreateEnum
CREATE TYPE "InfraType" AS ENUM ('switch', 'router', 'firewall', 'access_point', 'ups', 'pdu', 'cable_tray', 'rack', 'other');

-- CreateEnum
CREATE TYPE "IpType" AS ENUM ('static', 'dhcp', 'reserved');

-- CreateTable
CREATE TABLE "hardware_assets" (
    "id" UUID NOT NULL,
    "asset_tag" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "category" VARCHAR(100) NOT NULL,
    "brand" VARCHAR(100),
    "model" VARCHAR(100),
    "serial_number" VARCHAR(100),
    "specs" JSONB,
    "purchase_date" TIMESTAMP(3),
    "warranty_expiry" TIMESTAMP(3),
    "location" VARCHAR(255),
    "assigned_to" VARCHAR(255),
    "cost" DECIMAL(15,2),
    "status" "HardAssetStatus" NOT NULL DEFAULT 'available',
    "notes" TEXT,
    "vendor_id" UUID,
    "contract_id" UUID,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "hardware_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "infra_resources" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "infra_type" "InfraType" NOT NULL DEFAULT 'other',
    "brand" VARCHAR(100),
    "model" VARCHAR(100),
    "serial_number" VARCHAR(100),
    "location" VARCHAR(255),
    "rack_unit" VARCHAR(20),
    "specs" JSONB,
    "ip_address" VARCHAR(45),
    "management_url" VARCHAR(500),
    "status" "HardAssetStatus" NOT NULL DEFAULT 'available',
    "notes" TEXT,
    "vendor_id" UUID,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "infra_resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ip_addresses" (
    "id" UUID NOT NULL,
    "address" VARCHAR(45) NOT NULL,
    "subnet" VARCHAR(18),
    "gateway" VARCHAR(45),
    "vlan" VARCHAR(20),
    "ip_type" "IpType" NOT NULL DEFAULT 'static',
    "assigned_to" VARCHAR(255),
    "assigned_type" VARCHAR(50),
    "status" "HardAssetStatus" NOT NULL DEFAULT 'available',
    "notes" TEXT,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "ip_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "hardware_assets_asset_tag_key" ON "hardware_assets"("asset_tag");

-- CreateIndex
CREATE INDEX "hardware_assets_status_idx" ON "hardware_assets"("status");

-- CreateIndex
CREATE INDEX "hardware_assets_category_idx" ON "hardware_assets"("category");

-- CreateIndex
CREATE INDEX "hardware_assets_warranty_expiry_idx" ON "hardware_assets"("warranty_expiry");

-- CreateIndex
CREATE INDEX "infra_resources_infra_type_idx" ON "infra_resources"("infra_type");

-- CreateIndex
CREATE INDEX "infra_resources_status_idx" ON "infra_resources"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ip_addresses_address_key" ON "ip_addresses"("address");

-- CreateIndex
CREATE INDEX "ip_addresses_vlan_idx" ON "ip_addresses"("vlan");

-- CreateIndex
CREATE INDEX "ip_addresses_status_idx" ON "ip_addresses"("status");

-- CreateIndex
CREATE INDEX "ip_addresses_ip_type_idx" ON "ip_addresses"("ip_type");

-- AddForeignKey
ALTER TABLE "hardware_assets" ADD CONSTRAINT "hardware_assets_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hardware_assets" ADD CONSTRAINT "hardware_assets_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hardware_assets" ADD CONSTRAINT "hardware_assets_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "contracts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "infra_resources" ADD CONSTRAINT "infra_resources_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "infra_resources" ADD CONSTRAINT "infra_resources_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ip_addresses" ADD CONSTRAINT "ip_addresses_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
