ALTER TABLE "user_session" RENAME TO "session";--> statement-breakpoint
ALTER TABLE "auth_user" RENAME TO "user";--> statement-breakpoint
ALTER TABLE "user" DROP CONSTRAINT "auth_user_username_unique";--> statement-breakpoint
ALTER TABLE "session" DROP CONSTRAINT "user_session_user_id_auth_user_id_fk";
--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "user_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "id" SET DATA TYPE text;
--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "expires_at" timestamp with time zone;
UPDATE "session" SET "expires_at" = to_timestamp("idle_expires" / 1000);
ALTER TABLE "session" ALTER COLUMN "expires_at" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "hashed_password" text;

UPDATE "user" SET "hashed_password" = "user_key"."hashed_password" FROM "user_key"
WHERE "user_key"."user_id" = "user"."id"
AND "user_key"."hashed_password" IS NOT NULL;

ALTER TABLE "user" ALTER COLUMN "hashed_password" SET NOT NULL;

DROP TABLE "user_key";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "session" DROP COLUMN IF EXISTS "active_expires";--> statement-breakpoint
ALTER TABLE "session" DROP COLUMN IF EXISTS "idle_expires";--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_username_unique" UNIQUE("username");