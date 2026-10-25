ALTER TABLE "conversations" ADD COLUMN "ip_hash" text;--> statement-breakpoint
ALTER TABLE "conversations" ADD COLUMN "consent_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "conversations" ADD COLUMN "expires_at" timestamp with time zone DEFAULT now() + interval '90 days' NOT NULL;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "expires_at" timestamp with time zone DEFAULT now() + interval '365 days' NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "tokens_in" integer;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "tokens_out" integer;--> statement-breakpoint
CREATE INDEX "conversations_expires_at_idx" ON "conversations" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "leads_expires_at_idx" ON "leads" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "messages_conversation_id_idx" ON "messages" USING btree ("conversation_id");