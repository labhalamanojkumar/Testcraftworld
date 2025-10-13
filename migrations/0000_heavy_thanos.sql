CREATE TABLE `articles` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`title` text NOT NULL,
	`content` text NOT NULL,
	`excerpt` text,
	`category_id` varchar(36),
	`author_id` varchar(36),
	`slug` text NOT NULL,
	`meta_title` text,
	`meta_description` text,
	`tags` text,
	`published` boolean DEFAULT false,
	`created_at` datetime DEFAULT NOW(),
	`updated_at` datetime DEFAULT NOW(),
	CONSTRAINT `articles_id` PRIMARY KEY(`id`),
	CONSTRAINT `articles_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	CONSTRAINT `categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `categories_name_unique` UNIQUE(`name`),
	CONSTRAINT `categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`username` text NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`name` text NOT NULL,
	`bio` text,
	`avatar` text,
	`role` text DEFAULT ('user'),
	`is_active` boolean DEFAULT true,
	`created_at` datetime DEFAULT NOW(),
	`updated_at` datetime DEFAULT NOW(),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_username_unique` UNIQUE(`username`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `articles` ADD CONSTRAINT `articles_category_id_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `articles` ADD CONSTRAINT `articles_author_id_users_id_fk` FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;