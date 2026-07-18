CREATE TYPE "public"."billing_cycle" AS ENUM('monthly', 'yearly', 'weekly', 'quarterly', 'one_time');--> statement-breakpoint
CREATE TYPE "public"."document_category" AS ENUM('bill', 'prescription', 'insurance', 'warranty', 'appointment', 'other');--> statement-breakpoint
CREATE TYPE "public"."document_status" AS ENUM('pending', 'processing', 'done', 'error');--> statement-breakpoint
CREATE TYPE "public"."gmail_connection_status" AS ENUM('connected', 'revoked', 'error');--> statement-breakpoint
CREATE TYPE "public"."gmail_insight_status" AS ENUM('active', 'paid', 'cancelled', 'expired', 'upcoming', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."gmail_item_type" AS ENUM('subscription', 'bill', 'receipt', 'statement', 'insurance', 'warranty', 'appointment', 'refund', 'other');--> statement-breakpoint
CREATE TYPE "public"."spending_category" AS ENUM('streaming', 'software', 'utilities', 'telecom', 'insurance', 'healthcare', 'shopping', 'food', 'transport', 'housing', 'finance', 'education', 'travel', 'other');--> statement-breakpoint
CREATE TABLE "documents" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"original_name" text NOT NULL,
	"filename" text NOT NULL,
	"mime_type" text NOT NULL,
	"size_bytes" integer NOT NULL,
	"category" "document_category" DEFAULT 'other' NOT NULL,
	"status" "document_status" DEFAULT 'pending' NOT NULL,
	"uploaded_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"extracted_data" jsonb DEFAULT 'null'::jsonb
);
--> statement-breakpoint
CREATE TABLE "gmail_connections" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"google_email" text NOT NULL,
	"refresh_token_encrypted" text NOT NULL,
	"scopes" text NOT NULL,
	"status" "gmail_connection_status" DEFAULT 'connected' NOT NULL,
	"connected_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_synced_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "gmail_connections_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "gmail_insights" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"gmail_message_id" text NOT NULL,
	"gmail_thread_id" text NOT NULL,
	"fingerprint" text NOT NULL,
	"type" "gmail_item_type" NOT NULL,
	"category" "spending_category" NOT NULL,
	"title" text NOT NULL,
	"merchant_name" text,
	"merchant_domain" text,
	"amount_value" numeric(12, 2),
	"currency" text,
	"billing_cycle" "billing_cycle",
	"issued_at" text,
	"paid_at" text,
	"due_date" text,
	"renewal_date" text,
	"service_date" text,
	"status" "gmail_insight_status" DEFAULT 'unknown' NOT NULL,
	"summary" text NOT NULL,
	"confidence" double precision NOT NULL,
	"raw" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"google_id" text NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"avatar_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_google_id_unique" UNIQUE("google_id"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gmail_connections" ADD CONSTRAINT "gmail_connections_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gmail_insights" ADD CONSTRAINT "gmail_insights_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "gmail_insights_user_message_fingerprint_uidx" ON "gmail_insights" USING btree ("user_id","gmail_message_id","fingerprint");