-- Add likes table
CREATE TABLE IF NOT EXISTS `likes` (
  `id` varchar(36) PRIMARY KEY,
  `article_id` varchar(36) NOT NULL,
  `user_id` varchar(36),
  `ip_address` varchar(45),
  `created_at` datetime DEFAULT (NOW()),
  FOREIGN KEY (`article_id`) REFERENCES `articles`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_article_likes` (`article_id`),
  INDEX `idx_user_likes` (`user_id`),
  INDEX `idx_ip_likes` (`ip_address`)
);

-- Add comments table
CREATE TABLE IF NOT EXISTS `comments` (
  `id` varchar(36) PRIMARY KEY,
  `article_id` varchar(36) NOT NULL,
  `user_id` varchar(36),
  `parent_id` varchar(36),
  `content` text NOT NULL,
  `author_name` varchar(255),
  `author_email` varchar(255),
  `is_approved` boolean DEFAULT true,
  `created_at` datetime DEFAULT (NOW()),
  `updated_at` datetime DEFAULT (NOW()),
  FOREIGN KEY (`article_id`) REFERENCES `articles`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`parent_id`) REFERENCES `comments`(`id`) ON DELETE CASCADE,
  INDEX `idx_article_comments` (`article_id`),
  INDEX `idx_parent_comments` (`parent_id`),
  INDEX `idx_approved_comments` (`is_approved`)
);
