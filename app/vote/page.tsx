"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import CandidateCard from "@/components/candidate-card";
import VotingResults from "@/components/voting-results";
import Image from "next/image";
import { getElectionByCode } from "@/actions/election-actions";
import { verifyVoterCode, castVote } from "@/actions/voter-actions";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

export default function VotePage() {
  const router = useRouter();
  const [electionCode, setElectionCode] = useState("");
  const [voterCode, setVoterCode] = useState("");
  const [electionFound, setElectionFound] = useState(false);
  const [voterVerified, setVoterVerified] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voteSubmitted, setVoteSubmitted] = useState(false);

  type Candidate = {
    id: string;
    name: string;
    description: string;
    [key: string]: any;
  };

  type Election = {
    candidates: Candidate[];
    id: string;
    title: string;
    description: string;
    start_time: string;
    end_time: string;
    code: string;
    banner_url?: string;
    created_at: string;
  };

  const [election, setElection] = useState<Election | null>(null);
  type Voter = {
    id: string;
    [key: string]: any;
  };
  const [voter, setVoter] = useState<Voter | null | undefined>(null);
  const [voteResults, setVoteResults] = useState(null);

  const handleElectionCodeSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!electionCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter an election code",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await getElectionByCode(electionCode);

      if (!result.success) {
        toast({
          title: "Error",
          description: result.error || "Invalid election code",
          variant: "destructive",
        });
        return;
      }

      if (!result.data) {
        toast({
          title: "Error",
          description: "Election data is missing from the response.",
          variant: "destructive",
        });
        return;
      }

      setElection(result.data);
      setElectionFound(true);
    } catch (error) {
      console.error("Error fetching election:", error);
      toast({
        title: "Error",
        description: "Failed to verify election code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVoterCodeVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!voterCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a voter code",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await verifyVoterCode(electionCode, voterCode);

      if (!result.success) {
        toast({
          title: "Error",
          description: result.error || "Invalid voter code",
          variant: "destructive",
        });
        return;
      }

      setVoter(result.data);
      setVoterVerified(true);
    } catch (error) {
      console.error("Error verifying voter:", error);
      toast({
        title: "Error",
        description: "Failed to verify voter code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCandidateSelect = (candidate: Candidate) => {
    if (voterVerified) {
      setSelectedCandidate(candidate);
    }
  };

  const handleVoteSubmit = async () => {
    if (!selectedCandidate || !voter) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate a simple signature (in a real app, this would be a proper digital signature)
      const signature = `${voter.id}-${selectedCandidate.id}-${Date.now()}`;

      const result = await castVote(voter.id, selectedCandidate.id, signature);

      if (!result.success) {
        toast({
          title: "Error",
          description: result.error || "Failed to cast vote",
          variant: "destructive",
        });
        return;
      }

      setVoteSubmitted(true);
    } catch (error) {
      console.error("Error casting vote:", error);
      toast({
        title: "Error",
        description: "Failed to cast vote. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (voteSubmitted) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <CheckCircle className="mx-auto h-16 w-16 text-emerald-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Suara Anda Telah Dikirim!</h1>
          <p className="text-gray-600">
            Terima kasih telah berpartisipasi dalam pemilihan ini.
          </p>
        </div>

        <VotingResults
          candidates={election?.candidates || []}
          electionId={election?.id ?? ""}
          showResults={true} // This would come from the election settings
          electionEnded={new Date() > new Date(election?.end_time ?? 0)}
        />

        <div className="mt-8 text-center">
          <Link href="/">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Beranda
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <Link href="/" className="inline-block mb-6">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>
      </Link>

      <h1 className="text-3xl font-bold mb-6">Go Vote</h1>

      {!electionFound ? (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <form onSubmit={handleElectionCodeSubmit}>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="electionCode"
                    className="block text-sm font-medium mb-1"
                  >
                    Kode Pemilihan
                  </label>
                  <Input
                    id="electionCode"
                    placeholder="Masukkan kode pemilihan"
                    value={electionCode}
                    onChange={(e) => setElectionCode(e.target.value)}
                    className="w-full"
                    disabled={isSubmitting}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    "Masuk"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Banner Image */}
          {election?.banner_url && (
            <div className="mb-6 rounded-lg overflow-hidden shadow-md">
              <div className="relative w-full h-48">
                <Image
                  src={election.banner_url || "/placeholder.svg"}
                  alt="Banner pemilihan"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-4 text-white">
                  <h2 className="text-2xl font-bold">{election.title}</h2>
                </div>
              </div>
            </div>
          )}

          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">{election?.title}</h2>
            <p className="text-gray-600">{election?.description}</p>
          </div>

          {!voterVerified && (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <form onSubmit={handleVoterCodeVerify}>
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="voterCode"
                        className="block text-sm font-medium mb-1"
                      >
                        Kode Pemilih
                      </label>
                      <Input
                        id="voterCode"
                        placeholder="Masukkan kode pemilih Anda"
                        value={voterCode}
                        onChange={(e) => setVoterCode(e.target.value)}
                        className="w-full"
                        disabled={isSubmitting}
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Memproses...
                        </>
                      ) : (
                        "Verifikasi"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {election?.candidates?.map((candidate) => (
              <CandidateCard
                key={candidate.id}
                candidate={candidate}
                isSelectable={voterVerified}
                isSelected={selectedCandidate?.id === candidate.id}
                onSelect={() => handleCandidateSelect(candidate)}
              />
            ))}
          </div>

          {voterVerified && (
            <div className="text-center mt-8">
              <Button
                onClick={handleVoteSubmit}
                disabled={!selectedCandidate || isSubmitting}
                className="px-8 py-6 text-lg bg-emerald-600 hover:bg-emerald-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  "Tandatangani & Kirim Suara"
                )}
              </Button>
              <p className="text-sm text-gray-500 mt-2">
                Suara Anda akan dienkripsi dan ditandatangani secara digital
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
