CREATE TABLE "buyers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"email" varchar(254) NOT NULL,
	"phone" varchar(50) NOT NULL,
	"source" varchar(100) DEFAULT 'web',
	"property_type" varchar(100) DEFAULT 'any',
	"budget_min" integer DEFAULT 0,
	"budget_max" integer DEFAULT 0,
	"message" text,
	"status" varchar(50) DEFAULT 'new',
	"created_at" timestamp with time zone DEFAULT now()
);
