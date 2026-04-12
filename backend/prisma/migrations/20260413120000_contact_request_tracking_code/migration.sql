-- Idempotent: legacy DBs may have ContactRequest without trackingCode; fresh installs already have it from 20260412131324.

SET @db := DATABASE();

SET @sql := (
  SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'ContactRequest' AND COLUMN_NAME = 'trackingCode') = 0,
    'ALTER TABLE `ContactRequest` ADD COLUMN `trackingCode` VARCHAR(191) NULL',
    'SELECT 1'
  )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

UPDATE `ContactRequest`
SET `trackingCode` = CONCAT('TRK-', LPAD(`id`, 9, '0'))
WHERE `trackingCode` IS NULL;

ALTER TABLE `ContactRequest` MODIFY COLUMN `trackingCode` VARCHAR(191) NOT NULL;

SET @sql := (
  SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
     WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'ContactRequest' AND INDEX_NAME = 'ContactRequest_trackingCode_key') = 0,
    'CREATE UNIQUE INDEX `ContactRequest_trackingCode_key` ON `ContactRequest`(`trackingCode`)',
    'SELECT 1'
  )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
