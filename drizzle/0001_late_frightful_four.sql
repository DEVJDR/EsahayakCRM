ALTER TABLE "buyers" ALTER COLUMN "created_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "buyers" ALTER COLUMN "created_at" SET DEFAULT now();