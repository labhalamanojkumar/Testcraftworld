-- Migration: Enhance API Keys table with advanced features
-- Add columns for scopes, rate limits, IP whitelisting, expiration, usage tracking, and metadata

-- Add new columns to api_keys table
ALTER TABLE `api_keys` 
  ADD COLUMN `scopes` JSON DEFAULT NULL COMMENT 'Custom scopes/features enabled for this key',
  ADD COLUMN `rate_limit` INT DEFAULT 100 COMMENT 'Maximum API calls per hour',
  ADD COLUMN `allowed_ips` JSON DEFAULT NULL COMMENT 'Array of whitelisted IP addresses',
  ADD COLUMN `expires_at` DATETIME DEFAULT NULL COMMENT 'Key expiration date',
  ADD COLUMN `usage_count` INT DEFAULT 0 COMMENT 'Total number of API calls made',
  ADD COLUMN `metadata` JSON DEFAULT NULL COMMENT 'Additional metadata (AI model preferences, etc.)';

-- Update existing records to set default rate limit
UPDATE `api_keys` SET `rate_limit` = 100 WHERE `rate_limit` IS NULL;

-- Create index on expires_at for efficient expiration checks
CREATE INDEX `idx_api_keys_expires_at` ON `api_keys` (`expires_at`);

-- Create index on is_active for filtering active keys
CREATE INDEX `idx_api_keys_is_active` ON `api_keys` (`is_active`);

-- Create index on user_id for user-specific key queries
CREATE INDEX `idx_api_keys_user_id` ON `api_keys` (`user_id`);
