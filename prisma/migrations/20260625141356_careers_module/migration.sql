-- CreateTable
CREATE TABLE `CareerJob` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `department` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NOT NULL DEFAULT 'Abu Dhabi, UAE',
    `jobType` VARCHAR(191) NOT NULL DEFAULT 'Full-Time',
    `experienceRequired` VARCHAR(191) NOT NULL DEFAULT '1-3 years',
    `salaryRange` VARCHAR(191) NULL,
    `overview` TEXT NOT NULL,
    `responsibilities` TEXT NOT NULL,
    `requirements` TEXT NOT NULL,
    `preferredSkills` TEXT NULL,
    `requiredDocuments` TEXT NULL,
    `benefits` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Draft',
    `featured` BOOLEAN NOT NULL DEFAULT false,
    `published` BOOLEAN NOT NULL DEFAULT false,
    `closingDate` DATETIME(3) NULL,
    `seoTitle` VARCHAR(191) NULL,
    `seoDescription` TEXT NULL,
    `createdBy` VARCHAR(191) NOT NULL DEFAULT '',
    `updatedBy` VARCHAR(191) NOT NULL DEFAULT '',
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `CareerJob_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `JobApplication` (
    `id` VARCHAR(191) NOT NULL,
    `applicationId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `submittedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `jobId` VARCHAR(191) NULL,
    `candidateId` VARCHAR(191) NULL,
    `fullName` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `whatsapp` VARCHAR(191) NULL,
    `email` VARCHAR(191) NOT NULL,
    `nationality` VARCHAR(191) NULL,
    `currentLocation` VARCHAR(191) NULL,
    `visaStatus` VARCHAR(191) NULL,
    `yearsExperience` VARCHAR(191) NULL,
    `positionApplied` VARCHAR(191) NOT NULL,
    `department` VARCHAR(191) NULL,
    `currentSalary` VARCHAR(191) NULL,
    `expectedSalary` VARCHAR(191) NULL,
    `noticePeriod` VARCHAR(191) NULL,
    `drivingLicense` BOOLEAN NOT NULL DEFAULT false,
    `skills` TEXT NULL,
    `message` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'New',
    `rating` INTEGER NOT NULL DEFAULT 0,
    `assignedToId` VARCHAR(191) NULL,
    `consentGiven` BOOLEAN NOT NULL DEFAULT false,
    `consentText` TEXT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `JobApplication_applicationId_key`(`applicationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Candidate` (
    `id` VARCHAR(191) NOT NULL,
    `candidateId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `fullName` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `whatsapp` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `nationality` VARCHAR(191) NULL,
    `currentLocation` VARCHAR(191) NULL,
    `visaStatus` VARCHAR(191) NULL,
    `yearsExperience` VARCHAR(191) NULL,
    `skills` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Active',
    `rating` INTEGER NOT NULL DEFAULT 0,
    `notes` TEXT NULL,

    UNIQUE INDEX `Candidate_candidateId_key`(`candidateId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CandidateDocument` (
    `id` VARCHAR(191) NOT NULL,
    `uploadedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `candidateId` VARCHAR(191) NULL,
    `applicationId` VARCHAR(191) NULL,
    `fileName` VARCHAR(191) NOT NULL,
    `fileType` VARCHAR(191) NOT NULL,
    `fileUrl` VARCHAR(1000) NOT NULL,
    `fileSize` INTEGER NOT NULL DEFAULT 0,
    `documentType` VARCHAR(191) NOT NULL DEFAULT 'CV',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Interview` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `applicationId` VARCHAR(191) NOT NULL,
    `candidateId` VARCHAR(191) NULL,
    `jobId` VARCHAR(191) NULL,
    `interviewDate` DATETIME(3) NOT NULL,
    `interviewTime` VARCHAR(191) NULL,
    `mode` VARCHAR(191) NOT NULL DEFAULT 'In-person',
    `location` VARCHAR(191) NULL,
    `interviewerId` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Scheduled',
    `result` VARCHAR(191) NULL,
    `notes` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ApplicationNote` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `applicationId` VARCHAR(191) NOT NULL,
    `authorName` VARCHAR(191) NOT NULL DEFAULT '',
    `note` TEXT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ApplicationStatusHistory` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `applicationId` VARCHAR(191) NOT NULL,
    `fromStatus` VARCHAR(191) NOT NULL,
    `toStatus` VARCHAR(191) NOT NULL,
    `changedBy` VARCHAR(191) NOT NULL DEFAULT '',
    `note` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CareerSetting` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `value` TEXT NOT NULL,

    UNIQUE INDEX `CareerSetting_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `JobApplication` ADD CONSTRAINT `JobApplication_jobId_fkey` FOREIGN KEY (`jobId`) REFERENCES `CareerJob`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JobApplication` ADD CONSTRAINT `JobApplication_candidateId_fkey` FOREIGN KEY (`candidateId`) REFERENCES `Candidate`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JobApplication` ADD CONSTRAINT `JobApplication_assignedToId_fkey` FOREIGN KEY (`assignedToId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CandidateDocument` ADD CONSTRAINT `CandidateDocument_candidateId_fkey` FOREIGN KEY (`candidateId`) REFERENCES `Candidate`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CandidateDocument` ADD CONSTRAINT `CandidateDocument_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `JobApplication`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Interview` ADD CONSTRAINT `Interview_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `JobApplication`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Interview` ADD CONSTRAINT `Interview_candidateId_fkey` FOREIGN KEY (`candidateId`) REFERENCES `Candidate`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Interview` ADD CONSTRAINT `Interview_jobId_fkey` FOREIGN KEY (`jobId`) REFERENCES `CareerJob`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Interview` ADD CONSTRAINT `Interview_interviewerId_fkey` FOREIGN KEY (`interviewerId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ApplicationNote` ADD CONSTRAINT `ApplicationNote_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `JobApplication`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ApplicationStatusHistory` ADD CONSTRAINT `ApplicationStatusHistory_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `JobApplication`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
