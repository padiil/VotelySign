"use server";

import { createServerDbClient } from "@/lib/db";
import { elections, candidates, voters, vote_transactions } from "@/lib/schema";
import type { InferModel } from "drizzle-orm";
import { sql } from "drizzle-orm";
import crypto from "crypto";
import { schnorr } from "@noble/curves/secp256k1";
import { randomBytes } from "crypto";

// Ensure the Candidate type includes created_at
type CandidateWithCreatedAt = InferModel<typeof candidates> & {
  created_at?: Date;
};
import type { Election, ElectionWithCandidates, Candidate } from "@/types";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

// Generate a random code
function generateRandomCode(length: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    result += chars[randomBytes[i] % chars.length];
  }
  return result;
}

// Helper: Format election object
function formatElection(election: any): Election {
  return {
    id: String(election.id),
    title: election.title,
    description: election.description || "",
    code: election.code,
    // Make sure these are correctly formatted as ISO strings
    start_time: election.start_time ? election.start_time.toISOString() : null,
    end_time: election.end_time ? election.end_time.toISOString() : null,
    created_at: election.created_at ? election.created_at.toISOString() : "",
    // Other fields...
  };
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
  };
}

// Create a new election
export async function createElection(formData: FormData) {
  try {
    const db = createServerDbClient();

    // Extract values from FormData
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const start_time = new Date(formData.get("start_time") as string);
    const end_time = new Date(formData.get("end_time") as string);
    const showRealTimeResults = formData.get("showRealTimeResults") === "true";
    const banner_url = (formData.get("banner_url") as string) || null;

    // Generate a random election code
    const electionCode = generateRandomCode(8);

    // Insert the election into the database
    const [election] = await db
      .insert(elections)
      .values({
        title,
        description,
        start_time,
        end_time,
        code: electionCode,
        // show_real_time_results: showRealTimeResults, // Removed because not in schema
      })
      .returning();

    return {
      success: true,
      data: formatElection(election),
    };
  } catch (error) {
    console.error("Error creating election:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}
// Get election by code
export async function getElectionByCode(code: string) {
  try {
    const db = createServerDbClient();

    // Get the election
    const [election] = await db
      .select()
      .from(elections)
      .where(eq(elections.code, code));

    if (!election) {
      return { success: false, error: "Election not found" };
    }

    // Get the candidates
    const candidatesData = await db
      .select()
      .from(candidates)
      .where(eq(candidates.election_id, election.id));

    // Count the total voters for this election
    const [voterResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(voters)
      .where(eq(voters.election_id, election.id));

    // Format the election with candidates and voter count
    const formattedElection = {
      ...formatElection(election),
      candidates: candidatesData.map(formatCandidate),
      voters_count: Number(voterResult.count),
    };

    return { success: true, data: formattedElection };
  } catch (error) {
    console.error("Get election by code error:", error);
    return { success: false, error: "Failed to fetch election" };
  }
}

// Add candidates to an election
export async function addCandidates(
  electionId: string,
  candidateInputs: Omit<Candidate, "id" | "election_id" | "created_at">[]
) {
  try {
    const db = createServerDbClient();
    const candidatesToInsert = candidateInputs.map((c) => ({
      election_id: Number(electionId),
      name: c.name,
      photo_url: c.photo_url,
      description: c.description,
    }));
    const data = await db
      .insert(candidates)
      .values(candidatesToInsert)
      .returning();
    revalidatePath(`/election/${electionId}`);
    return { success: true, data: data.map(formatCandidate) };
  } catch (error) {
    console.error("Add candidates error:", error);
    return { success: false, error: "Failed to add candidates" };
  }
}

// Add voters to an election
export async function addVoters(electionId: string, voterCount: number) {
  try {
    const db = createServerDbClient();
    // Generate random codes, private keys, and public keys
    const voterCodes = Array.from({ length: voterCount }, () => {
      const code = generateRandomCode(6);
      const codeHash = crypto.createHash("sha256").update(code).digest("hex");
      // Generate private key (32 bytes hex)
      const privateKey = randomBytes(32).toString("hex");
      // Generate public key (hex)
      const publicKeyBytes = schnorr.getPublicKey(privateKey);
      const publicKey = Buffer.from(publicKeyBytes).toString("hex");
      return {
        election_id: Number(electionId),
        code: codeHash,
        public_key: publicKey,
        _plain: code,
        _privateKey: privateKey,
      };
    });
    // Insert hashed code & public key
    await db
      .insert(voters)
      .values(
        voterCodes.map(({ election_id, code, public_key }) => ({
          election_id,
          code,
          public_key,
        }))
      );
    // Return plain codes & private keys for admin/frontend
    return {
      success: true,
      data: voterCodes.map(({ _plain, _privateKey }) => ({
        code: _plain,
        privateKey: _privateKey,
      })),
    };
  } catch (error) {
    console.error("Add voters error:", error);
    return { success: false, error: "Failed to add voters" };
  }
}

// Get election results
export async function getElectionResults(electionId: string) {
  try {
    const db = createServerDbClient();
    const candidatesData = await db
      .select()
      .from(candidates)
      .where(eq(candidates.election_id, Number(electionId)));
    const results = await Promise.all(
      candidatesData.map(async (candidate) => {
        const [{ count }] = await db
          .select({ count: sql<number>`count(*)` })
          .from(vote_transactions)
          .where(eq(vote_transactions.candidate_id, candidate.id));
        return {
          candidate: formatCandidate(candidate),
          voteCount: Number(count) || 0,
        };
      })
    );
    return { success: true, data: results };
  } catch (error) {
    console.error("Get election results error:", error);
    return { success: false, error: "Failed to fetch election results" };
  }
}
