-- CreateTable
CREATE TABLE `TestimonialsSection` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sectionTitle` VARCHAR(500) NOT NULL,
    `sectionDescription` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Location` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sectionTitle` VARCHAR(191) NOT NULL DEFAULT 'فروعنا',
    `sectionDesc` VARCHAR(191) NOT NULL DEFAULT 'ابدأ رحلتك مع صناع الفرص...اعرف اقرب فرع إليك الآن',
    `callTitle` VARCHAR(191) NOT NULL DEFAULT 'اتصل بنا',
    `callDesc` VARCHAR(191) NOT NULL DEFAULT 'لا تتردد في التواصل',
    `phone` VARCHAR(191) NOT NULL DEFAULT '920032165',
    `workingHours` LONGTEXT NULL,
    `addresses` LONGTEXT NULL,
    `heroTagline` TEXT NULL,
    `logoUrl` VARCHAR(191) NULL,
    `mapImageUrl` VARCHAR(191) NULL,
    `companySubtitle` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HomeFeatures` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sectionTitle` VARCHAR(191) NOT NULL DEFAULT 'اكتشف قوة ميزاتنا',
    `sectionSubtitle` TEXT NOT NULL,
    `itemsJson` LONGTEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HomeIntro` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `statsJson` LONGTEXT NOT NULL,
    `howHeading` TEXT NOT NULL,
    `howBody` TEXT NOT NULL,
    `howVideoUrl` VARCHAR(191) NULL,
    `howPosterUrl` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HomeWorkConsultant` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `workTitle` TEXT NOT NULL,
    `workSubtitle` TEXT NOT NULL,
    `step1Text` TEXT NOT NULL,
    `step2Text` TEXT NOT NULL,
    `step3Text` TEXT NOT NULL,
    `consultantRole` VARCHAR(191) NOT NULL DEFAULT 'CEO',
    `consultantHeading` TEXT NOT NULL,
    `consultantBio` LONGTEXT NOT NULL,
    `consultantImageUrl` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FooterSocial` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `twitter` VARCHAR(2000) NULL,
    `instagram` VARCHAR(2000) NULL,
    `youtube` VARCHAR(2000) NULL,
    `facebook` VARCHAR(2000) NULL,
    `linkedin` VARCHAR(2000) NULL,
    `tiktok` VARCHAR(2000) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
