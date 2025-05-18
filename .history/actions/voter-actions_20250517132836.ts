"use server";

import { createServerDbClient } from "@/lib/db";
import { elections, voters, vote_transactions } from "@/lib/schema";
import { createVoteTransaction } from "@/lib/blockchain";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { Voter, Vote } from "@/types";
import crypto from "crypto";

export interface Voter {
  id: number;
  election_id: number;
  code: string;
  registration_time?: Date;
  public_key?: string;
  commitment?: string;
  nullifier_hash?: string;
  has_voted: boolean;
}

export interface Vote {
  id: number;
  block_id?: number;
  transaction_hash: string;
  encrypted_vote: string;
  schnorr_signature: string;
  bulletproof: string;
  timestamp?: Date;
  nullifier_hash: string;
  verification_data?: any;
}

export interface Election {
  id: number;
  title: string;
  description?: string;
  code: string;
  created_at?: Date;
  start_time?: Date;
  end_time?: Date;
  blockchain_address?: string;
  genesis_block_hash?: string;
  is_finalized: boolean;
}

export interface Candidate {
  id: number;
  election_id: number;
  name: string;
  photo_url?: string;
  description?: string;
  public_key?: string;
}

// Verify voter code

export async function verifyVoterCode(
  electionCode: string,
  voterCode: string
): Promise<{ success: boolean; data?: Voter; error?: string }> {
  try {
    const db = createServerDbClient();
    // @ts-ignore: Suppress type error for db.query.voters if types are not generated

    // First, get the election by code
    const election = await db
      .select()
      .from(elections)
      .where(eq(elections.code, electionCode))
      .then(rows => rows[0]);

    if (!election) {
      return { success: false, error: "Election not found" };
    }

    // @ts-ignore
    const voter = await db.query.voters.findFirst({
      where: and(
        eq(voters.election_id, election.id),
        eq(voters.code, voterCode)
      ),
    });
    });

    if (!voter) {
      return { success: false, error: "Invalid voter code" };
    }

    // Check if the voter has already voted
    if (voter.has_voted) {
      return { success: false, error: "This voter code has already been used" };
    }

    return {
      success: true,
      data: {
        id: voter.id,
        election_id: voter.election_id,
        code: voter.code,
        has_voted: voter.has_voted,
        public_key: voter.public_key || undefined,
        commitment: voter.commitment || undefined,
        nullifier_hash: voter.nullifier_hash || undefined,
        registration_time: voter.registration_time,
      },
    };
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

    if (!voteTransaction) {
      return {
        success: false,
        error: "Vote transaction was not recorded properly",
      };
    }

    revalidatePath("/vote");
    return {
      success: true,
      data: {
        id: voteTransaction.id,
        transaction_hash: voteTransaction.transaction_hash,
        encrypted_vote: voteTransaction.encrypted_vote,
        schnorr_signature: voteTransaction.schnorr_signature,
        bulletproof: voteTransaction.bulletproof,
        nullifier_hash: voteTransaction.nullifier_hash,
        block_id: voteTransaction.block_id || undefined,
        timestamp: voteTransaction.timestamp || undefined,
        verification_data: voteTransaction.verification_data || undefined,
      },
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
