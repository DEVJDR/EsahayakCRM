CREATE TABLE "buyer_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"buyer_id" uuid NOT NULL,
	"changed_by" uuid NOT NULL,
	"changed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"diff" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "buyers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" varchar(80) NOT NULL,
	"email" varchar(254),
	"phone" varchar(15) NOT NULL,
	"city" varchar(30) NOT NULL,
	"property_type" varchar(20) NOT NULL,
	"bhk" varchar(10),
	"purpose" varchar(10) NOT NULL,
	"budget_min" integer,
	"budget_max" integer,
	"timeline" varchar(20) NOT NULL,
	"source" varchar(20) NOT NULL,
	"status" varchar(20) DEFAULT 'New' NOT NULL,
	"notes" text,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"owner_id" uuid NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP TABLE "buyers" CASCADE;