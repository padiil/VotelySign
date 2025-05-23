"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, CheckCircle, Loader2, Lock, LogOut } from "lucide-react";
import Link from "next/link";
import CandidateCard from "@/components/candidate-card";
import Image from "next/image";
import { getElectionByCode } from "@/actions/election-actions";
import { verifyVoterCode, checkVoterHasVoted } from "@/actions/voter-actions";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import ElectionDetails from "@/components/election-details";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {mage from "next/image";
  sendVoteToBlockchain,ode } from "@/actions/election-actions";
  getVotesCountFromBlockchain,kVoterHasVoted } from "@/actions/voter-actions";
} from "@/lib/eth-voting";omponents/ui/use-toast";
import { schnorrSign } from "@/lib/crypto";;
import CountdownTimer from "@/components/countdown-timer";";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
export default function VotePage() {
  const router = useRouter();
  const [electionCode, setElectionCode] = useState("");
  const [voterCode, setVoterCode] = useState("");
  const [electionFound, setElectionFound] = useState(false);
  const [voterVerified, setVoterVerified] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(
    nullefault function VotePage() {
  );nst router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voteSubmitted, setVoteSubmitted] = useState(false);
  const [privateKey, setPrivateKey] = useState("");e(false);
  const [voterVerified, setVoterVerified] = useState(false);
  type Candidate = {didate, setSelectedCandidate] = useState<Candidate | null>(
    id: string;
    name: string;
    description: string;etIsSubmitting] = useState(false);
    [key: string]: any; setVoteSubmitted] = useState(false);
  };nst [privateKey, setPrivateKey] = useState("");

  type Election = {{
    candidates: Candidate[];
    id: string;g;
    title: string;tring;
    description: string;
    start_time: string;
    end_time: string;
    code: string; {
    banner_url?: string;e[];
    created_at: string;
    showRealTimeResults?: boolean;
  };description: string;
    start_time: string;
  const [election, setElection] = useState<Election | null>(null);
  type Voter = {;
    id: string;: string;
    [key: string]: any;
  };showRealTimeResults?: boolean;
  const [voter, setVoter] = useState<Voter | null | undefined>(null);
  const [voteResults, setVoteResults] = useState(null);
  const [election, setElection] = useState<Election | null>(null);
  // Load saved election and voter data from localStorage on component mount
  useEffect(() => {
    // Check if we have saved election data
    const savedElectionCode = localStorage.getItem("electionCode");
    const savedElectionData = localStorage.getItem("electionData"););
  const [voteResults, setVoteResults] = useState(null);
    if (savedElectionCode && savedElectionData) {
      setElectionCode(savedElectionCode);rom localStorage on component mount
      try {(() => {
        const parsedElection = JSON.parse(savedElectionData);
        setElection(parsedElection);torage.getItem("electionCode");
        setElectionFound(true);ocalStorage.getItem("electionData");

        // Also check if we have voter dataata) {
        const savedVoterCode = localStorage.getItem("voterCode");
        const savedVoterData = localStorage.getItem("voterData");
        const parsedElection = JSON.parse(savedElectionData);
        if (savedVoterCode && savedVoterData) {
          setVoterCode(savedVoterCode);
          try {
            const parsedVoter = JSON.parse(savedVoterData);
            setVoter(parsedVoter);alStorage.getItem("voterCode");
            setVoterVerified(true);lStorage.getItem("voterData");
          } catch (e) {
            console.error("Error parsing saved voter data:", e);
            clearVoterData();oterCode);
          }ry {
        }   const parsedVoter = JSON.parse(savedVoterData);
      } catch (e) {r(parsedVoter);
        console.error("Error parsing saved election data:", e);
        clearAllData();
      }     console.error("Error parsing saved voter data:", e);
    }       clearVoterData();
          }
    // Check if vote was already submitted
    const voteWasSubmitted = localStorage.getItem("voteSubmitted");
    if (voteWasSubmitted === "true") {aved election data:", e);
      setVoteSubmitted(true);
    } }
  }, []);

  const clearVoterData = () => { submitted
    localStorage.removeItem("voterCode");.getItem("voteSubmitted");
    localStorage.removeItem("voterData");
    setVoterCode("");d(true);
    setVoter(null);
    setVoterVerified(false);
    setSelectedCandidate(null);
  };nst clearVoterData = () => {
    localStorage.removeItem("voterCode");
  const clearAllData = () => {oterData");
    localStorage.removeItem("electionCode");
    localStorage.removeItem("electionData");
    localStorage.removeItem("voterCode");
    localStorage.removeItem("voterData");
    localStorage.removeItem("voteSubmitted");
    setElectionCode("");
    setVoterCode("");= () => {
    setElection(null);eItem("electionCode");
    setVoter(null);moveItem("electionData");
    setElectionFound(false);"voterCode");
    setVoterVerified(false);"voterData");
    setSelectedCandidate(null);teSubmitted");
    setVoteSubmitted(false);
  };setVoterCode("");
    setElection(null);
  const handleLogout = () => {
    clearAllData();d(false);
  };setVoterVerified(false);
    setSelectedCandidate(null);
  const fetchElection = async (code: string) => {
    setIsSubmitting(true);

    try {andleLogout = () => {
      const result = await getElectionByCode(code);
  };
      if (!result.success) {
        toast({ection = async (code: string) => {
          title: "Error",;
          description: result.error || "Invalid election code",
          variant: "destructive",
        }); result = await getElectionByCode(code);
        return;
      }f (!result.success) {
        toast({
      if (!result.data) {
        toast({iption: result.error || "Invalid election code",
          title: "Error",uctive",
          description: "Election data is missing from the response.",
          variant: "destructive",
        });
        return;
      }f (!result.data) {
        toast({
      setElection(result.data);
      setElectionFound(true);ion data is missing from the response.",
          variant: "destructive",
      // Save to localStorage
      localStorage.setItem("electionCode", code);
      localStorage.setItem("electionData", JSON.stringify(result.data));
    } catch (error) {
      console.error("Error fetching election:", error);
      toast({tionFound(true);
        title: "Error",
        description: "Failed to verify election code. Please try again.",
        variant: "destructive",ctionCode", code);
      });alStorage.setItem("electionData", JSON.stringify(result.data));
    } finally {ror) {
      setIsSubmitting(false);tching election:", error);
    } toast({
  };    title: "Error",
        description: "Failed to verify election code. Please try again.",
  const handleElectionCodeSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {nally {
    e.preventDefault();alse);
    }
    if (!electionCode.trim()) {
      toast({
        title: "Error",odeSubmit = async (
        description: "Please enter an election code",
        variant: "destructive",
      });ventDefault();
      return;
    }f (!electionCode.trim()) {
      toast({
    await fetchElection(electionCode);
  };    description: "Please enter an election code",
        variant: "destructive",
  const handleVoterCodeVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    }
    if (!voterCode.trim()) {
      toast({chElection(electionCode);
        title: "Error",
        description: "Please enter a voter code",
        variant: "destructive", async (e: React.FormEvent<HTMLFormElement>) => {
      });ventDefault();
      return;
    }f (!voterCode.trim()) {
      toast({
    setIsSubmitting(true);
        description: "Please enter a voter code",
    try {ariant: "destructive",
      const result = await verifyVoterCode(electionCode, voterCode);
      return;
      if (!result.success) {
        toast({
          title: "Error",;
          description: result.error || "Invalid voter code",
          variant: "destructive",
        }); result = await verifyVoterCode(electionCode, voterCode);
        return;
      }f (!result.success) {
        toast({
      setVoter(result.data);
      setVoterVerified(true);.error || "Invalid voter code",
          variant: "destructive",
      // Save voter data to localStorage
      localStorage.setItem("voterCode", voterCode);
      localStorage.setItem("voterData", JSON.stringify(result.data));
    } catch (error) {
      console.error("Error verifying voter:", error);
      toast({rVerified(true);
        title: "Error",
        description: "Failed to verify voter code. Please try again.",
        variant: "destructive",erCode", voterCode);
      });alStorage.setItem("voterData", JSON.stringify(result.data));
    } finally {ror) {
      setIsSubmitting(false);rifying voter:", error);
    } toast({
  };    title: "Error",
        description: "Failed to verify voter code. Please try again.",
  const handleCandidateSelect = (candidate: Candidate) => {
    if (voterVerified) {
      setSelectedCandidate(candidate);
    } setIsSubmitting(false);
  };}
  };
  const handleVoteSubmit = async () => {
    if (!selectedCandidate || !voter || !election?.id) {> {
      return;Verified) {
    } setSelectedCandidate(candidate);
    }
    setIsSubmitting(true);

    try {andleVoteSubmit = async () => {
      // Cek status voting di backend sebelum submit ke blockchain
      const check = await checkVoterHasVoted({
        kodePemilih: voterCode,
        electionId: election.id,
      });Submitting(true);
      if (!check.success) {
        toast({
          title: "Error",g di backend sebelum submit ke blockchain
          description:ait checkVoterHasVoted({
            check.error ||Code,
            "Kamu sudah melakukan voting, tidak bisa vote dua kali.",
          variant: "destructive",
        });check.success) {
        setIsSubmitting(false);
        return;: "Error",
      }   description:
            check.error ||
      // Generate Schnorr signature dari vote datasa vote dua kali.",
      const voteData = {ructive",
        voter: voter.id,
        candidate: selectedCandidate.id,
        timestamp: Date.now(),
      };
      const messageHash = window.crypto
        ? Buffer.from(orr signature dari vote data
            await window.crypto.subtle.digest(
              "SHA-256",
              new TextEncoder().encode(JSON.stringify(voteData))
            )tamp: Date.now(),
          ).toString("hex")
        : require("crypto")indow.crypto
            .createHash("sha256")
            .update(JSON.stringify(voteData))(
            .digest("hex");
      const schnorrSignature = await schnorrSign(messageHash, privateKey);
      // ZKP proof (dummy, ganti dengan real ZKP jika frontend support)
      const zkpProof = "zkp_not_implemented_in_frontend";
      const txHash = await sendVoteToBlockchain({
        candidateId: Number(selectedCandidate.id),
        schnorrSignature,stringify(voteData))
        zkpProof,st("hex");
      });st schnorrSignature = await schnorrSign(messageHash, privateKey);
      toast({proof (dummy, ganti dengan real ZKP jika frontend support)
        title: "Vote Terkirim ke Blockchain!",_frontend";
        description: `Tx Hash: ${txHash}`,chain({
      });andidateId: Number(selectedCandidate.id),
        schnorrSignature,
      // Mark vote as submitted
      setVoteSubmitted(true);
      localStorage.setItem("voteSubmitted", "true");
        title: "Vote Terkirim ke Blockchain!",
      // We preserve the election data but clear the voting process data
      clearVoterData();
    } catch (error: any) {
      console.error("Error casting vote:", error);
      // Tangkap error Already voted dari blockchain
      if (lStorage.setItem("voteSubmitted", "true");
        error?.message?.includes("Already voted") ||
        error?.error?.message?.includes("Already voted")ing process data
      ) {arVoterData();
        toast({ror: any) {
          title: "Error",r casting vote:", error);
          description: "Kamu sudah melakukan voting, tidak bisa vote dua kali.",
          variant: "destructive",
        });or?.message?.includes("Already voted") ||
      } else {.error?.message?.includes("Already voted")
        toast({
          title: "Error",
          description:r",
            error?.message || "Failed to cast vote. Please try lagi.",ua kali.",
          variant: "destructive",
        });
      } else {
    } finally {
      setIsSubmitting(false);
    }     description:
  };        error?.message || "Failed to cast vote. Please try lagi.",
          variant: "destructive",
  // Ambil hasil voting dari blockchain
  const [blockchainResults, setBlockchainResults] = useState<{
    [candidateId: string]: number;
  }>({});IsSubmitting(false);
  useEffect(() => {
    async function fetchResults() {
      if (!election) return;
      const results: { [candidateId: string]: number } = {};
      for (const candidate of election.candidates) {useState<{
        results[candidate.id] = await getVotesCountFromBlockchain(
          Number(candidate.id)
        );t(() => {
      }nc function fetchResults() {
      setBlockchainResults(results);
    } const results: { [candidateId: string]: number } = {};
    fetchResults();ndidate of election.candidates) {
  }, [election, voteSubmitted]);await getVotesCountFromBlockchain(
          Number(candidate.id)
  if (voteSubmitted) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <CheckCircle className="mx-auto h-16 w-16 text-emerald-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Suara Anda Telah Dikirim!</h1>
          <p className="text-gray-600">
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

        <div className="mt-8 text-center">
          <Button variant="outline" onClick={handleLogout} className="mr-4">
            <LogOut className="mr-2 h-4 w-4" />
            Ganti Pemilihan
          </Button>

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
      <div className="flex justify-between items-center mb-6">
        <Link href="/" className="inline-block">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
        </Link>

        {electionFound && (
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Ganti Pemilihan
          </Button>
        )}
      </div>

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

          {/* Election title, description and prominent timer */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">{election?.title}</h2>
            <p className="text-gray-600 mb-4">{election?.description}</p>

            {/* Single prominent timer */}
            {election && (
              <div className="p-4 bg-gray-50 rounded-lg shadow-sm mb-6 border border-gray-100">
                <CountdownTimer
                  startTime={election?.start_time ?? null}
                  endTime={election?.end_time ?? null}
                  variant="compact"
                  className="justify-center text-base"
                />
              </div>
            )}
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
            {/* // Update the Results tab content section */}
            <TabsContent value="results">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Hasil Pemilihan dari Blockchain
                  </h3>
                  {election && election.showRealTimeResults !== false ? (
                    <div className="space-y-6">
                      <div className="space-y-4">
                        {/* Simple vote count display */}
                        {election.candidates
                          .slice(0, 3)
                          .map((candidate, index) => (
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
                              <span className="font-semibold">
                                {blockchainResults[candidate.id] || 0} suara
                              </span>
                            </div>
                          ))}

                        {/* Show ellipsis if there are more candidates */}
                        {election.candidates.length > 3 && (
                          <div className="text-center text-gray-500">...</div>
                        )}
                      </div>

                      {/* Button to redirect to live count page */}
                      <div className="mt-6 text-center">
                        <Button
                          onClick={() => {
                            // Redirect to live count page while preserving election code
                            router.push(`/live-count?code=${election.code}`);
                          }}
                          variant="outline"
                          className="w-full"
                        >
                          Lihat Live Count Lengkap
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
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
