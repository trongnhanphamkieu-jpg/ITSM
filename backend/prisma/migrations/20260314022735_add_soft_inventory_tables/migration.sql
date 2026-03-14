-- CreateEnum
CREATE TYPE "SoftAssetStatus" AS ENUM ('active', 'inactive', 'expired');

-- CreateEnum
CREATE TYPE "LicenseType" AS ENUM ('perpetual', 'subscription', 'trial', 'oem');

-- CreateEnum
CREATE TYPE "SslType" AS ENUM ('DV', 'OV', 'EV', 'wildcard');

-- CreateTable
CREATE TABLE "email_accounts" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "provider" VARCHAR(100) NOT NULL,
    "quota_mb" INTEGER NOT NULL DEFAULT 5120,
    "used_mb" INTEGER NOT NULL DEFAULT 0,
    "assigned_to" VARCHAR(255),
    "status" "SoftAssetStatus" NOT NULL DEFAULT 'active',
    "notes" TEXT,
    "vendor_id" UUID,
    "contract_id" UUID,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "email_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "domains" (
    "id" UUID NOT NULL,
    "domain" VARCHAR(255) NOT NULL,
    "registrar" VARCHAR(100),
    "nameservers" TEXT,
    "registration_date" TIMESTAMP(3),
    "expiry_date" TIMESTAMP(3),
    "auto_renew" BOOLEAN NOT NULL DEFAULT false,
    "status" "SoftAssetStatus" NOT NULL DEFAULT 'active',
    "notes" TEXT,
    "vendor_id" UUID,
    "contract_id" UUID,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "domains_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vps_servers" (
    "id" UUID NOT NULL,
    "hostname" VARCHAR(255) NOT NULL,
    "ip_address" VARCHAR(45),
    "provider" VARCHAR(100),
    "os" VARCHAR(100),
    "cpu" VARCHAR(50),
    "ram_gb" INTEGER,
    "storage_gb" INTEGER,
    "location" VARCHAR(100),
    "expiry_date" TIMESTAMP(3),
    "status" "SoftAssetStatus" NOT NULL DEFAULT 'active',
    "notes" TEXT,
    "vendor_id" UUID,
    "contract_id" UUID,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "vps_servers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "software_licenses" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "publisher" VARCHAR(255),
    "license_key" VARCHAR(500),
    "license_type" "LicenseType" NOT NULL DEFAULT 'subscription',
    "seats" INTEGER NOT NULL DEFAULT 1,
    "used_seats" INTEGER NOT NULL DEFAULT 0,
    "purchase_date" TIMESTAMP(3),
    "expiry_date" TIMESTAMP(3),
    "cost" DECIMAL(15,2),
    "status" "SoftAssetStatus" NOT NULL DEFAULT 'active',
    "notes" TEXT,
    "vendor_id" UUID,
    "contract_id" UUID,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "software_licenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ssl_certificates" (
    "id" UUID NOT NULL,
    "domain" VARCHAR(255) NOT NULL,
    "issuer" VARCHAR(255),
    "ssl_type" "SslType" NOT NULL DEFAULT 'DV',
    "serial_number" VARCHAR(255),
    "issued_date" TIMESTAMP(3),
    "expiry_date" TIMESTAMP(3),
    "auto_renew" BOOLEAN NOT NULL DEFAULT false,
    "status" "SoftAssetStatus" NOT NULL DEFAULT 'active',
    "notes" TEXT,
    "vendor_id" UUID,
    "contract_id" UUID,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "ssl_certificates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "email_accounts_email_key" ON "email_accounts"("email");

-- CreateIndex
CREATE INDEX "email_accounts_status_idx" ON "email_accounts"("status");

-- CreateIndex
CREATE INDEX "email_accounts_provider_idx" ON "email_accounts"("provider");

-- CreateIndex
CREATE UNIQUE INDEX "domains_domain_key" ON "domains"("domain");

-- CreateIndex
CREATE INDEX "domains_status_idx" ON "domains"("status");

-- CreateIndex
CREATE INDEX "domains_expiry_date_idx" ON "domains"("expiry_date");

-- CreateIndex
CREATE INDEX "vps_servers_status_idx" ON "vps_servers"("status");

-- CreateIndex
CREATE INDEX "vps_servers_expiry_date_idx" ON "vps_servers"("expiry_date");

-- CreateIndex
CREATE INDEX "software_licenses_status_idx" ON "software_licenses"("status");

-- CreateIndex
CREATE INDEX "software_licenses_expiry_date_idx" ON "software_licenses"("expiry_date");

-- CreateIndex
CREATE INDEX "software_licenses_license_type_idx" ON "software_licenses"("license_type");

-- CreateIndex
CREATE INDEX "ssl_certificates_status_idx" ON "ssl_certificates"("status");

-- CreateIndex
CREATE INDEX "ssl_certificates_expiry_date_idx" ON "ssl_certificates"("expiry_date");

-- AddForeignKey
ALTER TABLE "email_accounts" ADD CONSTRAINT "email_accounts_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_accounts" ADD CONSTRAINT "email_accounts_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_accounts" ADD CONSTRAINT "email_accounts_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "contracts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "domains" ADD CONSTRAINT "domains_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "domains" ADD CONSTRAINT "domains_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "domains" ADD CONSTRAINT "domains_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "contracts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vps_servers" ADD CONSTRAINT "vps_servers_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vps_servers" ADD CONSTRAINT "vps_servers_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vps_servers" ADD CONSTRAINT "vps_servers_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "contracts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "software_licenses" ADD CONSTRAINT "software_licenses_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "software_licenses" ADD CONSTRAINT "software_licenses_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "software_licenses" ADD CONSTRAINT "software_licenses_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "contracts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ssl_certificates" ADD CONSTRAINT "ssl_certificates_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ssl_certificates" ADD CONSTRAINT "ssl_certificates_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ssl_certificates" ADD CONSTRAINT "ssl_certificates_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "contracts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
