"use server"

import { createServerDbClient } from "@/lib/db";
import { voters, vote_transactions, elections } from "@/lib/schema";
import type { Voter, Vote } from "@/types";
import { revalidatePath } from "next/cache";
import crypto from "crypto";
import { eq, and } from "drizzle-orm";

// Helper: Format voter object
function formatVoter(voter: any): Voter {
  return {
    ...voter,
    id: String(voter.id),
    election_id: String(voter.election_id),
    code: voter.code,
    has_voted: !!voter.has_voted,
    created_at: voter.created_at ? voter.created_at.toISOString() : "",
  };
}

// Verify voter code
export async function verifyVoterCode(
  electionCode: string,
  voterCode: string,
): Promise<{ success: boolean; data?: Voter; error?: string }> {
  try {
    const db = createServerDbClient();
    // Get the election by code
    const [election] = await db.select().from(elections).where(eq(elections.code, electionCode)).limit(1);
    if (!election) {
      return { success: false, error: "Election not found" };
    }
    // Verify the voter code
    const [voter] = await db.select().from(voters)
      .where(and(eq(voters.election_id, election.id), eq(voters.code, voterCode)));
    if (!voter) {
      return { success: false, error: "Invalid voter code" };
    }
    if (voter.has_voted) {
      return { success: false, error: "This voter code has already been used" };
    }
    return { success: true, data: formatVoter(voter) };
  } catch (error) {
    console.error("Verify voter code error:", error);
    return { success: false, error: "Failed to verify voter code" };
  }
}

// Cast a vote
export async function castVote(
  voterId: string,
  candidateId: string,
  signature: string,
): Promise<{ success: boolean; data?: Vote; error?: string }> {
  try {
    const db = createServerDbClient();
    // Check if the voter has already voted
    const [voter] = await db.select().from(voters).where(eq(voters.id, Number(voterId)));
    if (!voter) {
      return { success: false, error: "Voter not found" };
    }
    if (voter.has_voted) {
      return { success: false, error: "This voter has already cast a vote" };
    }

    // Ensure nullifier_hash is present, generate if missing
    let nullifierHash = voter.nullifier_hash;
    if (!nullifierHash) {
      // Deterministically generate a nullifier hash using voter id and code
      nullifierHash = crypto.createHash("sha256")
        .update(`${voter.id}-${voter.code}-nullifier`)
        .digest("hex");
      // Update the voter record with the generated nullifier_hash
      await db.update(voters)
        .set({ nullifier_hash: nullifierHash })
        .where(eq(voters.id, Number(voterId)));
    }

    // Generate a simple block hash
    const blockHash = crypto.createHash("sha256").update(`${voterId}-${candidateId}-${Date.now()}`).digest("hex");
    // Insert the vote (tanpa voter_id)
    const [inserted] = await db.insert(vote_transactions).values({
      candidate_id: Number(candidateId), // If your schema uses 'candidate_id'
      transaction_hash: blockHash,
      encrypted_vote: "encrypted", // Placeholder, implement encryption as needed
      schnorr_signature: signature,
      bulletproof: "proof", // Placeholder, implement ZK proof as needed
      nullifier_hash: nullifierHash,
      verification_data: { timestamp: Date.now() },
    }).returning();
    // Update the voter's status
    await db.update(voters).set({ has_voted: true }).where(eq(voters.id, Number(voterId)));
    revalidatePath("/vote");
    // Add voter_id to match Vote type and convert id, voter_id, and candidate_id to string
    const voteWithVoterId = {
      ...inserted,
      voter_id: String(voterId),
      id: String(inserted.id), // ensure id is string
      candidate_id: String(inserted.candidate_id), // ensure candidate_id is string
      timestamp: inserted.timestamp ? inserted.timestamp.toISOString() : "", // ensure timestamp is string
    };
    return { success: true, data: voteWithVoterId as Vote };
  } catch (error) {
    console.error("Cast vote error:", error);
    return { success: false, error: "Failed to cast vote" };
  }
}

// Get voter status
export async function getVoterStatus(voterId: string): Promise<{ success: boolean; data?: Voter; error?: string }> {
  try {
    const db = createServerDbClient();
    const [voter] = await db.select().from(voters).where(eq(voters.id, Number(voterId)));
    if (!voter) {
      return { success: false, error: "Voter not found" };
    }
    return { success: true, data: formatVoter(voter) };
  } catch (error) {
    console.error("Get voter status error:", error);
    return { success: false, error: "Failed to get voter status" };
  }
}
