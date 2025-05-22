"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, CheckCircle, Loader2, Lock } from "lucide-react";
import Link from "next/link";
import CandidateCard from "@/components/candidate-card";
import VotingResults from "@/components/voting-results";
import Image from "next/image";
import { getElectionByCode } from "@/actions/election-actions";
import { verifyVoterCode, checkVoterHasVoted } from "@/actions/voter-actions";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import ElectionDetails from "@/components/election-details";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { sendVoteToBlockchain, getVotesCountFromBlockchain } from "@/lib/eth-voting";
import { schnorrSign } from "@/lib/crypto";
import CountdownTimer from "@/components/countdown-timer";
// Add at the top of your VotePage function:
useEffect(() => {
  // Check if we have saved election code in localStorage
  const savedElectionCode = localStorage.getItem('electionCode');
  if (savedElectionCode) {
    setElectionCode(savedElectionCode);
    // Automatically retrieve the election
    fetchElection(savedElectionCode);
  }
}, []);

// Create a function to fetch the election data
const fetchElection = async (code: string) => {
  setIsSubmitting(true);
  
  try {
    const result = await getElectionByCode(code);
    
    if (result.success && result.data) {
      setElection(result.data);
      setElectionFound(true);
      // Save to localStorage
      localStorage.setItem('electionCode', code);
      localStorage.setItem('electionData', JSON.stringify(result.data));
    }
  } catch (error) {
    console.error("Error fetching election:", error);
    // Optional: clear localStorage if the election is no longer valid
    // localStorage.removeItem('electionCode');
    // localStorage.removeItem('electionData');
  } finally {
    setIsSubmitting(false);
  }
};

// Update your handleElectionCodeSubmit function to use fetchElection
const handleElectionCodeSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  
  if (!electionCode.trim()) {
    toast({
      title: "Error",
      description: "Please enter an election code",
      variant: "destructive",
    });
    return;
  }
  
  await fetchElection(electionCode);
};
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
  const [privateKey, setPrivateKey] = useState("");

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
    showRealTimeResults?: boolean;
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
    if (!selectedCandidate || !voter || !election?.id) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Cek status voting di backend sebelum submit ke blockchain
      const check = await checkVoterHasVoted({ kodePemilih: voterCode, electionId: election.id });
      if (!check.success) {
        toast({
          title: "Error",
          description: check.error || "Kamu sudah melakukan voting, tidak bisa vote dua kali.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Generate Schnorr signature dari vote data
      const voteData = {
        voter: voter.id,
        candidate: selectedCandidate.id,
        timestamp: Date.now(),
      };
      const messageHash = window.crypto
        ? Buffer.from(await window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(JSON.stringify(voteData)))).toString("hex")
        : require("crypto").createHash("sha256").update(JSON.stringify(voteData)).digest("hex");
      const schnorrSignature = await schnorrSign(messageHash, privateKey);
      // ZKP proof (dummy, ganti dengan real ZKP jika frontend support)
      const zkpProof = "zkp_not_implemented_in_frontend";
      const txHash = await sendVoteToBlockchain({
        candidateId: Number(selectedCandidate.id),
        schnorrSignature,
        zkpProof,
      });
      toast({
        title: "Vote Terkirim ke Blockchain!",
        description: `Tx Hash: ${txHash}`,
      });
      setVoteSubmitted(true);
    } catch (error: any) {
      console.error("Error casting vote:", error);
      // Tangkap error Already voted dari blockchain
      if (
        error?.message?.includes("Already voted") ||
        error?.error?.message?.includes("Already voted")
      ) {
        toast({
          title: "Error",
          description: "Kamu sudah melakukan voting, tidak bisa vote dua kali.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error?.message || "Failed to cast vote. Please try lagi.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Ambil hasil voting dari blockchain
  const [blockchainResults, setBlockchainResults] = useState<{ [candidateId: string]: number }>({});
  useEffect(() => {
    async function fetchResults() {
      if (!election) return;
      const results: { [candidateId: string]: number } = {};
      for (const candidate of election.candidates) {
        results[candidate.id] = await getVotesCountFromBlockchain(Number(candidate.id));
      }
      setBlockchainResults(results);
    }
    fetchResults();
  }, [election, voteSubmitted]);

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
            <p className="text-gray-600 mb-1">{election?.description}</p>

            {/* Add the inline timer here */}
            <CountdownTimer
              startTime={election?.start_time ?? null}
              endTime={election?.end_time ?? null}
              variant="inline"
              className="text-gray-500"
            />
          </div>

          {electionFound && election && (
            <div className="p-4 bg-gray-50 rounded-lg shadow-sm mb-6">
              <h3 className="font-medium text-gray-700 mb-2">
                Election Timing
              </h3>
              <CountdownTimer
                startTime={election?.start_time ?? null}
                endTime={election?.end_time ?? null}
                variant="compact"
              />
            </div>
          )}

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
            <div className="mb-6">
              <label
                htmlFor="privateKey"
                className="block text-sm font-medium mb-1"
              >
                Private Key
              </label>
              <Input
                id="privateKey"
                placeholder="Masukkan private key Anda"
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                className="w-full"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Private key didapat dari admin/panitia. Copy-paste persis sesuai
                yang diberikan.
              </p>
            </div>
          )}

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

          {/* Tabs Ringkasan & Hasil Pemilihan */}
          <Tabs defaultValue="overview" className="mb-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Ringkasan</TabsTrigger>
              <TabsTrigger value="results">Hasil Pemilihan</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              <ElectionDetails
                election={{
                  ...election,
                  banner: election?.banner_url,
                }}
              />
            </TabsContent>
            <TabsContent value="results">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Hasil Pemilihan dari Blockchain
                  </h3>
                  {election && election.showRealTimeResults !== false ? (
                    <div className="space-y-4">
                      {election.candidates.map((candidate, index) => (
                        <div
                          key={candidate.id}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
                            <span>
                              {candidate.name || `Kandidat #${index + 1}`}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-48 h-4 bg-gray-100 rounded-full overflow-hidden mr-3">
                              <div
                                className="h-full bg-emerald-500"
                                style={{
                                  width: `${blockchainResults[candidate.id] ? Math.min(blockchainResults[candidate.id] * 10, 100) : 0}%`,
                                }}
                              ></div>
                            </div>
                            <span className="font-semibold">
                              {blockchainResults[candidate.id] || 0} suara
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Lock className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                      <p className="text-gray-600">
                        Hasil pemilihan akan disembunyikan hingga periode
                        pemilihan berakhir.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
