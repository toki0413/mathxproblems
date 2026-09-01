CREATE TABLE `problem_attempt_votes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`attemptId` integer NOT NULL,
	`userId` integer,
	`visitorId` text(64),
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`attemptId`) REFERENCES `problem_attempts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `problem_attempt_votes_visitor_uidx` ON `problem_attempt_votes` (`attemptId`,`visitorId`) WHERE "problem_attempt_votes"."visitorId" is not null;--> statement-breakpoint
CREATE TABLE `problem_attempts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`problemId` text(32) NOT NULL,
	`userId` integer,
	`visitorId` text(64),
	`authorName` text(128),
	`kind` text DEFAULT 'progress' NOT NULL,
	`title` text(300) NOT NULL,
	`content` text NOT NULL,
	`narrative` text,
	`newBand` text(80),
	`formalStatus` text,
	`method` text(80),
	`status` text DEFAULT 'pending' NOT NULL,
	`reviewerNote` text,
	`votes` integer DEFAULT 0 NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `problem_updates` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`problemId` text(32) NOT NULL,
	`userId` integer,
	`date` text(16) NOT NULL,
	`note` text NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `submissions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` integer,
	`visitorId` text(64),
	`authorName` text(128),
	`title` text(500) NOT NULL,
	`titleZh` text(500) NOT NULL,
	`domain` text(64) NOT NULL,
	`payload` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`reviewerNote` text,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`unionId` text(255),
	`name` text(255),
	`email` text(320),
	`avatar` text,
	`role` text DEFAULT 'user' NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch()) NOT NULL,
	`lastSignInAt` integer DEFAULT (unixepoch()) NOT NULL
);
