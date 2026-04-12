-- AlterTable
ALTER TABLE `ContactRequest` ADD COLUMN `seenByAdminAt` DATETIME(3) NULL;

-- Treat existing rows as already seen so the bell only reflects new submissions after deploy
UPDATE `ContactRequest` SET `seenByAdminAt` = `createdAt` WHERE `seenByAdminAt` IS NULL;
