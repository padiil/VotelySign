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
}

export interface Voter {
  id: string
  election_id: string
  code: string
  voted: boolean
  public_key?: string
  created_at: string
}

export interface Vote {
  id: string
  voter_id: string
  candidate_id: string
  signature?: string
  timestamp: string
  block_hash?: string
}

export interface ElectionWithCandidates extends Election {
  candidates: Candidate[]
}

export interface ElectionResult {
  candidate: Candidate
  voteCount: number
}
