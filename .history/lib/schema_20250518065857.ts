import {
  pgTable,
  serial,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  uuid,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// Core election tables (extending your existing tables)
export const elections = pgTable("elections", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  code: text("code").notNull().unique(),
  created_at: timestamp("created_at").defaultNow(),
  start_time: timestamp("start_time"),
  end_time: timestamp("end_time"),
  blockchain_address: text("blockchain_address"), // Address of the deployed election smart contract
  genesis_block_hash: text("genesis_block_hash"), // Hash of the genesis block for this election
  is_finalized: boolean("is_finalized").default(false),
});

export const candidates = pgTable("candidates", {
  id: serial("id").primaryKey(),
  election_id: integer("election_id")
    .notNull()
    .references(() => elections.id),
  name: text("name").notNull(),
  photo_url: text("photo_url"),
  description: text("description"),
  public_key: text("public_key"), // Candidate's verification public key
});

// Blockchain components
export const blocks = pgTable(
  "blocks",
  {
    id: serial("id").primaryKey(),
    election_id: integer("election_id")
      .notNull()
      .references(() => elections.id),
    block_number: integer("block_number").notNull(),
    previous_hash: text("previous_hash").notNull(),
    block_hash: text("block_hash").notNull().unique(),
    timestamp: timestamp("timestamp").defaultNow(),
    merkle_root: text("merkle_root").notNull(),
    authority_signature: text("authority_signature").notNull(), // Proof of Authority signature
    transactions_count: integer("transactions_count").notNull(),
  },
  (table) => {
    return {
      blockIdx: uniqueIndex("block_election_number_idx").on(
        table.election_id,
        table.block_number
      ),
    };
  }
);

// Authority nodes for Proof of Authority
export const authority_nodes = pgTable("authority_nodes", {
  id: serial("id").primaryKey(),
  node_id: text("node_id").notNull().unique(),
  public_key: text("public_key").notNull().unique(), // Authority's signing key
  name: text("name"),
  is_active: boolean("is_active").default(true),
  weight: integer("weight").default(1), // For weighted consensus if needed
});

// Voters with enhanced crypto capabilities
export const voters = pgTable("voters", {
  id: serial("id").primaryKey(),
  election_id: integer("election_id")
    .notNull()
    .references(() => elections.id),
  code: text("code").notNull().unique(), // Voting access code
  registration_time: timestamp("registration_time").defaultNow(),
  public_key: text("public_key"), // Voter's Schnorr public key
  wallet_address: text("wallet_address"), // Ethereum/blockchain wallet address
  wallet_chain_id: integer("wallet_chain_id"), // Chain ID for multi-chain support
  wallet_signature: text("wallet_signature"), // Signature provided during registration
  commitment: text("commitment"), // Cryptographic commitment for privacy
  nullifier_hash: text("nullifier_hash"), // Prevents double-voting
  has_voted: boolean("has_voted").default(false),
});

// Vote transactions
export const vote_transactions = pgTable("vote_transactions", {
  id: serial("id").primaryKey(),
  block_id: integer("block_id").references(() => blocks.id),
  transaction_hash: text("transaction_hash").notNull().unique(),
  encrypted_vote: text("encrypted_vote").notNull(), // Encrypted candidate choice
  schnorr_signature: text("schnorr_signature").notNull(), // Voter's signature
  bulletproof: text("bulletproof").notNull(), // Zero-knowledge proof of valid vote
  timestamp: timestamp("timestamp").defaultNow(),
  nullifier_hash: text("nullifier_hash").notNull().unique(), // Links to voter anonymously
  verification_data: jsonb("verification_data"), // Verification metadata
});

// Audit log with zero-knowledge components
export const audit_logs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  election_id: integer("election_id").references(() => elections.id),
  event_type: text("event_type").notNull(),
  event_hash: text("event_hash").notNull(), // Hash of the event for verification
  timestamp: timestamp("timestamp").defaultNow(),
  metadata: jsonb("metadata"), // Additional audit data
  zero_knowledge_proof: text("zero_knowledge_proof"), // Proof that audit is valid without revealing private data
});

// Election results with cryptographic proofs
export const election_results = pgTable("election_results", {
  id: serial("id").primaryKey(),
  election_id: integer("election_id").references(() => elections.id),
  candidate_id: integer("candidate_id").references(() => candidates.id),
  vote_count: integer("vote_count").notNull().default(0),
  tally_proof: text("tally_proof"), // ZK proof that tally was computed correctly
  finalized_at: timestamp("finalized_at"),
});
