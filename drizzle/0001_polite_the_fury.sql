DO $$ BEGIN
 CREATE TYPE "operation" AS ENUM('add', 'remove');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "history" (
	"timestamp" timestamp with time zone DEFAULT now(),
	"name" varchar(300),
	"operation" "operation"
);
