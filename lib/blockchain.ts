import { createServerDbClient } from "./db";
import { blocks, vote_transactions, authority_nodes } from "./schema";
import * as crypto from "crypto";
import { schnorrSign, generateBulletproof } from "./crypto";

/**
 * Creates a genesis block for a new election
 */
export async function createGenesisBlock(electionId: number): Promise<string> {
  const db = createServerDbClient();

  // Create genesis block with initial parameters
  const genesisBlock = {
    election_id: electionId,
    block_number: 0,
    previous_hash:
      "0000000000000000000000000000000000000000000000000000000000000000",
    merkle_root: generateMerkleRoot([]), // Empty merkle root for genesis
    authority_signature: await signBlockByAuthority(
      0,
      "0000000000000000000000000000000000000000000000000000000000000000"
    ),
    transactions_count: 0,
  };

  // Generate block hash
  const blockHash = generateBlockHash(genesisBlock);

  // Insert to database
  await db.insert(blocks).values({
    ...genesisBlock,
    block_hash: blockHash,
  });

  return blockHash;
}

/**
 * Creates a new vote transaction with Schnorr signature and Bulletproof
 */
export async function createVoteTransaction(
  voterId: number,
  candidateId: number,
  voterPrivateKey: string
): Promise<string> {
  const voteData = {
    voter: voterId,
    candidate: candidateId,
    timestamp: Date.now(),
  };
  const encryptedVote = encryptVote(voteData);

  // Generate Schnorr signature (nyata)
  const messageHash = crypto
    .createHash("sha256")
    .update(JSON.stringify(voteData))
    .digest("hex");
  const signature = await schnorrSign(messageHash, voterPrivateKey);

  // Generate bulletproof (nyata/template)
  const bulletproof = await generateBulletproof(candidateId);

  // Generate nullifier to prevent double voting
  const nullifierHash = generateNullifierHash(voterId, voterPrivateKey);

  // Create transaction
  const db = createServerDbClient();
  const txHash = crypto
    .createHash("sha256")
    .update(`${voterId}-${candidateId}-${Date.now()}-${Math.random()}`)
    .digest("hex");

  await db.insert(vote_transactions).values({
    transaction_hash: txHash,
    encrypted_vote: encryptedVote,
    schnorr_signature: signature,
    bulletproof: bulletproof,
    nullifier_hash: nullifierHash,
    candidate_id: candidateId,
    verification_data: { timestamp: Date.now() },
  });

  return txHash;
}

// Helper functions for blockchain operations
function generateBlockHash(block: any): string {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(block))
    .digest("hex");
}

function generateMerkleRoot(transactions: string[]): string {
  if (transactions.length === 0) {
    return crypto.createHash("sha256").update("empty").digest("hex");
  }

  // A real implementation would build a proper Merkle tree
  return crypto
    .createHash("sha256")
    .update(transactions.join(""))
    .digest("hex");
}

async function signBlockByAuthority(
  blockNumber: number,
  blockData: string
): Promise<string> {
  // In a real implementation, this would use the authority's private key
  return `authority-signature-${blockNumber}-${Date.now()}`;
}

function encryptVote(voteData: any): string {
  // In a real implementation, this would use proper encryption
  return Buffer.from(JSON.stringify(voteData)).toString("base64");
}

function generateNullifierHash(voterId: number, privateKey: string): string {
  return crypto
    .createHash("sha256")
    .update(`${voterId}-${privateKey.substring(0, 10)}-nullifier`)
    .digest("hex");
}
