ALTER TABLE `merge_requests` ADD COLUMN `email` text NOT NULL DEFAULT '';
ALTER TABLE `merge_requests` ADD COLUMN `full_name` text NOT NULL DEFAULT ''; 