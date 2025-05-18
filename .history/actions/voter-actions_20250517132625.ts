"use server";

import { createServerDbClient } from "@/lib/db";
import { elections, voters, vote_transactions } from "@/lib/schema";
import { createVoteTransaction } from "@/lib/blockchain";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { Voter, Vote } from "@/types";
import crypto from "crypto";

"use server";

import { createServerDbClient } from "@/lib/db";
import { elections, voters, vote_transactions } from "@/lib/schema";
import { createVoteTransaction } from "@/lib/blockchain";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { Voter, Vote } from "@/types";
import crypto from "crypto";

// Verify voter code
export async function verifyVoterCode(
  electionCode: string,
  voterCode: string
): Promise<{ success: boolean; data?: Voter; error?: string }> {
  try {
    const db = createServerDbClient();

    // First, get the election by code
    const election = await db.query.elections.findFirst({
      where: eq(elections.code, electionCode),
    });

    if (!election) {
      return { success: false, error: "Election not found" };
    }

    // Then, verify the voter code
    const voter = await db.query.voters.findFirst({
      where: and(
        eq(voters.election_id, election.id),
        eq(voters.code, voterCode)
      ),
    });

    if (!voter) {
      return { success: false, error: "Invalid voter code" };
    }

    // Check if the voter has already voted
    if (voter.has_voted) {
      return { success: false, error: "This voter code has already been used" };
    }

    return { success: true, data: voter as Voter };
  } catch (error) {
    console.error("Verify voter code error:", error);
    return { success: false, error: "Failed to verify voter code" };
  }
}

// Cast a vote
export async function castVote(
  voterId: number,
  candidateId: number,
  voterPrivateKey: string
): Promise<{ success: boolean; data?: Vote; error?: string }> {
  try {
    const db = createServerDbClient();

    // Check if the voter has already voted
    const voter = await db.query.voters.findFirst({
      where: eq(voters.id, voterId),
      columns: { has_voted: true },
    });

    if (!voter) {
      return { success: false, error: "Voter not found" };
    }

    if (voter.has_voted) {
      return { success: false, error: "This voter has already cast a vote" };
    }

    // Use blockchain helper to create a vote transaction with Schnorr signature and bulletproof
    const transactionHash = await createVoteTransaction(
      voterId,
      candidateId,
      voterPrivateKey
    );

    // Update the voter's status
    await db
      .update(voters)
      .set({ has_voted: true })
      .where(eq(voters.id, voterId));

    // Find the transaction we just created
    const voteTransaction = await db.query.vote_transactions.findFirst({
      where: eq(vote_transactions.transaction_hash, transactionHash),
    });

    revalidatePath("/vote");
    return {
      success: true,
      data: voteTransaction as unknown as Vote,
    };
  } catch (error) {
    console.error("Cast vote error:", error);
    return { success: false, error: "Failed to cast vote" };
  }
}

// Get voter status
export async function getVoterStatus(
  voterId: number
): Promise<{ success: boolean; data?: Voter; error?: string }> {
  try {
    const db = createServerDbClient();

    const voter = await db.query.voters.findFirst({
      where: eq(voters.id, voterId),
    });

    if (!voter) {
      return { success: false, error: "Voter not found" };
    }

    return { success: true, data: voter as Voter };
  } catch (error) {
    console.error("Get voter status error:", error);
    return { success: false, error: "Failed to get voter status" };
  }
}

// Verify voter code

export async function verifyVoterCode(
  electionCode: string,
  voterCode: string
): Promise<{ success: boolean; data?: Voter; error?: string }> {
  try {
    const db = createServerDbClient();

    // First, get the election by code
    const election = await db.query.elections.findFirst({
      where: eq(elections.code, electionCode),
    });

    if (!election) {
      return { success: false, error: "Election not found" };
    }

    // Then, verify the voter code
    const voter = await db.query.voters.findFirst({
      where: and(
        eq(voters.election_id, election.id),
        eq(voters.code, voterCode)
      ),
    });

    if (!voter) {
      return { success: false, error: "Invalid voter code" };
    }

    // Check if the voter has already voted
    if (voter.has_voted) {
      return { success: false, error: "This voter code has already been used" };
    }

    return { success: true, data: voter as Voter };
  } catch (error) {
    console.error("Verify voter code error:", error);
    return { success: false, error: "Failed to verify voter code" };
  }
}

// Cast a vote
export async function castVote(
  voterId: number,
  candidateId: number,
  voterPrivateKey: string
): Promise<{ success: boolean; data?: Vote; error?: string }> {
  try {
    const db = createServerDbClient();

    // Check if the voter has already voted
    const voter = await db.query.voters.findFirst({
      where: eq(voters.id, voterId),
      columns: { has_voted: true },
    });

    if (!voter) {
      return { success: false, error: "Voter not found" };
    }

    if (voter.has_voted) {
      return { success: false, error: "This voter has already cast a vote" };
    }

    // Use blockchain helper to create a vote transaction with Schnorr signature and bulletproof
    const transactionHash = await createVoteTransaction(
      voterId,
      candidateId,
      voterPrivateKey
    );

    // Update the voter's status
    await db
      .update(voters)
      .set({ has_voted: true })
      .where(eq(voters.id, voterId));

    // Find the transaction we just created
    const voteTransaction = await db.query.vote_transactions.findFirst({
      where: eq(vote_transactions.transaction_hash, transactionHash),
    });

    revalidatePath("/vote");
    return {
      success: true,
      data: voteTransaction as unknown as Vote,
    };
  } catch (error) {
    console.error("Cast vote error:", error);
    return { success: false, error: "Failed to cast vote" };
  }
}

// Get voter status
export async function getVoterStatus(
  voterId: number
): Promise<{ success: boolean; data?: Voter; error?: string }> {
  try {
    const db = createServerDbClient();

    const voter = await db.query.voters.findFirst({
      where: eq(voters.id, voterId),
    });

    if (!voter) {
      return { success: false, error: "Voter not found" };
    }

    return { success: true, data: voter as Voter };
  } catch (error) {
    console.error("Get voter status error:", error);
    return { success: false, error: "Failed to get voter status" };
  }
}
