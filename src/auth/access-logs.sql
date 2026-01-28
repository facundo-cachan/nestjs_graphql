-- Create access_logs table for audit logging
CREATE TABLE IF NOT EXISTS `access_logs` (
  `id` CHAR(36) NOT NULL,
  `correlationId` VARCHAR(255) NOT NULL,
  `userId` VARCHAR(255) NOT NULL,
  `appId` VARCHAR(255) NOT NULL,
  `action` VARCHAR(50) NOT NULL,
  `resource` VARCHAR(500) NOT NULL,
  `statusCode` INT NOT NULL,
  `ipAddress` VARCHAR(45) NOT NULL,
  `userAgent` TEXT NULL,
  `metadata` JSON NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_correlationId` (`correlationId`),
  INDEX `idx_userId` (`userId`),
  INDEX `idx_createdAt` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert example audit log
INSERT INTO `access_logs` (
  `id`,
  `correlationId`,
  `userId`,
  `appId`,
  `action`,
  `resource`,
  `statusCode`,
  `ipAddress`,
  `userAgent`,
  `metadata`,
  `createdAt`
) VALUES (
  UUID(),
  UUID(),
  'jdoe123',
  'SIGESTA_AUTH_PROXY',
  'POST',
  '/auth/login',
  200,
  '192.168.1.100',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  JSON_OBJECT(
    'duration', '45ms',
    'roles', JSON_ARRAY('user'),
    'error', NULL
  ),
  NOW()
);
