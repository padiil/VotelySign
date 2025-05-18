ALTER TABLE "voters" ADD COLUMN "wallet_address" text;--> statement-breakpoint
ALTER TABLE "voters" ADD COLUMN "wallet_chain_id" integer;--> statement-breakpoint
ALTER TABLE "voters" ADD COLUMN "wallet_signature" text;