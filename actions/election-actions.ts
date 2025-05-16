"use server"

import { createServerSupabaseClient } from "@/lib/supabase"
import type { Election, ElectionWithCandidates, Candidate } from "@/types"
import { revalidatePath } from "next/cache"
import crypto from "crypto"

// Generate a random code
function generateRandomCode(length: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = ""
  const randomBytes = crypto.randomBytes(length)
  for (let i = 0; i < length; i++) {
    result += chars[randomBytes[i] % chars.length]
  }
  return result
}

// Create a new election
export async function createElection(
  formData: FormData,
): Promise<{ success: boolean; data?: Election; error?: string }> {
  try {
    const supabase = createServerSupabaseClient()

    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const start_time = formData.get("start_time") as string
    const end_time = formData.get("end_time") as string
    const banner = formData.get("banner") as File

    if (!title || !start_time || !end_time) {
      return { success: false, error: "Missing required fields" }
    }

    // Generate a unique election code
    const code = generateRandomCode(8)

    // Handle banner upload if provided
    let banner_url = null
    if (banner && banner.size > 0) {
      const fileExt = banner.name.split(".").pop()
      const fileName = `${crypto.randomUUID()}.${fileExt}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("election-banners")
        .upload(fileName, banner)

      if (uploadError) {
        console.error("Banner upload error:", uploadError)
      } else {
        const {
          data: { publicUrl },
        } = supabase.storage.from("election-banners").getPublicUrl(fileName)

        banner_url = publicUrl
      }
    }

    // Insert the election
    const { data, error } = await supabase
      .from("elections")
      .insert({
        title,
        description,
        start_time,
        end_time,
        code,
        banner_url,
      })
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/create")
    return { success: true, data }
  } catch (error) {
    console.error("Create election error:", error)
    return { success: false, error: "Failed to create election" }
  }
}

// Get election by code
export async function getElectionByCode(
  code: string,
): Promise<{ success: boolean; data?: ElectionWithCandidates; error?: string }> {
  try {
    const supabase = createServerSupabaseClient()

    // Get the election
    const { data: election, error: electionError } = await supabase
      .from("elections")
      .select("*")
      .eq("code", code)
      .single()

    if (electionError) {
      return { success: false, error: "Election not found" }
    }

    // Get the candidates
    const { data: candidates, error: candidatesError } = await supabase
      .from("candidates")
      .select("*")
      .eq("election_id", election.id)

    if (candidatesError) {
      return { success: false, error: "Failed to fetch candidates" }
    }

    return {
      success: true,
      data: {
        ...election,
        candidates: candidates || [],
      },
    }
  } catch (error) {
    console.error("Get election error:", error)
    return { success: false, error: "Failed to fetch election" }
  }
}

// Add candidates to an election
export async function addCandidates(
  electionId: string,
  candidates: Omit<Candidate, "id" | "election_id" | "created_at">[],
): Promise<{ success: boolean; data?: Candidate[]; error?: string }> {
  try {
    const supabase = createServerSupabaseClient()

    const candidatesToInsert = candidates.map((candidate) => ({
      election_id: electionId,
      name: candidate.name,
      photo_url: candidate.photo_url,
      description: candidate.description,
    }))

    const { data, error } = await supabase.from("candidates").insert(candidatesToInsert).select()

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath(`/election/${electionId}`)
    return { success: true, data }
  } catch (error) {
    console.error("Add candidates error:", error)
    return { success: false, error: "Failed to add candidates" }
  }
}

// Add voters to an election
export async function addVoters(
  electionId: string,
  voterCount: number,
): Promise<{ success: boolean; data?: { code: string }[]; error?: string }> {
  try {
    const supabase = createServerSupabaseClient()

    const voterCodes: { election_id: string; code: string }[] = []

    // Generate unique voter codes
    for (let i = 0; i < voterCount; i++) {
      voterCodes.push({
        election_id: electionId,
        code: generateRandomCode(6),
      })
    }

    const { data, error } = await supabase.from("voters").insert(voterCodes).select("code")

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Add voters error:", error)
    return { success: false, error: "Failed to add voters" }
  }
}

// Get election results
export async function getElectionResults(
  electionId: string,
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const supabase = createServerSupabaseClient()

    // Get the candidates
    const { data: candidates, error: candidatesError } = await supabase
      .from("candidates")
      .select("*")
      .eq("election_id", electionId)

    if (candidatesError) {
      return { success: false, error: "Failed to fetch candidates" }
    }

    // Get the votes for each candidate
    const results = await Promise.all(
      candidates.map(async (candidate) => {
        const { count, error } = await supabase
          .from("votes")
          .select("*", { count: "exact", head: true })
          .eq("candidate_id", candidate.id)

        return {
          candidate,
          voteCount: count || 0,
        }
      }),
    )

    return { success: true, data: results }
  } catch (error) {
    console.error("Get election results error:", error)
    return { success: false, error: "Failed to fetch election results" }
  }
}
