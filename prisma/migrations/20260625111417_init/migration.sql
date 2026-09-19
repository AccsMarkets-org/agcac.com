-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL DEFAULT 'Staff',
    `active` BOOLEAN NOT NULL DEFAULT true,
    `lastLogin` DATETIME(3) NULL,
    `phone` VARCHAR(191) NULL,
    `notes` TEXT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Lead` (
    `id` VARCHAR(191) NOT NULL,
    `leadId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `whatsapp` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `location` VARCHAR(191) NULL,
    `area` VARCHAR(191) NULL,
    `service` VARCHAR(191) NOT NULL,
    `propertyType` VARCHAR(191) NULL,
    `projectType` VARCHAR(191) NULL,
    `urgency` VARCHAR(191) NOT NULL DEFAULT 'Normal',
    `message` TEXT NULL,
    `numberOfRooms` VARCHAR(191) NULL,
    `approximateArea` VARCHAR(191) NULL,
    `numberOfACUnits` VARCHAR(191) NULL,
    `existingSystem` VARCHAR(191) NULL,
    `budgetRange` VARCHAR(191) NULL,
    `sourcePage` VARCHAR(191) NULL,
    `formName` VARCHAR(191) NULL,
    `ctaClicked` VARCHAR(191) NULL,
    `leadSource` VARCHAR(191) NULL,
    `utmSource` VARCHAR(191) NULL,
    `utmMedium` VARCHAR(191) NULL,
    `utmCampaign` VARCHAR(191) NULL,
    `utmTerm` VARCHAR(191) NULL,
    `utmContent` VARCHAR(191) NULL,
    `gclid` VARCHAR(191) NULL,
    `fbclid` VARCHAR(191) NULL,
    `deviceType` VARCHAR(191) NULL,
    `browser` VARCHAR(191) NULL,
    `referrer` VARCHAR(191) NULL,
    `landingPage` VARCHAR(191) NULL,
    `ipAddress` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'New',
    `priority` VARCHAR(191) NOT NULL DEFAULT 'Normal',
    `assignedToId` VARCHAR(191) NULL,
    `followUpDate` DATETIME(3) NULL,
    `internalNotes` TEXT NULL,
    `whatsappMessage` TEXT NULL,
    `projectName` VARCHAR(191) NULL,
    `projectCategory` VARCHAR(191) NULL,
    `consentGiven` BOOLEAN NOT NULL DEFAULT false,
    `consentText` TEXT NULL,
    `consentTimestamp` DATETIME(3) NULL,
    `privacyPolicyVersion` VARCHAR(191) NULL,
    `termsVersion` VARCHAR(191) NULL,
    `userAgentPlaceholder` VARCHAR(191) NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `Lead_leadId_key`(`leadId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FollowUp` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `leadId` VARCHAR(191) NOT NULL,
    `dueAt` DATETIME(3) NOT NULL,
    `note` TEXT NULL,
    `assignedById` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Pending',
    `completedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CallLog` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `leadId` VARCHAR(191) NOT NULL,
    `staffId` VARCHAR(191) NULL,
    `result` VARCHAR(191) NULL,
    `note` TEXT NULL,
    `nextFollowUp` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SiteVisit` (
    `id` VARCHAR(191) NOT NULL,
    `visitId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `leadId` VARCHAR(191) NULL,
    `customerName` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NOT NULL,
    `mapsLink` VARCHAR(191) NULL,
    `service` VARCHAR(191) NULL,
    `visitDate` DATETIME(3) NULL,
    `visitTime` VARCHAR(191) NULL,
    `assignedTechId` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Scheduled',
    `notes` TEXT NULL,
    `recommendation` TEXT NULL,
    `estimatedCost` VARCHAR(191) NULL,
    `customerDecision` VARCHAR(191) NULL,

    UNIQUE INDEX `SiteVisit_visitId_key`(`visitId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Quotation` (
    `id` VARCHAR(191) NOT NULL,
    `quoteId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `leadId` VARCHAR(191) NULL,
    `customerName` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `service` VARCHAR(191) NOT NULL,
    `quoteDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `validUntil` DATETIME(3) NULL,
    `discount` DOUBLE NOT NULL DEFAULT 0,
    `vat` DOUBLE NOT NULL DEFAULT 5,
    `notes` TEXT NULL,
    `terms` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Draft',

    UNIQUE INDEX `Quotation_quoteId_key`(`quoteId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `QuotationItem` (
    `id` VARCHAR(191) NOT NULL,
    `quotationId` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `quantity` DOUBLE NOT NULL DEFAULT 1,
    `unitPrice` DOUBLE NOT NULL,
    `total` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Invoice` (
    `id` VARCHAR(191) NOT NULL,
    `invoiceId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `customerId` VARCHAR(191) NULL,
    `quoteId` VARCHAR(191) NULL,
    `customerName` VARCHAR(191) NOT NULL DEFAULT '',
    `phone` VARCHAR(191) NOT NULL DEFAULT '',
    `address` VARCHAR(191) NULL,
    `service` VARCHAR(191) NOT NULL DEFAULT '',
    `invoiceDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dueDate` DATETIME(3) NULL,
    `notes` TEXT NULL,
    `discount` DOUBLE NOT NULL DEFAULT 0,
    `vat` DOUBLE NOT NULL DEFAULT 5,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Unpaid',

    UNIQUE INDEX `Invoice_invoiceId_key`(`invoiceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InvoiceItem` (
    `id` VARCHAR(191) NOT NULL,
    `invoiceId` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `quantity` DOUBLE NOT NULL DEFAULT 1,
    `unitPrice` DOUBLE NOT NULL,
    `total` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Payment` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `invoiceId` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `method` VARCHAR(191) NOT NULL DEFAULT 'Cash',
    `reference` VARCHAR(191) NULL,
    `note` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Customer` (
    `id` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `location` VARCHAR(191) NULL,
    `area` VARCHAR(191) NULL,
    `propertyType` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `totalValue` DOUBLE NOT NULL DEFAULT 0,
    `lastService` DATETIME(3) NULL,

    UNIQUE INDEX `Customer_customerId_key`(`customerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AMCContract` (
    `id` VARCHAR(191) NOT NULL,
    `amcId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `customerId` VARCHAR(191) NULL,
    `customerName` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NOT NULL,
    `propertyType` VARCHAR(191) NULL,
    `plan` VARCHAR(191) NOT NULL DEFAULT 'Standard',
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `numberOfVisits` INTEGER NOT NULL DEFAULT 4,
    `visitFrequency` VARCHAR(191) NOT NULL DEFAULT 'Quarterly',
    `equipment` TEXT NULL,
    `contractValue` DOUBLE NULL,
    `paymentStatus` VARCHAR(191) NOT NULL DEFAULT 'Pending',
    `notes` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Active',

    UNIQUE INDEX `AMCContract_amcId_key`(`amcId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TechnicianJob` (
    `id` VARCHAR(191) NOT NULL,
    `jobId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `leadId` VARCHAR(191) NULL,
    `customerName` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NOT NULL,
    `service` VARCHAR(191) NOT NULL,
    `jobDate` DATETIME(3) NULL,
    `jobTime` VARCHAR(191) NULL,
    `materials` TEXT NULL,
    `notes` TEXT NULL,
    `workNotes` TEXT NULL,
    `completionReport` TEXT NULL,
    `technicianName` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Assigned',

    UNIQUE INDEX `TechnicianJob_jobId_key`(`jobId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ActivityLog` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `leadId` VARCHAR(191) NULL,
    `action` VARCHAR(191) NOT NULL,
    `detail` TEXT NULL,
    `userId` VARCHAR(191) NULL,
    `userName` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Settings` (
    `id` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `value` TEXT NOT NULL,

    UNIQUE INDEX `Settings_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Certificate` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL DEFAULT 'General',
    `issueDate` DATETIME(3) NULL,
    `expiryDate` DATETIME(3) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Active',
    `showOnSite` BOOLEAN NOT NULL DEFAULT true,
    `fileUrl` VARCHAR(191) NULL,
    `notes` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TeamMember` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL,
    `department` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `notes` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PortfolioProject` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NULL,
    `systemType` VARCHAR(191) NULL,
    `scopeOfWork` TEXT NULL,
    `description` TEXT NULL,
    `featured` BOOLEAN NOT NULL DEFAULT false,
    `showOnSite` BOOLEAN NOT NULL DEFAULT true,
    `imageUrl` VARCHAR(191) NULL,
    `year` INTEGER NULL,
    `clientName` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Active',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ServiceCMS` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `icon` VARCHAR(191) NULL,
    `imageUrl` VARCHAR(191) NULL,
    `priceRange` VARCHAR(191) NULL,
    `seoTitle` VARCHAR(191) NULL,
    `seoDesc` TEXT NULL,
    `showOnSite` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Active',

    UNIQUE INDEX `ServiceCMS_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WebsiteContent` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `section` VARCHAR(191) NOT NULL DEFAULT 'General',
    `title` VARCHAR(191) NOT NULL,
    `content` LONGTEXT NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Active',
    `updatedBy` VARCHAR(191) NULL,

    UNIQUE INDEX `WebsiteContent_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PurchaseInvoice` (
    `id` VARCHAR(191) NOT NULL,
    `invoiceRef` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `supplierName` VARCHAR(191) NOT NULL,
    `supplierTRN` VARCHAR(191) NULL,
    `trnVerified` VARCHAR(191) NOT NULL DEFAULT 'NotVerified',
    `supplierAddress` VARCHAR(191) NULL,
    `invoiceDate` DATETIME(3) NOT NULL,
    `invoiceNumber` VARCHAR(191) NULL,
    `taxPeriodId` VARCHAR(191) NULL,
    `category` VARCHAR(191) NOT NULL DEFAULT 'General',
    `expenseType` VARCHAR(191) NULL,
    `netAmount` DOUBLE NOT NULL DEFAULT 0,
    `vatAmount` DOUBLE NOT NULL DEFAULT 0,
    `totalAmount` DOUBLE NOT NULL DEFAULT 0,
    `vatRate` DOUBLE NOT NULL DEFAULT 5,
    `vatTreatment` VARCHAR(191) NOT NULL DEFAULT 'Standard',
    `recoverableVAT` DOUBLE NOT NULL DEFAULT 0,
    `nonRecoverableVAT` DOUBLE NOT NULL DEFAULT 0,
    `paymentStatus` VARCHAR(191) NOT NULL DEFAULT 'Unpaid',
    `approvalStatus` VARCHAR(191) NOT NULL DEFAULT 'Pending',
    `approvedBy` VARCHAR(191) NULL,
    `approvedAt` DATETIME(3) NULL,
    `documentId` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `fileUrl` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Pending',
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `PurchaseInvoice_invoiceRef_key`(`invoiceRef`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PurchaseInvoiceItem` (
    `id` VARCHAR(191) NOT NULL,
    `purchaseId` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `quantity` DOUBLE NOT NULL DEFAULT 1,
    `unitPrice` DOUBLE NOT NULL,
    `discount` DOUBLE NOT NULL DEFAULT 0,
    `vatRate` DOUBLE NOT NULL DEFAULT 5,
    `vatAmount` DOUBLE NOT NULL DEFAULT 0,
    `total` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VATReturn` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `period` VARCHAR(191) NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `createdBy` VARCHAR(191) NOT NULL DEFAULT '',
    `standardSales` DOUBLE NOT NULL DEFAULT 0,
    `zeroRatedSales` DOUBLE NOT NULL DEFAULT 0,
    `exemptSales` DOUBLE NOT NULL DEFAULT 0,
    `outputVAT` DOUBLE NOT NULL DEFAULT 0,
    `salesNet` DOUBLE NOT NULL DEFAULT 0,
    `standardPurchases` DOUBLE NOT NULL DEFAULT 0,
    `recoverableInput` DOUBLE NOT NULL DEFAULT 0,
    `nonRecoverableInput` DOUBLE NOT NULL DEFAULT 0,
    `inputVAT` DOUBLE NOT NULL DEFAULT 0,
    `purchasesNet` DOUBLE NOT NULL DEFAULT 0,
    `adjustments` DOUBLE NOT NULL DEFAULT 0,
    `adjustmentNotes` TEXT NULL,
    `netVAT` DOUBLE NOT NULL DEFAULT 0,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Draft',
    `accountantApprovedBy` VARCHAR(191) NULL,
    `accountantApprovedAt` DATETIME(3) NULL,
    `adminApprovedBy` VARCHAR(191) NULL,
    `adminApprovedAt` DATETIME(3) NULL,
    `ftaRefNumber` VARCHAR(191) NULL,
    `submittedAt` DATETIME(3) NULL,
    `submittedBy` VARCHAR(191) NULL,
    `paymentRef` VARCHAR(191) NULL,
    `paidAt` DATETIME(3) NULL,
    `confirmationFileUrl` VARCHAR(191) NULL,
    `closedAt` DATETIME(3) NULL,
    `notes` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TaxSalesInvoice` (
    `id` VARCHAR(191) NOT NULL,
    `invoiceRef` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdBy` VARCHAR(191) NOT NULL DEFAULT '',
    `invoiceNumber` VARCHAR(191) NOT NULL,
    `invoiceDate` DATETIME(3) NOT NULL,
    `dateOfSupply` DATETIME(3) NULL,
    `customerName` VARCHAR(191) NOT NULL,
    `customerTRN` VARCHAR(191) NULL,
    `customerAddress` VARCHAR(191) NULL,
    `serviceType` VARCHAR(191) NOT NULL DEFAULT 'AC Service',
    `taxPeriodId` VARCHAR(191) NULL,
    `linkedQuoteId` VARCHAR(191) NULL,
    `linkedJobId` VARCHAR(191) NULL,
    `netAmount` DOUBLE NOT NULL DEFAULT 0,
    `vatRate` DOUBLE NOT NULL DEFAULT 5,
    `vatAmount` DOUBLE NOT NULL DEFAULT 0,
    `totalAmount` DOUBLE NOT NULL DEFAULT 0,
    `vatTreatment` VARCHAR(191) NOT NULL DEFAULT 'Standard',
    `paymentStatus` VARCHAR(191) NOT NULL DEFAULT 'Unpaid',
    `approvalStatus` VARCHAR(191) NOT NULL DEFAULT 'Pending',
    `approvedBy` VARCHAR(191) NULL,
    `approvedAt` DATETIME(3) NULL,
    `documentId` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Draft',
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `TaxSalesInvoice_invoiceRef_key`(`invoiceRef`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TaxSalesInvoiceItem` (
    `id` VARCHAR(191) NOT NULL,
    `invoiceId` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `quantity` DOUBLE NOT NULL DEFAULT 1,
    `unitPrice` DOUBLE NOT NULL,
    `discount` DOUBLE NOT NULL DEFAULT 0,
    `netAmount` DOUBLE NOT NULL DEFAULT 0,
    `vatRate` DOUBLE NOT NULL DEFAULT 5,
    `vatAmount` DOUBLE NOT NULL DEFAULT 0,
    `total` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TaxDocument` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `fileName` VARCHAR(191) NOT NULL,
    `originalName` VARCHAR(191) NOT NULL,
    `fileType` VARCHAR(191) NOT NULL,
    `fileSize` INTEGER NOT NULL DEFAULT 0,
    `filePath` VARCHAR(1000) NOT NULL,
    `category` VARCHAR(191) NOT NULL DEFAULT 'PurchaseInvoice',
    `linkedId` VARCHAR(191) NULL,
    `linkedType` VARCHAR(191) NULL,
    `uploadedBy` VARCHAR(191) NOT NULL DEFAULT '',
    `ocrProcessed` BOOLEAN NOT NULL DEFAULT false,
    `ocrResultId` VARCHAR(191) NULL,
    `approvalStatus` VARCHAR(191) NOT NULL DEFAULT 'Pending',
    `notes` TEXT NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OCRResult` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `documentId` VARCHAR(191) NOT NULL,
    `rawText` LONGTEXT NOT NULL,
    `confidence` DOUBLE NULL,
    `invoiceNumber` VARCHAR(191) NULL,
    `invoiceDate` VARCHAR(191) NULL,
    `dateOfSupply` VARCHAR(191) NULL,
    `supplierName` VARCHAR(191) NULL,
    `supplierAddress` TEXT NULL,
    `supplierTRN` VARCHAR(191) NULL,
    `customerName` VARCHAR(191) NULL,
    `customerAddress` TEXT NULL,
    `customerTRN` VARCHAR(191) NULL,
    `subtotal` DOUBLE NULL,
    `vatRate` DOUBLE NULL,
    `vatAmount` DOUBLE NULL,
    `totalAmount` DOUBLE NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'AED',
    `paymentTerms` TEXT NULL,
    `poNumber` VARCHAR(191) NULL,
    `bankDetails` TEXT NULL,
    `lineItemsRaw` TEXT NULL,
    `reviewedBy` VARCHAR(191) NULL,
    `reviewedAt` DATETIME(3) NULL,
    `corrected` BOOLEAN NOT NULL DEFAULT false,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Pending',

    UNIQUE INDEX `OCRResult_documentId_key`(`documentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TaxPeriod` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL DEFAULT 'Quarterly',
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Open',
    `vatReturnId` VARCHAR(191) NULL,
    `closedAt` DATETIME(3) NULL,
    `closedBy` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CorporateTaxReturn` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdBy` VARCHAR(191) NOT NULL DEFAULT '',
    `financialYear` VARCHAR(191) NOT NULL,
    `yearStart` DATETIME(3) NOT NULL,
    `yearEnd` DATETIME(3) NOT NULL,
    `revenue` DOUBLE NOT NULL DEFAULT 0,
    `costOfSales` DOUBLE NOT NULL DEFAULT 0,
    `grossProfit` DOUBLE NOT NULL DEFAULT 0,
    `operatingExpenses` DOUBLE NOT NULL DEFAULT 0,
    `otherIncome` DOUBLE NOT NULL DEFAULT 0,
    `otherExpenses` DOUBLE NOT NULL DEFAULT 0,
    `accountingNetProfit` DOUBLE NOT NULL DEFAULT 0,
    `nonDeductibleExpenses` DOUBLE NOT NULL DEFAULT 0,
    `deductibleAdjustments` DOUBLE NOT NULL DEFAULT 0,
    `exemptIncome` DOUBLE NOT NULL DEFAULT 0,
    `depreciationAdjustment` DOUBLE NOT NULL DEFAULT 0,
    `interestLimitation` DOUBLE NOT NULL DEFAULT 0,
    `relatedPartyAdjustments` DOUBLE NOT NULL DEFAULT 0,
    `taxLossesBF` DOUBLE NOT NULL DEFAULT 0,
    `taxLossesUsed` DOUBLE NOT NULL DEFAULT 0,
    `taxableIncome` DOUBLE NOT NULL DEFAULT 0,
    `taxableUpTo375k` DOUBLE NOT NULL DEFAULT 0,
    `taxableAbove375k` DOUBLE NOT NULL DEFAULT 0,
    `ctAt0Pct` DOUBLE NOT NULL DEFAULT 0,
    `ctAt9Pct` DOUBLE NOT NULL DEFAULT 0,
    `totalCTPayable` DOUBLE NOT NULL DEFAULT 0,
    `creditsPayments` DOUBLE NOT NULL DEFAULT 0,
    `netCTPayable` DOUBLE NOT NULL DEFAULT 0,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Draft',
    `accountantApprovedBy` VARCHAR(191) NULL,
    `accountantApprovedAt` DATETIME(3) NULL,
    `adminApprovedBy` VARCHAR(191) NULL,
    `adminApprovedAt` DATETIME(3) NULL,
    `ftaRefNumber` VARCHAR(191) NULL,
    `submittedAt` DATETIME(3) NULL,
    `submittedBy` VARCHAR(191) NULL,
    `paymentRef` VARCHAR(191) NULL,
    `paidAt` DATETIME(3) NULL,
    `confirmationFileUrl` VARCHAR(191) NULL,
    `notes` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TaxAuditLog` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `userId` VARCHAR(191) NOT NULL DEFAULT '',
    `userEmail` VARCHAR(191) NOT NULL DEFAULT '',
    `userRole` VARCHAR(191) NOT NULL DEFAULT '',
    `action` VARCHAR(191) NOT NULL,
    `module` VARCHAR(191) NOT NULL DEFAULT 'Tax',
    `recordId` VARCHAR(191) NULL,
    `recordType` VARCHAR(191) NULL,
    `beforeValue` TEXT NULL,
    `afterValue` TEXT NULL,
    `description` TEXT NOT NULL,
    `ipAddress` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TaxSetting` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `value` TEXT NOT NULL,
    `category` VARCHAR(191) NOT NULL DEFAULT 'General',
    `description` TEXT NULL,

    UNIQUE INDEX `TaxSetting_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LegalPage` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `content` LONGTEXT NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Published',
    `version` INTEGER NOT NULL DEFAULT 1,
    `lastUpdated` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `publishedAt` DATETIME(3) NULL,
    `createdBy` VARCHAR(191) NOT NULL DEFAULT 'system',
    `updatedBy` VARCHAR(191) NOT NULL DEFAULT 'system',
    `changeNote` TEXT NULL,

    UNIQUE INDEX `LegalPage_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LegalPageVersion` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `pageId` VARCHAR(191) NOT NULL,
    `version` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `content` LONGTEXT NOT NULL,
    `updatedBy` VARCHAR(191) NOT NULL DEFAULT 'system',
    `changeNote` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Archived',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CookieConsent` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `anonymousId` VARCHAR(191) NOT NULL,
    `essential` BOOLEAN NOT NULL DEFAULT true,
    `analytics` BOOLEAN NOT NULL DEFAULT false,
    `advertising` BOOLEAN NOT NULL DEFAULT false,
    `functional` BOOLEAN NOT NULL DEFAULT false,
    `consentTimestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `userAgent` TEXT NULL,
    `ipAddressPlaceholder` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PrivacyRequest` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `requestId` VARCHAR(191) NOT NULL,
    `fullName` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `requestType` VARCHAR(191) NOT NULL,
    `details` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'New',
    `adminNotes` TEXT NULL,
    `resolvedBy` VARCHAR(191) NULL,
    `resolvedAt` DATETIME(3) NULL,

    UNIQUE INDEX `PrivacyRequest_requestId_key`(`requestId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ConsentLog` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `leadId` VARCHAR(191) NULL,
    `formName` VARCHAR(191) NOT NULL,
    `consentText` TEXT NOT NULL,
    `privacyPolicyVersion` VARCHAR(191) NOT NULL DEFAULT '1.0',
    `termsVersion` VARCHAR(191) NOT NULL DEFAULT '1.0',
    `sourcePage` VARCHAR(191) NULL,
    `consentTimestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `userAgent` TEXT NULL,
    `ipAddressPlaceholder` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AIDocument` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `docId` VARCHAR(191) NOT NULL,
    `fileName` VARCHAR(191) NOT NULL,
    `originalName` VARCHAR(191) NOT NULL,
    `fileType` VARCHAR(191) NOT NULL,
    `fileSize` INTEGER NOT NULL DEFAULT 0,
    `filePath` VARCHAR(1000) NOT NULL,
    `fileHash` VARCHAR(191) NULL,
    `documentType` VARCHAR(191) NOT NULL DEFAULT 'Unknown',
    `uploadSource` VARCHAR(191) NOT NULL DEFAULT 'Manual',
    `uploadedById` VARCHAR(191) NOT NULL DEFAULT '',
    `uploadedByEmail` VARCHAR(191) NOT NULL DEFAULT '',
    `processingStatus` VARCHAR(191) NOT NULL DEFAULT 'Uploaded',
    `reviewStatus` VARCHAR(191) NOT NULL DEFAULT 'Pending',
    `confidenceScore` DOUBLE NOT NULL DEFAULT 0,
    `ocrRawText` LONGTEXT NULL,
    `extractedData` TEXT NULL,
    `validationData` TEXT NULL,
    `matchingData` TEXT NULL,
    `linkedInvoiceId` VARCHAR(191) NULL,
    `linkedCustomerId` VARCHAR(191) NULL,
    `linkedSupplierId` VARCHAR(191) NULL,
    `linkedProjectId` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `rejectionReason` TEXT NULL,
    `reviewedBy` VARCHAR(191) NULL,
    `reviewedAt` DATETIME(3) NULL,
    `approvedBy` VARCHAR(191) NULL,
    `approvedAt` DATETIME(3) NULL,
    `taxEntryCreated` BOOLEAN NOT NULL DEFAULT false,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `AIDocument_docId_key`(`docId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AIReviewTask` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `taskId` VARCHAR(191) NOT NULL,
    `documentId` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'NeedsReview',
    `assignedTo` VARCHAR(191) NULL,
    `assignedAt` DATETIME(3) NULL,
    `priority` VARCHAR(191) NOT NULL DEFAULT 'Normal',
    `reviewType` VARCHAR(191) NOT NULL DEFAULT 'InvoiceExtraction',
    `notes` TEXT NULL,
    `reviewerNotes` TEXT NULL,
    `actionTaken` VARCHAR(191) NULL,
    `resolvedAt` DATETIME(3) NULL,
    `resolvedBy` VARCHAR(191) NULL,
    `extractionEdits` TEXT NULL,
    `postingDetails` TEXT NULL,

    UNIQUE INDEX `AIReviewTask_taskId_key`(`taskId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AIValidationWarning` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `documentId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `severity` VARCHAR(191) NOT NULL DEFAULT 'Warning',
    `message` TEXT NOT NULL,
    `field` VARCHAR(191) NULL,
    `resolved` BOOLEAN NOT NULL DEFAULT false,
    `resolvedBy` VARCHAR(191) NULL,
    `resolvedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AIAutomationRule` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `ruleId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `trigger` VARCHAR(191) NOT NULL,
    `conditions` TEXT NOT NULL,
    `actions` TEXT NOT NULL,
    `priority` INTEGER NOT NULL DEFAULT 0,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `runCount` INTEGER NOT NULL DEFAULT 0,
    `lastRun` DATETIME(3) NULL,
    `createdBy` VARCHAR(191) NOT NULL DEFAULT '',

    UNIQUE INDEX `AIAutomationRule_ruleId_key`(`ruleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AISuggestion` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `suggestionId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `riskLevel` VARCHAR(191) NOT NULL DEFAULT 'Low',
    `relatedId` VARCHAR(191) NULL,
    `relatedType` VARCHAR(191) NULL,
    `actionType` VARCHAR(191) NULL,
    `actionData` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Open',
    `acceptedBy` VARCHAR(191) NULL,
    `acceptedAt` DATETIME(3) NULL,
    `dismissedBy` VARCHAR(191) NULL,
    `dismissedAt` DATETIME(3) NULL,

    UNIQUE INDEX `AISuggestion_suggestionId_key`(`suggestionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AIAnomaly` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `anomalyId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `riskLevel` VARCHAR(191) NOT NULL DEFAULT 'Medium',
    `relatedId` VARCHAR(191) NULL,
    `relatedType` VARCHAR(191) NULL,
    `data` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Open',
    `resolvedBy` VARCHAR(191) NULL,
    `resolvedAt` DATETIME(3) NULL,

    UNIQUE INDEX `AIAnomaly_anomalyId_key`(`anomalyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AIChatSession` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `sessionId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `userEmail` VARCHAR(191) NOT NULL DEFAULT '',
    `userRole` VARCHAR(191) NOT NULL DEFAULT '',
    `title` VARCHAR(191) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `AIChatSession_sessionId_key`(`sessionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AIChatMessage` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `sessionId` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL DEFAULT 'user',
    `content` LONGTEXT NOT NULL,
    `queryType` VARCHAR(191) NULL,
    `dataUsed` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AIAuditLog` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `userId` VARCHAR(191) NOT NULL DEFAULT '',
    `userEmail` VARCHAR(191) NOT NULL DEFAULT '',
    `userRole` VARCHAR(191) NOT NULL DEFAULT '',
    `action` VARCHAR(191) NOT NULL,
    `module` VARCHAR(191) NOT NULL DEFAULT 'AI',
    `recordId` VARCHAR(191) NULL,
    `recordType` VARCHAR(191) NULL,
    `beforeValue` TEXT NULL,
    `afterValue` TEXT NULL,
    `confidence` DOUBLE NULL,
    `reason` TEXT NULL,
    `ipAddress` VARCHAR(191) NULL,
    `details` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Lead` ADD CONSTRAINT `Lead_assignedToId_fkey` FOREIGN KEY (`assignedToId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FollowUp` ADD CONSTRAINT `FollowUp_leadId_fkey` FOREIGN KEY (`leadId`) REFERENCES `Lead`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FollowUp` ADD CONSTRAINT `FollowUp_assignedById_fkey` FOREIGN KEY (`assignedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CallLog` ADD CONSTRAINT `CallLog_leadId_fkey` FOREIGN KEY (`leadId`) REFERENCES `Lead`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CallLog` ADD CONSTRAINT `CallLog_staffId_fkey` FOREIGN KEY (`staffId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SiteVisit` ADD CONSTRAINT `SiteVisit_leadId_fkey` FOREIGN KEY (`leadId`) REFERENCES `Lead`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SiteVisit` ADD CONSTRAINT `SiteVisit_assignedTechId_fkey` FOREIGN KEY (`assignedTechId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Quotation` ADD CONSTRAINT `Quotation_leadId_fkey` FOREIGN KEY (`leadId`) REFERENCES `Lead`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QuotationItem` ADD CONSTRAINT `QuotationItem_quotationId_fkey` FOREIGN KEY (`quotationId`) REFERENCES `Quotation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Invoice` ADD CONSTRAINT `Invoice_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InvoiceItem` ADD CONSTRAINT `InvoiceItem_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `Invoice`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `Invoice`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AMCContract` ADD CONSTRAINT `AMCContract_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ActivityLog` ADD CONSTRAINT `ActivityLog_leadId_fkey` FOREIGN KEY (`leadId`) REFERENCES `Lead`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseInvoiceItem` ADD CONSTRAINT `PurchaseInvoiceItem_purchaseId_fkey` FOREIGN KEY (`purchaseId`) REFERENCES `PurchaseInvoice`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TaxSalesInvoiceItem` ADD CONSTRAINT `TaxSalesInvoiceItem_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `TaxSalesInvoice`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LegalPageVersion` ADD CONSTRAINT `LegalPageVersion_pageId_fkey` FOREIGN KEY (`pageId`) REFERENCES `LegalPage`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AIReviewTask` ADD CONSTRAINT `AIReviewTask_documentId_fkey` FOREIGN KEY (`documentId`) REFERENCES `AIDocument`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AIValidationWarning` ADD CONSTRAINT `AIValidationWarning_documentId_fkey` FOREIGN KEY (`documentId`) REFERENCES `AIDocument`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AIChatMessage` ADD CONSTRAINT `AIChatMessage_sessionId_fkey` FOREIGN KEY (`sessionId`) REFERENCES `AIChatSession`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
