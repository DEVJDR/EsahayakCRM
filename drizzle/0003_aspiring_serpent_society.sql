ALTER TABLE "buyers" ALTER COLUMN "city" SET DATA TYPE "public"."city";--> statement-breakpoint
ALTER TABLE "buyers" ALTER COLUMN "property_type" SET DATA TYPE "public"."property_type";--> statement-breakpoint
ALTER TABLE "buyers" ALTER COLUMN "bhk" SET DATA TYPE "public"."bhk";--> statement-breakpoint
ALTER TABLE "buyers" ALTER COLUMN "purpose" SET DATA TYPE "public"."purpose";--> statement-breakpoint
ALTER TABLE "buyers" ALTER COLUMN "timeline" SET DATA TYPE timeline;--> statement-breakpoint
ALTER TABLE "buyers" ALTER COLUMN "source" SET DATA TYPE "public"."source";--> statement-breakpoint
ALTER TABLE "buyers" ALTER COLUMN "source" SET DEFAULT 'Website';--> statement-breakpoint
ALTER TABLE "buyers" ALTER COLUMN "status" SET DATA TYPE "public"."status";--> statement-breakpoint
ALTER TABLE "buyers" ALTER COLUMN "status" SET DEFAULT 'New';--> statement-breakpoint
ALTER TABLE "buyer_history" ADD CONSTRAINT "buyer_history_buyer_id_buyers_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."buyers"("id") ON DELETE cascade ON UPDATE no action;