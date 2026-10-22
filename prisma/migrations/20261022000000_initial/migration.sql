-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "RosterStatus" AS ENUM ('PUBLISHED', 'DRAFT', 'UNASSIGNED');

-- CreateEnum
CREATE TYPE "ActionName" AS ENUM ('VIEW', 'EDIT');

-- CreateEnum
CREATE TYPE "RepairRequestStatus" AS ENUM ('PENDING_REVIEW', 'APPROVED', 'COMPLETED', 'REJECTED');

-- CreateEnum
CREATE TYPE "InspectionStatus" AS ENUM ('PASSED', 'ISSUE');

-- CreateEnum
CREATE TYPE "MaintenancePriorityLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "FuelType" AS ENUM ('Diesel', 'Octane', 'Petrol');

-- CreateEnum
CREATE TYPE "VehicleStatus" AS ENUM ('AVAILABLE', 'MAINTENANCE', 'ASSIGNED', 'UNAVAILABLE', 'INSPECTION_REQUIRED', 'REPAIR_REQUIRED', 'GROUNDED');

-- CreateEnum
CREATE TYPE "PriorityLevel" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "User_Status" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED');

-- CreateEnum
CREATE TYPE "User_Role" AS ENUM ('PLATFORM_ADMIN', 'BUSINESS_ADMIN', 'SUPERVISOR', 'FLEET_MANAGER', 'ROSTER_MANAGER', 'DRIVER', 'ASSISTANT_DRIVER');

-- CreateEnum
CREATE TYPE "Employment_Type" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACTUAL');

-- CreateTable
CREATE TABLE "TenantSettings" (
    "id" UUID NOT NULL,
    "companyName" TEXT NOT NULL,
    "businessNumber" TEXT,
    "supportEmail" TEXT,
    "supportPhone" TEXT,
    "isTwoFactorOn" BOOLEAN NOT NULL DEFAULT false,
    "masterPassword" TEXT,

    CONSTRAINT "TenantSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Users" (
    "id" UUID NOT NULL,
    "tenantId" UUID,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "password" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "role" "User_Role" NOT NULL,
    "employment_type" "Employment_Type" NOT NULL,
    "depot" TEXT,
    "status" "User_Status" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Delivery" (
    "id" UUID NOT NULL,
    "customerName" TEXT NOT NULL,
    "operationalZone" TEXT,
    "destination" TEXT NOT NULL,
    "assignedDriver" UUID,
    "assignedVehicle" UUID,
    "scheduledDropTime" TIMESTAMP(3),
    "priorityLevel" "PriorityLevel" NOT NULL DEFAULT 'MEDIUM',
    "isDispatched" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT,
    "scheduledWindow" TIMESTAMP(3),
    "currentETA" TIMESTAMP(3),
    "remainingDistance" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Delivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryPackage" (
    "id" UUID NOT NULL,
    "description" TEXT,
    "weight" DOUBLE PRECISION,
    "deliveryId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeliveryPackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fleet" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "registration" TEXT,
    "depot" TEXT,
    "assignedDriver" UUID,
    "status" "VehicleStatus" NOT NULL DEFAULT 'AVAILABLE',
    "nextService" TIMESTAMP(3),
    "vehicleCode" TEXT,
    "year" TIMESTAMP(3),
    "bodyType" TEXT,
    "fuelType" "FuelType",
    "currentOdometer" DOUBLE PRECISION,
    "registrationExpiry" TEXT,
    "insuranceExpiry" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Fleet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Maintenance" (
    "id" UUID NOT NULL,
    "vehicleId" UUID NOT NULL,
    "workCheckList" TEXT[],
    "maintenanceType" TEXT,
    "priorityLevel" "MaintenancePriorityLevel" NOT NULL DEFAULT 'MEDIUM',
    "description" TEXT,
    "maintenanceDate" TIMESTAMP(3),
    "assignedDepot" INTEGER,
    "startTime" TIMESTAMP(3),
    "expectedCompletion" TIMESTAMP(3),
    "serviceLocationType" TEXT,
    "serviceProviderName" TEXT,
    "contactPhone" TEXT,
    "estimatedPartsPrice" DOUBLE PRECISION,
    "estimatedLaborPrice" DOUBLE PRECISION,
    "totalEstimatedPrice" DOUBLE PRECISION,
    "vehicleAvailability" TEXT,
    "provider" TEXT,
    "location" TEXT,
    "createdat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Maintenance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inspections" (
    "id" UUID NOT NULL,
    "driverId" UUID NOT NULL,
    "vehicleId" UUID NOT NULL,
    "tyres" "InspectionStatus" NOT NULL,
    "lights" "InspectionStatus" NOT NULL,
    "mirrors" "InspectionStatus" NOT NULL,
    "brakes" "InspectionStatus" NOT NULL,
    "horn" "InspectionStatus" NOT NULL,
    "fuel" "InspectionStatus" NOT NULL,
    "exterior" "InspectionStatus" NOT NULL,
    "driverNote" TEXT,
    "photos" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Inspections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DamageType" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "severity" TEXT,
    "isRequirePhotoEvidence" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isAutomaticallyGround" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DamageType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IncidentType" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "severity" TEXT,
    "isMandatorySupervisorReview" BOOLEAN NOT NULL DEFAULT false,
    "isRequirePoliceReport" BOOLEAN NOT NULL DEFAULT false,
    "isRequireStatutoryNotification" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IncidentType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DamageReport" (
    "id" UUID NOT NULL,
    "reportedBy" UUID NOT NULL,
    "vehicle" UUID NOT NULL,
    "location" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DamageReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RepairRequest" (
    "id" UUID NOT NULL,
    "repairID" UUID,
    "issue" TEXT NOT NULL,
    "reportedBy" UUID NOT NULL,
    "priority" "MaintenancePriorityLevel" NOT NULL DEFAULT 'MEDIUM',
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "RepairRequestStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "vehicle" UUID NOT NULL,
    "photos" TEXT[],
    "severity" TEXT,
    "safetyImpact" TEXT,
    "canOperating" BOOLEAN,
    "repairEstimatedPartsPrice" DOUBLE PRECISION,
    "repairEstimatedLaborPrice" DOUBLE PRECISION,
    "totalEstimatedCost" DOUBLE PRECISION,

    CONSTRAINT "RepairRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Access_Roles" (
    "id" UUID NOT NULL,
    "roles" "User_Role" NOT NULL,

    CONSTRAINT "Access_Roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Access_Module" (
    "id" UUID NOT NULL,
    "accessModule" TEXT NOT NULL,

    CONSTRAINT "Access_Module_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccessAction" (
    "id" UUID NOT NULL,
    "actionName" "ActionName" NOT NULL,

    CONSTRAINT "AccessAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "id" UUID NOT NULL,
    "roleID" UUID NOT NULL,
    "moduleID" UUID NOT NULL,
    "permissionID" UUID NOT NULL,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Roster" (
    "id" UUID NOT NULL,
    "driverId" UUID NOT NULL,
    "assistantId" UUID,
    "shiftStart" TIMESTAMP(3) NOT NULL,
    "shiftEnd" TIMESTAMP(3) NOT NULL,
    "breakStart" TIMESTAMP(3),
    "breakEnd" TIMESTAMP(3),
    "vehicle" UUID,
    "type" TEXT,
    "status" "RosterStatus" NOT NULL DEFAULT 'DRAFT',
    "rosterDate" TIMESTAMP(3) NOT NULL,
    "depot" TEXT,

    CONSTRAINT "Roster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Compliance" (
    "id" UUID NOT NULL,
    "driverId" UUID NOT NULL,
    "licenseURL" TEXT,
    "licenseNumber" TEXT,
    "licenseExpiry" TIMESTAMP(3),
    "visaURL" TEXT,
    "visaExpiry" TIMESTAMP(3),
    "safetyInductionExpiry" TIMESTAMP(3),
    "defensiveDrivingExpiry" TIMESTAMP(3),
    "firstaidExpiry" TIMESTAMP(3),
    "medicalCertificateExpiry" TIMESTAMP(3),
    "policeCheckExpiry" TIMESTAMP(3),
    "employmentContractExpiry" TIMESTAMP(3),
    "emergencyContact" TEXT,
    "todaysHours" TEXT,
    "weeklyHours" TEXT,
    "remaining" TEXT,

    CONSTRAINT "Compliance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" UUID NOT NULL,
    "actor" UUID NOT NULL,
    "actionPerformed" TEXT NOT NULL,
    "targetEntity" TEXT,
    "module" TEXT,
    "ip" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" UUID NOT NULL,
    "user1id" UUID NOT NULL,
    "user2id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" UUID NOT NULL,
    "senderId" UUID NOT NULL,
    "conversationId" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isDelivered" TIMESTAMP(3),
    "isSeen" TIMESTAMP(3),

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Users_phone_key" ON "Users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Users_employee_id_key" ON "Users"("employee_id");

-- CreateIndex
CREATE INDEX "Users_tenantId_idx" ON "Users"("tenantId");

-- CreateIndex
CREATE INDEX "Users_role_idx" ON "Users"("role");

-- CreateIndex
CREATE INDEX "Users_status_idx" ON "Users"("status");

-- CreateIndex
CREATE INDEX "Users_depot_idx" ON "Users"("depot");

-- CreateIndex
CREATE INDEX "Delivery_assignedDriver_idx" ON "Delivery"("assignedDriver");

-- CreateIndex
CREATE INDEX "Delivery_assignedVehicle_idx" ON "Delivery"("assignedVehicle");

-- CreateIndex
CREATE INDEX "Delivery_status_idx" ON "Delivery"("status");

-- CreateIndex
CREATE INDEX "Delivery_isDispatched_idx" ON "Delivery"("isDispatched");

-- CreateIndex
CREATE INDEX "Delivery_priorityLevel_idx" ON "Delivery"("priorityLevel");

-- CreateIndex
CREATE INDEX "Delivery_scheduledDropTime_idx" ON "Delivery"("scheduledDropTime");

-- CreateIndex
CREATE INDEX "Delivery_operationalZone_idx" ON "Delivery"("operationalZone");

-- CreateIndex
CREATE INDEX "Delivery_createdAt_idx" ON "Delivery"("createdAt");

-- CreateIndex
CREATE INDEX "DeliveryPackage_deliveryId_idx" ON "DeliveryPackage"("deliveryId");

-- CreateIndex
CREATE INDEX "Fleet_assignedDriver_idx" ON "Fleet"("assignedDriver");

-- CreateIndex
CREATE INDEX "Fleet_status_idx" ON "Fleet"("status");

-- CreateIndex
CREATE INDEX "Fleet_depot_idx" ON "Fleet"("depot");

-- CreateIndex
CREATE INDEX "Fleet_nextService_idx" ON "Fleet"("nextService");

-- CreateIndex
CREATE INDEX "Fleet_registration_idx" ON "Fleet"("registration");

-- CreateIndex
CREATE INDEX "Maintenance_vehicleId_idx" ON "Maintenance"("vehicleId");

-- CreateIndex
CREATE INDEX "Maintenance_priorityLevel_idx" ON "Maintenance"("priorityLevel");

-- CreateIndex
CREATE INDEX "Maintenance_maintenanceDate_idx" ON "Maintenance"("maintenanceDate");

-- CreateIndex
CREATE INDEX "Maintenance_vehicleId_maintenanceDate_idx" ON "Maintenance"("vehicleId", "maintenanceDate");

-- CreateIndex
CREATE INDEX "Inspections_driverId_idx" ON "Inspections"("driverId");

-- CreateIndex
CREATE INDEX "Inspections_vehicleId_idx" ON "Inspections"("vehicleId");

-- CreateIndex
CREATE INDEX "Inspections_createdAt_idx" ON "Inspections"("createdAt");

-- CreateIndex
CREATE INDEX "Inspections_vehicleId_createdAt_idx" ON "Inspections"("vehicleId", "createdAt");

-- CreateIndex
CREATE INDEX "DamageType_isActive_idx" ON "DamageType"("isActive");

-- CreateIndex
CREATE INDEX "IncidentType_isActive_idx" ON "IncidentType"("isActive");

-- CreateIndex
CREATE INDEX "DamageReport_reportedBy_idx" ON "DamageReport"("reportedBy");

-- CreateIndex
CREATE INDEX "DamageReport_vehicle_idx" ON "DamageReport"("vehicle");

-- CreateIndex
CREATE INDEX "DamageReport_createdAt_idx" ON "DamageReport"("createdAt");

-- CreateIndex
CREATE INDEX "RepairRequest_reportedBy_idx" ON "RepairRequest"("reportedBy");

-- CreateIndex
CREATE INDEX "RepairRequest_vehicle_idx" ON "RepairRequest"("vehicle");

-- CreateIndex
CREATE INDEX "RepairRequest_status_idx" ON "RepairRequest"("status");

-- CreateIndex
CREATE INDEX "RepairRequest_priority_idx" ON "RepairRequest"("priority");

-- CreateIndex
CREATE INDEX "RepairRequest_repairID_idx" ON "RepairRequest"("repairID");

-- CreateIndex
CREATE INDEX "RepairRequest_vehicle_status_idx" ON "RepairRequest"("vehicle", "status");

-- CreateIndex
CREATE INDEX "RolePermission_moduleID_idx" ON "RolePermission"("moduleID");

-- CreateIndex
CREATE INDEX "RolePermission_permissionID_idx" ON "RolePermission"("permissionID");

-- CreateIndex
CREATE UNIQUE INDEX "RolePermission_roleID_moduleID_permissionID_key" ON "RolePermission"("roleID", "moduleID", "permissionID");

-- CreateIndex
CREATE INDEX "Roster_driverId_idx" ON "Roster"("driverId");

-- CreateIndex
CREATE INDEX "Roster_assistantId_idx" ON "Roster"("assistantId");

-- CreateIndex
CREATE INDEX "Roster_vehicle_idx" ON "Roster"("vehicle");

-- CreateIndex
CREATE INDEX "Roster_status_idx" ON "Roster"("status");

-- CreateIndex
CREATE INDEX "Roster_rosterDate_idx" ON "Roster"("rosterDate");

-- CreateIndex
CREATE INDEX "Roster_depot_rosterDate_idx" ON "Roster"("depot", "rosterDate");

-- CreateIndex
CREATE INDEX "Roster_driverId_rosterDate_idx" ON "Roster"("driverId", "rosterDate");

-- CreateIndex
CREATE INDEX "Compliance_driverId_idx" ON "Compliance"("driverId");

-- CreateIndex
CREATE INDEX "Compliance_licenseExpiry_idx" ON "Compliance"("licenseExpiry");

-- CreateIndex
CREATE INDEX "Compliance_visaExpiry_idx" ON "Compliance"("visaExpiry");

-- CreateIndex
CREATE INDEX "Compliance_medicalCertificateExpiry_idx" ON "Compliance"("medicalCertificateExpiry");

-- CreateIndex
CREATE INDEX "Compliance_policeCheckExpiry_idx" ON "Compliance"("policeCheckExpiry");

-- CreateIndex
CREATE INDEX "AuditLog_actor_idx" ON "AuditLog"("actor");

-- CreateIndex
CREATE INDEX "AuditLog_timestamp_idx" ON "AuditLog"("timestamp");

-- CreateIndex
CREATE INDEX "AuditLog_module_idx" ON "AuditLog"("module");

-- CreateIndex
CREATE INDEX "AuditLog_actor_timestamp_idx" ON "AuditLog"("actor", "timestamp");

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_idx" ON "Notification"("userId", "isRead");

-- CreateIndex
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Conversation_user2id_idx" ON "Conversation"("user2id");

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_user1id_user2id_key" ON "Conversation"("user1id", "user2id");

-- CreateIndex
CREATE INDEX "Message_senderId_idx" ON "Message"("senderId");

-- CreateIndex
CREATE INDEX "Message_conversationId_timestamp_idx" ON "Message"("conversationId", "timestamp");

-- AddForeignKey
ALTER TABLE "Users" ADD CONSTRAINT "Users_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "TenantSettings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_assignedDriver_fkey" FOREIGN KEY ("assignedDriver") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_assignedVehicle_fkey" FOREIGN KEY ("assignedVehicle") REFERENCES "Fleet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryPackage" ADD CONSTRAINT "DeliveryPackage_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "Delivery"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fleet" ADD CONSTRAINT "Fleet_assignedDriver_fkey" FOREIGN KEY ("assignedDriver") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Maintenance" ADD CONSTRAINT "Maintenance_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Fleet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inspections" ADD CONSTRAINT "Inspections_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inspections" ADD CONSTRAINT "Inspections_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Fleet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DamageReport" ADD CONSTRAINT "DamageReport_reportedBy_fkey" FOREIGN KEY ("reportedBy") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DamageReport" ADD CONSTRAINT "DamageReport_vehicle_fkey" FOREIGN KEY ("vehicle") REFERENCES "Fleet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepairRequest" ADD CONSTRAINT "RepairRequest_reportedBy_fkey" FOREIGN KEY ("reportedBy") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepairRequest" ADD CONSTRAINT "RepairRequest_vehicle_fkey" FOREIGN KEY ("vehicle") REFERENCES "Fleet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleID_fkey" FOREIGN KEY ("roleID") REFERENCES "Access_Roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_moduleID_fkey" FOREIGN KEY ("moduleID") REFERENCES "Access_Module"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionID_fkey" FOREIGN KEY ("permissionID") REFERENCES "AccessAction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Roster" ADD CONSTRAINT "Roster_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Roster" ADD CONSTRAINT "Roster_assistantId_fkey" FOREIGN KEY ("assistantId") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Roster" ADD CONSTRAINT "Roster_vehicle_fkey" FOREIGN KEY ("vehicle") REFERENCES "Fleet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Compliance" ADD CONSTRAINT "Compliance_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actor_fkey" FOREIGN KEY ("actor") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_user1id_fkey" FOREIGN KEY ("user1id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_user2id_fkey" FOREIGN KEY ("user2id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
