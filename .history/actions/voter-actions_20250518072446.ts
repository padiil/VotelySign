"use server"

import { createServerDbClient } from "@/lib/db"
import { elections, voters, vote_transactions } from "@/lib/schema"
import { eq, and } from "drizzle-orm"
import type { Voter, Vote, WalletAuthParams } from "@/types"
import { revalidatePath } from "next/cache"
import crypto from "crypto"
import { verifyWalletSignature } from "@/lib/wallet-auth"

// Verify voter code
export async function verifyVoterCode(
  electionCode: string,
  voterCode: string,
): Promise<{ success: boolean; data?: Voter; error?: string }> {
  try {
    const db = createServerDbClient()

    // First, get the election by code
    const electionResults = await db
      .select()
      .from(elections)
      .where(eq(elections.code, electionCode))
      .limit(1)

    if (electionResults.length === 0) {
      return { success: false, error: "Election not found" }
    }
    
    const election = electionResults[0]

    // Then, verify the voter code
    const voterResults = await db
      .select()
      .from(voters)
      .where(
        and(
          eq(voters.election_id, election.id), // Remove parseInt since election.id is already a number
          eq(voters.code, voterCode)
        )
      )
      .limit(1);

    if (voterResults.length === 0) {
      return { success: false, error: "Invalid voter code" }
    }

    const voter = voterResults[0]

    // Check if the voter has already voted
    if (voter.has_voted) {
      return { success: false, error: "This voter code has already been used" }
    }

    return { success: true, data: voter as unknown as Voter }
  } catch (error) {
    console.error("Verify voter code error:", error)
    return { success: false, error: "Failed to verify voter code" }
  }
}

// Cast a vote
export async function castVote(
  voterId: string,
  candidateId: string,
  signature: string,
): Promise<{ success: boolean; data?: Vote; error?: string }> {
  try {
    const db = createServerDbClient()

    // Check if the voter has already voted
    const voterResults = await db
      .select({ has_voted: voters.has_voted })
      .from(voters)
      .where(eq(voters.id, parseInt(voterId)))
      .limit(1)

    if (voterResults.length === 0) {
      return { success: false, error: "Voter not found" }
    }

    if (voterResults[0].has_voted) {
      return { success: false, error: "This voter has already cast a vote" }
    }

    // Generate transaction hash
    const transactionHash = crypto
      .createHash("sha256")
      .update(`${voterId}-${candidateId}-${Date.now()}`)
      .digest("hex")

    // Insert the vote transaction
    // Note: You'll need to adapt this to match your actual vote_transactions schema
    const transaction = await db
      .insert(vote_transactions)
      .values({
        transaction_hash: transactionHash,
        encrypted_vote: candidateId, // You'd encrypt this in production
        schnorr_signature: signature,
        bulletproof: "proof", // You'd generate real ZKP in production
        nullifier_hash: `nh_${voterId}`, // You'd generate real nullifier in production
        // Add other required fields based on your schema
      })
      .returning()

    // Update the voter's status
    await db
      .update(voters)
      .set({ has_voted: true })
      .where(eq(voters.id, parseInt(voterId)))

    revalidatePath("/vote")
    return { success: true, data: { id: transaction[0].id.toString() } as Vote }
  } catch (error) {
    console.error("Cast vote error:", error)
    return { success: false, error: "Failed to cast vote" }
  }
}

// Get voter status
export async function getVoterStatus(voterId: string): Promise<{ success: boolean; data?: Voter; error?: string }> {
  try {
    const db = createServerDbClient()

    const voterResults = await db
      .select()
      .from(voters)
      .where(eq(voters.id, parseInt(voterId)))
      .limit(1)

    if (voterResults.length === 0) {
      return { success: false, error: "Voter not found" }
    }

    return { success: true, data: voterResults[0] as unknown as Voter }
  } catch (error) {
    console.error("Get voter status error:", error)
    return { success: false, error: "Failed to get voter status" }
  }
}

// Authenticate voter with wallet
export async function authenticateWithWallet({
  electionId,
  voterCode,
  walletAddress,
  signature,
  message
}: WalletAuthParams): Promise<{ success: boolean; data?: Voter; error?: string }> {
  try {
    const db = createServerDbClient()
    
    // First, verify the signature
    if (!verifyWalletSignature(message, signature, walletAddress)) {
      return { success: false, error: "Invalid wallet signature" };
    }
    
    // Find the voter by code
    const voterResults = await db
      .select()
      .from(voters)
      .where(
        and(
          eq(voters.election_id, parseInt(electionId)),
          eq(voters.code, voterCode)
        )
      )
      .limit(1)
    
    if (voterResults.length === 0) {
      return { success: false, error: "Voter code not found" };
    }
    
    const voter = voterResults[0];
    
    // Check if voter has already voted
    if (voter.has_voted) {
      return { success: false, error: "This voter has already cast a vote" };
    }
    
    // Update voter with wallet information
    await db
      .update(voters)
      .set({
        wallet_address: walletAddress,
        wallet_signature: signature,
      })
      .where(eq(voters.id, voter.id));
    
    revalidatePath("/vote");
    return { success: true, data: voter as unknown as Voter };
  } catch (error) {
    console.error("Wallet authentication error:", error);
    return { success: false, error: "Failed to authenticate with wallet" };
  }
}