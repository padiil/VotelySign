"use server"

import { createServerDbClient } from "@/lib/db";
import { voters, vote_transactions, elections } from "@/lib/schema";
import type { Voter, Vote } from "@/types";
import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import { createVoteTransaction } from "@/lib/blockchain";
import crypto from "crypto";

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
    // Hash input voterCode sebelum query
    const voterCodeHash = crypto.createHash("sha256").update(voterCode).digest("hex");
    // Verify the voter code (pakai hash)
    const [voter] = await db.select().from(voters)
      .where(and(eq(voters.election_id, election.id), eq(voters.code, voterCodeHash)));
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
  voterPrivateKey: string,
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

    // Buat transaksi vote dengan signature & bulletproofs
    const transactionHash = await createVoteTransaction(
      Number(voterId),
      Number(candidateId),
      voterPrivateKey
    );

    // Update status voter
    await db.update(voters).set({ has_voted: true }).where(eq(voters.id, Number(voterId)));

    // Ambil data transaksi yang baru saja dibuat
    const [voteTransaction] = await db.select().from(vote_transactions).where(eq(vote_transactions.transaction_hash, transactionHash));
    if (!voteTransaction) {
      return { success: false, error: "Vote transaction was not recorded properly" };
    }
    // Format agar sesuai tipe Vote
    const voteWithVoterId = {
      ...voteTransaction,
      voter_id: String(voterId),
      id: String(voteTransaction.id),
      candidate_id: String(voteTransaction.candidate_id),
      timestamp: voteTransaction.timestamp ? voteTransaction.timestamp.toISOString() : "",
    };
    revalidatePath("/vote");
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
