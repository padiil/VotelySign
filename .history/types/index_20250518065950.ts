export interface Election {
  id: string
  title: string
  description: string
  start_time: string
  end_time: string
  code: string
  banner_url?: string
  created_at: string
}

export interface Candidate {
  id: string
  election_id: string
  name: string
  photo_url?: string
  description: string
  created_at: string
  public_key?: string
}

export interface Voter {
  id: string
  election_id: string
  code: string
  has_voted: boolean  // Renamed from "voted" to match schema
  registration_time: string
  public_key?: string
  wallet_address?: string
  wallet_chain_id?: number
  wallet_signature?: string
  commitment?: string
  nullifier_hash?: string
  created_at?: string // Keeping for backward compatibility
}

export interface Vote {
  id: string
  voter_id: string
  candidate_id: string
  signature?: string
  timestamp: string
  block_hash?: string
  transaction_hash?: string
  encrypted_vote?: string
  bulletproof?: string
}

export interface ElectionWithCandidates extends Election {
  candidates: Candidate[]
}

export interface ElectionResult {
  candidate: Candidate
  voteCount: number
  tally_proof?: string
}

export interface WalletAuthParams {
  electionId: string
  voterCode: string
  walletAddress: string
  signature: string
  message: string
}