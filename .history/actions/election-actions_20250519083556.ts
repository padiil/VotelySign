"use server"

import { createServerDbClient } from "@/lib/db"
import { elections, candidates, voters, vote_transactions } from "@/lib/schema"
import type { InferModel } from "drizzle-orm"
import { sql } from "drizzle-orm"

// Ensure the Candidate type includes created_at
type CandidateWithCreatedAt = InferModel<typeof candidates> & { created_at?: Date }
import type { Election, ElectionWithCandidates, Candidate } from "@/types"
import { revalidatePath } from "next/cache"
import crypto from "crypto"
import { eq } from "drizzle-orm"

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

// Helper: Format election object
function formatElection(election: any): Election {
  return {
    ...election,
    id: String(election.id),
    description: election.description ?? "",
    start_time: election.start_time ? election.start_time.toISOString() : "",
    end_time: election.end_time ? election.end_time.toISOString() : "",
    created_at: election.created_at ? election.created_at.toISOString() : "",
  }
}

// Helper: Format candidate object
function formatCandidate(candidate: any): Candidate {
  return {
    ...candidate,
    id: String(candidate.id),
    election_id: String(candidate.election_id),
    name: candidate.name,
    photo_url: candidate.photo_url || undefined,
    description: candidate.description ?? "",
    created_at: candidate.created_at ? candidate.created_at.toISOString() : "",
  }
}

// Create a new election
export async function createElection(formData: FormData) {
  try {
    const db = createServerDbClient()
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const start_time = formData.get("start_time") as string
    const end_time = formData.get("end_time") as string
    if (!title || !start_time || !end_time) {
      return { success: false, error: "Missing required fields" }
    }
    const code = generateRandomCode(8)
    const [data] = await db.insert(elections).values({
      title,
      description,
      start_time: new Date(start_time),
      end_time: new Date(end_time),
      code,
    }).returning()
    revalidatePath("/create")
    return { success: true, data: formatElection(data) }
  } catch (error) {
    console.error("Create election error:", error)
    return { success: false, error: "Failed to create election" }
  }
}

// Get election by code
export async function getElectionByCode(code: string) {
  try {
    const db = createServerDbClient()
    const electionArr = await db.select().from(elections).where(eq(elections.code, code)).limit(1)
    if (!electionArr.length) {
      return { success: false, error: "Election not found" }
    }
    const election = electionArr[0]
    const candidatesData = await db.select().from(candidates).where(eq(candidates.election_id, election.id))
    return {
      success: true,
      data: {
        ...formatElection(election),
        candidates: candidatesData.map(formatCandidate),
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
  candidateInputs: Omit<Candidate, "id" | "election_id" | "created_at">[],
) {
  try {
    const db = createServerDbClient()
    const candidatesToInsert = candidateInputs.map((c) => ({
      election_id: Number(electionId),
      name: c.name,
      photo_url: c.photo_url,
      description: c.description,
    }))
    const data = await db.insert(candidates).values(candidatesToInsert).returning()
    revalidatePath(`/election/${electionId}`)
    return { success: true, data: data.map(formatCandidate) }
  } catch (error) {
    console.error("Add candidates error:", error)
    return { success: false, error: "Failed to add candidates" }
  }
}

// Add voters to an election
export async function addVoters(electionId: string, voterCount: number) {
  try {
    const db = createServerDbClient()
    const voterCodes = Array.from({ length: voterCount }, () => ({
      election_id: Number(electionId),
      code: generateRandomCode(6),
    }))
    const data = await db.insert(voters).values(voterCodes).returning({ code: voters.code })
    return { success: true, data }
  } catch (error) {
    console.error("Add voters error:", error)
    return { success: false, error: "Failed to add voters" }
  }
}

// Get election results
export async function getElectionResults(electionId: string) {
  try {
    const db = createServerDbClient()
    const candidatesData = await db.select().from(candidates).where(eq(candidates.election_id, Number(electionId)))
    const results = await Promise.all(
      candidatesData.map(async (candidate) => {
        const [{ count }] = await db
          .select({ count: sql<number>`count(*)` })
          .from(vote_transactions)
          .where(eq(vote_transactions.candidate_id, candidate.id))
        return {
          candidate: formatCandidate(candidate),
          voteCount: Number(count) || 0,
        }
      })
    )
    return { success: true, data: results }
  } catch (error) {
    console.error("Get election results error:", error)
    return { success: false, error: "Failed to fetch election results" }
  }
}
