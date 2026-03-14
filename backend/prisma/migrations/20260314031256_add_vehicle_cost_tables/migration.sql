-- CreateEnum
CREATE TYPE "VehicleStatus" AS ENUM ('active', 'maintenance', 'disposed');

-- CreateEnum
CREATE TYPE "CostFrequency" AS ENUM ('monthly', 'quarterly', 'yearly', 'one_time');

-- CreateTable
CREATE TABLE "vehicles" (
    "id" UUID NOT NULL,
    "license_plate" VARCHAR(20) NOT NULL,
    "brand" VARCHAR(100) NOT NULL,
    "model" VARCHAR(100) NOT NULL,
    "year" INTEGER,
    "type" VARCHAR(50),
    "fuel_type" VARCHAR(30),
    "color" VARCHAR(30),
    "vin" VARCHAR(50),
    "mileage" INTEGER DEFAULT 0,
    "status" "VehicleStatus" NOT NULL DEFAULT 'active',
    "assigned_to" VARCHAR(255),
    "insurance_expiry" TIMESTAMP(3),
    "registration_expiry" TIMESTAMP(3),
    "cost" DECIMAL(15,2),
    "notes" TEXT,
    "vendor_id" UUID,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_services" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "frequency" "CostFrequency" NOT NULL DEFAULT 'one_time',
    "estimated_cost" DECIMAL(15,2),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicle_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_variable_costs" (
    "id" UUID NOT NULL,
    "vehicle_id" UUID NOT NULL,
    "service_id" UUID NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "date" DATE NOT NULL,
    "mileage_at_service" INTEGER,
    "notes" TEXT,
    "receipt_url" VARCHAR(500),
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicle_variable_costs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_cost_types" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicle_cost_types_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_license_plate_key" ON "vehicles"("license_plate");

-- CreateIndex
CREATE INDEX "vehicles_status_idx" ON "vehicles"("status");

-- CreateIndex
CREATE INDEX "vehicles_license_plate_idx" ON "vehicles"("license_plate");

-- CreateIndex
CREATE INDEX "vehicle_variable_costs_vehicle_id_idx" ON "vehicle_variable_costs"("vehicle_id");

-- CreateIndex
CREATE INDEX "vehicle_variable_costs_service_id_idx" ON "vehicle_variable_costs"("service_id");

-- CreateIndex
CREATE INDEX "vehicle_variable_costs_date_idx" ON "vehicle_variable_costs"("date");

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_cost_types_name_key" ON "vehicle_cost_types"("name");

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_variable_costs" ADD CONSTRAINT "vehicle_variable_costs_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_variable_costs" ADD CONSTRAINT "vehicle_variable_costs_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "vehicle_services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_variable_costs" ADD CONSTRAINT "vehicle_variable_costs_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
