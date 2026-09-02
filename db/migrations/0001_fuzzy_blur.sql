CREATE TABLE `problem_comments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`problemId` text(32) NOT NULL,
	`visitorId` text(64),
	`authorName` text(128),
	`content` text NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL
);
