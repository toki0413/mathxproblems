CREATE TABLE "problem_attempt_votes" (
	"id" serial PRIMARY KEY NOT NULL,
	"attemptId" bigint NOT NULL,
	"userId" bigint NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "problem_attempts" (
	"id" serial PRIMARY KEY NOT NULL,
	"problemId" varchar(32) NOT NULL,
	"userId" bigint,
	"authorName" varchar(128),
	"kind" "attempt_kind" DEFAULT 'progress' NOT NULL,
	"title" varchar(300) NOT NULL,
	"content" text NOT NULL,
	"narrative" text,
	"newBand" varchar(80),
	"formalStatus" "formal_status",
	"method" varchar(80),
	"status" "attempt_status" DEFAULT 'pending' NOT NULL,
	"reviewerNote" text,
	"votes" bigint DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "problem_updates" (
	"id" serial PRIMARY KEY NOT NULL,
	"problemId" varchar(32) NOT NULL,
	"userId" bigint NOT NULL,
	"date" varchar(16) NOT NULL,
	"note" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "submissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" bigint NOT NULL,
	"title" varchar(500) NOT NULL,
	"titleZh" varchar(500) NOT NULL,
	"domain" varchar(64) NOT NULL,
	"payload" text NOT NULL,
	"status" "submission_status" DEFAULT 'pending' NOT NULL,
	"reviewerNote" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"unionId" varchar(255) NOT NULL,
	"name" varchar(255),
	"email" varchar(320),
	"avatar" text,
	"role" "role" DEFAULT 'user' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignInAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_unionId_unique" UNIQUE("unionId")
);
--> statement-breakpoint
ALTER TABLE "problem_attempt_votes" ADD CONSTRAINT "problem_attempt_votes_attemptId_problem_attempts_id_fk" FOREIGN KEY ("attemptId") REFERENCES "public"."problem_attempts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "problem_attempt_votes" ADD CONSTRAINT "problem_attempt_votes_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "problem_attempts" ADD CONSTRAINT "problem_attempts_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "problem_updates" ADD CONSTRAINT "problem_updates_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;