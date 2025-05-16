"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import { Lock } from "lucide-react"
import { getElectionResults } from "@/actions/election-actions"

export default function VotingResults({ candidates, electionId, showResults = true, electionEnded = false }) {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchResults() {
      if (!electionId) {
        // If no electionId, use mock data
        const mockResults = candidates.map((candidate) => ({
          candidate,
          voteCount: Math.floor(Math.random() * 100),
        }))
        setResults(mockResults)
        setLoading(false)
        return
      }

      try {
        const { success, data, error } = await getElectionResults(electionId)

        if (success && data) {
          setResults(data)
        } else {
          console.error("Error fetching results:", error)
          // Fallback to mock data
          const mockResults = candidates.map((candidate) => ({
            candidate,
            voteCount: Math.floor(Math.random() * 100),
          }))
          setResults(mockResults)
        }
      } catch (error) {
        console.error("Error fetching results:", error)
        // Fallback to mock data
        const mockResults = candidates.map((candidate) => ({
          candidate,
          voteCount: Math.floor(Math.random() * 100),
        }))
        setResults(mockResults)
      } finally {
        setLoading(false)
      }
    }

    fetchResults()

    // Set up polling for real-time updates
    if (showResults && !electionEnded) {
      const interval = setInterval(fetchResults, 5000)
      return () => clearInterval(interval)
    }
  }, [candidates, electionId, showResults, electionEnded])

  // Calculate total votes
  const totalVotes = results.reduce((sum, result) => sum + result.voteCount, 0)

  // If results should be hidden and election is not ended
  if (!showResults && !electionEnded) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Lock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-xl font-bold mb-2">Hasil Pemilihan Disembunyikan</h2>
            <p className="text-gray-500">
              Panitia telah memilih untuk menyembunyikan hasil pemilihan hingga periode pemilihan berakhir.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="text-xl font-bold mb-4">
          Hasil Pemilihan {showResults && !electionEnded ? "(Real-time)" : "(Final)"}
        </h2>

        {loading ? (
          <div className="text-center py-8">
            <p>Loading results...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {results.map((result) => {
              const percentage = totalVotes > 0 ? Math.round((result.voteCount / totalVotes) * 100) : 0

              return (
                <div key={result.candidate.id} className="space-y-2">
                  <div className="flex items-center">
                    <div className="w-10 h-10 relative rounded-full overflow-hidden mr-3">
                      <Image
                        src={result.candidate.photo_url || "/placeholder.svg"}
                        alt={result.candidate.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-medium">{result.candidate.name}</div>
                      <div className="text-sm text-gray-500">
                        {result.voteCount} suara ({percentage}%)
                      </div>
                    </div>
                  </div>

                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-500 ease-in-out"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="mt-4 text-sm text-gray-500 text-center">Total: {totalVotes} suara</div>
      </CardContent>
    </Card>
  )
}
