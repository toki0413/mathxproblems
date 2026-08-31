ALTER TABLE "users" DROP CONSTRAINT "users_unionId_unique";--> statement-breakpoint
ALTER TABLE "problem_attempt_votes" ALTER COLUMN "userId" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "problem_updates" ALTER COLUMN "userId" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "submissions" ALTER COLUMN "userId" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "unionId" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "problem_attempt_votes" ADD COLUMN "visitorId" varchar(64);--> statement-breakpoint
ALTER TABLE "problem_attempts" ADD COLUMN "visitorId" varchar(64);--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "visitorId" varchar(64);--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "authorName" varchar(128);--> statement-breakpoint
CREATE UNIQUE INDEX "problem_attempt_votes_visitor_uidx" ON "problem_attempt_votes" USING btree ("attemptId","visitorId") WHERE "problem_attempt_votes"."visitorId" is not null;