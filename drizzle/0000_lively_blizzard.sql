CREATE TABLE "audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"election_id" integer,
	"event_type" text NOT NULL,
	"event_hash" text NOT NULL,
	"timestamp" timestamp DEFAULT now(),
	"metadata" jsonb,
	"zero_knowledge_proof" text
);
--> statement-breakpoint
CREATE TABLE "authority_nodes" (
	"id" serial PRIMARY KEY NOT NULL,
	"node_id" text NOT NULL,
	"public_key" text NOT NULL,
	"name" text,
	"is_active" boolean DEFAULT true,
	"weight" integer DEFAULT 1,
	CONSTRAINT "authority_nodes_node_id_unique" UNIQUE("node_id"),
	CONSTRAINT "authority_nodes_public_key_unique" UNIQUE("public_key")
);
--> statement-breakpoint
CREATE TABLE "blocks" (
	"id" serial PRIMARY KEY NOT NULL,
	"election_id" integer NOT NULL,
	"block_number" integer NOT NULL,
	"previous_hash" text NOT NULL,
	"block_hash" text NOT NULL,
	"timestamp" timestamp DEFAULT now(),
	"merkle_root" text NOT NULL,
	"authority_signature" text NOT NULL,
	"transactions_count" integer NOT NULL,
	CONSTRAINT "blocks_block_hash_unique" UNIQUE("block_hash")
);
--> statement-breakpoint
CREATE TABLE "candidates" (
	"id" serial PRIMARY KEY NOT NULL,
	"election_id" integer NOT NULL,
	"name" text NOT NULL,
	"photo_url" text,
	"description" text,
	"public_key" text
);
--> statement-breakpoint
CREATE TABLE "election_results" (
	"id" serial PRIMARY KEY NOT NULL,
	"election_id" integer,
	"candidate_id" integer,
	"vote_count" integer DEFAULT 0 NOT NULL,
	"tally_proof" text,
	"finalized_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "elections" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"code" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"start_time" timestamp,
	"end_time" timestamp,
	"blockchain_address" text,
	"genesis_block_hash" text,
	"is_finalized" boolean DEFAULT false,
	CONSTRAINT "elections_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "vote_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"block_id" integer,
	"transaction_hash" text NOT NULL,
	"encrypted_vote" text NOT NULL,
	"schnorr_signature" text NOT NULL,
	"bulletproof" text NOT NULL,
	"timestamp" timestamp DEFAULT now(),
	"nullifier_hash" text NOT NULL,
	"verification_data" jsonb,
	CONSTRAINT "vote_transactions_transaction_hash_unique" UNIQUE("transaction_hash"),
	CONSTRAINT "vote_transactions_nullifier_hash_unique" UNIQUE("nullifier_hash")
);
--> statement-breakpoint
CREATE TABLE "voters" (
	"id" serial PRIMARY KEY NOT NULL,
	"election_id" integer NOT NULL,
	"code" text NOT NULL,
	"registration_time" timestamp DEFAULT now(),
	"public_key" text,
	"commitment" text,
	"nullifier_hash" text,
	"has_voted" boolean DEFAULT false,
	CONSTRAINT "voters_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_election_id_elections_id_fk" FOREIGN KEY ("election_id") REFERENCES "public"."elections"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blocks" ADD CONSTRAINT "blocks_election_id_elections_id_fk" FOREIGN KEY ("election_id") REFERENCES "public"."elections"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_election_id_elections_id_fk" FOREIGN KEY ("election_id") REFERENCES "public"."elections"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "election_results" ADD CONSTRAINT "election_results_election_id_elections_id_fk" FOREIGN KEY ("election_id") REFERENCES "public"."elections"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "election_results" ADD CONSTRAINT "election_results_candidate_id_candidates_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vote_transactions" ADD CONSTRAINT "vote_transactions_block_id_blocks_id_fk" FOREIGN KEY ("block_id") REFERENCES "public"."blocks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voters" ADD CONSTRAINT "voters_election_id_elections_id_fk" FOREIGN KEY ("election_id") REFERENCES "public"."elections"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "block_election_number_idx" ON "blocks" USING btree ("election_id","block_number");