"use server"

import { createServerSupabaseClient } from "@/lib/supabase"
import type { Voter, Vote } from "@/types"
import { revalidatePath } from "next/cache"
import crypto from "crypto"

// Verify voter code
export async function verifyVoterCode(
  electionCode: string,
  voterCode: string,
): Promise<{ success: boolean; data?: Voter; error?: string }> {
  try {
    const supabase = createServerSupabaseClient()

    // First, get the election by code
    const { data: election, error: electionError } = await supabase
      .from("elections")
      .select("id")
      .eq("code", electionCode)
      .single()

    if (electionError) {
      return { success: false, error: "Election not found" }
    }

    // Then, verify the voter code
    const { data: voter, error: voterError } = await supabase
      .from("voters")
      .select("*")
      .eq("election_id", election.id)
      .eq("code", voterCode)
      .single()

    if (voterError) {
      return { success: false, error: "Invalid voter code" }
    }

    // Check if the voter has already voted
    if (voter.voted) {
      return { success: false, error: "This voter code has already been used" }
    }

    return { success: true, data: voter }
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
    const supabase = createServerSupabaseClient()

    // Check if the voter has already voted
    const { data: voter, error: voterError } = await supabase.from("voters").select("voted").eq("id", voterId).single()

    if (voterError) {
      return { success: false, error: "Voter not found" }
    }

    if (voter.voted) {
      return { success: false, error: "This voter has already cast a vote" }
    }

    // Generate a simple block hash (in a real app, this would be more sophisticated)
    const blockHash = crypto.createHash("sha256").update(`${voterId}-${candidateId}-${Date.now()}`).digest("hex")

    // Insert the vote
    const { data, error } = await supabase
      .from("votes")
      .insert({
        voter_id: voterId,
        candidate_id: candidateId,
        signature,
        block_hash: blockHash,
      })
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    // Update the voter's status
    await supabase.from("voters").update({ voted: true }).eq("id", voterId)

    revalidatePath("/vote")
    return { success: true, data }
  } catch (error) {
    console.error("Cast vote error:", error)
    return { success: false, error: "Failed to cast vote" }
  }
}

// Get voter status
export async function getVoterStatus(voterId: string): Promise<{ success: boolean; data?: Voter; error?: string }> {
  try {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase.from("voters").select("*").eq("id", voterId).single()

    if (error) {
      return { success: false, error: "Voter not found" }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Get voter status error:", error)
    return { success: false, error: "Failed to get voter status" }
  }
}
