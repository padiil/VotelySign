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
            Terima kasih telah berpartisipasi dalam pemilihan ini.
          </p>
        </div>ssName="container max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
        <div className="mt-8 text-center">h-16 w-16 text-emerald-500 mb-4" />
          <Button variant="outline" onClick={handleLogout} className="mr-4">/h1>
            <LogOut className="mr-2 h-4 w-4" />
            Ganti Pemilihanlah berpartisipasi dalam pemilihan ini.
          </Button>
        </div>
          <Link href="/">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />ogout} className="mr-4">
              Kembali ke Berandar-2 h-4 w-4" />
            </Button>ilihan
          </Link>n>
        </div>
      </div>ink href="/">
    );      <Button variant="outline" className="mt-4">
  }           <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Beranda
  return (  </Button>
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <Link href="/" className="inline-block">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
        </Link>ame="container max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        {electionFound && (sName="inline-block">
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" /> />
            Ganti Pemilihan
          </Button>
        )}Link>
      </div>
        {electionFound && (
      <h1 className="text-3xl font-bold mb-6">Go Vote</h1>dleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
      {!electionFound ? (an
        <Card className="mb-6">
          <CardContent className="pt-6">
            <form onSubmit={handleElectionCodeSubmit}>
              <div className="space-y-4">
                <div>text-3xl font-bold mb-6">Go Vote</h1>
                  <label
                    htmlFor="electionCode"
                    className="block text-sm font-medium mb-1"
                  >ent className="pt-6">
                    Kode PemilihanElectionCodeSubmit}>
                  </label>me="space-y-4">
                  <Input
                    id="electionCode"
                    placeholder="Masukkan kode pemilihan"
                    value={electionCode}t-sm font-medium mb-1"
                    onChange={(e) => setElectionCode(e.target.value)}
                    className="w-full"
                    disabled={isSubmitting}
                  />nput
                </div>="electionCode"
                <Buttonceholder="Masukkan kode pemilihan"
                  type="submit"tionCode}
                  className="w-full" setElectionCode(e.target.value)}
                  disabled={isSubmitting}
                >   disabled={isSubmitting}
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Memproses...
                    </>Name="w-full"
                  ) : (led={isSubmitting}
                    "Masuk"
                  )}sSubmitting ? (
                </Button>
              </div>  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            </form>   Memproses...
          </CardContent>
        </Card>   ) : (
      ) : (         "Masuk"
        <>        )}
          {/* Banner Image */}
          {election?.banner_url && (
            <div className="mb-6 rounded-lg overflow-hidden shadow-md">
              <div className="relative w-full h-48">
                <Image
                  src={election.banner_url || "/placeholder.svg"}
                  alt="Banner pemilihan"
                  fillmage */}
                  className="object-cover"
                />lassName="mb-6 rounded-lg overflow-hidden shadow-md">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-4 text-white">
                  <h2 className="text-2xl font-bold">{election.title}</h2>
                </div>"Banner pemilihan"
              </div>ll
            </div>className="object-cover"
          )}    />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          {/* Election title, description and prominent timer */}-white">
          <div className="mb-6">"text-2xl font-bold">{election.title}</h2>
            <h2 className="text-2xl font-bold mb-2">{election?.title}</h2>
            <p className="text-gray-600 mb-4">{election?.description}</p>
            </div>
            {/* Single prominent timer */}
            {election && (
              <div className="p-4 bg-gray-50 rounded-lg shadow-sm mb-6 border border-gray-100">
                <CountdownTimer>
                  startTime={election?.start_time ?? null}ion?.title}</h2>
                  endTime={election?.end_time ?? null}n?.description}</p>
                  variant="compact"
                  className="justify-center text-base"
                />ion && (
              </div>lassName="p-4 bg-gray-50 rounded-lg shadow-sm mb-6 border border-gray-100">
            )}  <CountdownTimer
          </div>  startTime={election?.start_time ?? null}
                  endTime={election?.end_time ?? null}
          {!voterVerified && (pact"
            <Card className="mb-6">y-center text-base"
              <CardContent className="pt-6">
                <form onSubmit={handleVoterCodeVerify}>
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="voterCode"
                        className="block text-sm font-medium mb-1"
                      >ent className="pt-6">
                        Kode PemilihleVoterCodeVerify}>
                      </label>me="space-y-4">
                      <Input
                        id="voterCode"
                        placeholder="Masukkan kode pemilih Anda"
                        value={voterCode}text-sm font-medium mb-1"
                        onChange={(e) => setVoterCode(e.target.value)}
                        className="w-full"
                        disabled={isSubmitting}
                      />nput
                    </div>="voterCode"
                    <Buttonceholder="Masukkan kode pemilih Anda"
                      type="submit"rCode}
                      className="w-full" setVoterCode(e.target.value)}
                      disabled={isSubmitting}
                    >   disabled={isSubmitting}
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Memproses...
                        </>Name="w-full"
                      ) : (led={isSubmitting}
                        "Verifikasi"
                      )}sSubmitting ? (
                    </Button>
                  </div>  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                </form>   Memproses...
              </CardContent>
            </Card>   ) : (
          )}            "Verifikasi"
                      )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {election?.candidates?.map((candidate) => (
              <CandidateCard
                key={candidate.id}
                candidate={candidate}
                isSelectable={voterVerified}
                isSelected={selectedCandidate?.id === candidate.id}
                onSelect={() => handleCandidateSelect(candidate)}-cols-3 gap-4 mb-6">
              />ction?.candidates?.map((candidate) => (
            ))}CandidateCard
          </div>key={candidate.id}
                candidate={candidate}
          {voterVerified && ({voterVerified}
            <div className="mb-6">edCandidate?.id === candidate.id}
              <labellect={() => handleCandidateSelect(candidate)}
                htmlFor="privateKey"
                className="block text-sm font-medium mb-1"
              >>
                Private Key
              </label>ed && (
              <InputssName="mb-6">
                id="privateKey"
                placeholder="Masukkan private key Anda"
                value={privateKey}ext-sm font-medium mb-1"
                onChange={(e) => setPrivateKey(e.target.value)}
                className="w-full"
                required
              />nput
              <p className="text-xs text-gray-500 mt-1">
                Private key didapat dari admin/panitia. Copy-paste persis sesuai
                yang diberikan.ey}
              </p>Change={(e) => setPrivateKey(e.target.value)}
            </div>assName="w-full"
          )}    required
              />
          {voterVerified && (ext-xs text-gray-500 mt-1">
            <div className="text-center mt-8">/panitia. Copy-paste persis sesuai
              <Buttondiberikan.
                onClick={handleVoteSubmit}
                disabled={!selectedCandidate || isSubmitting}
                className="px-8 py-6 text-lg bg-emerald-600 hover:bg-emerald-700"
              >
                {isSubmitting ? (
                  <>ssName="text-center mt-8">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memproses...oteSubmit}
                  </>led={!selectedCandidate || isSubmitting}
                ) : (Name="px-8 py-6 text-lg bg-emerald-600 hover:bg-emerald-700"
                  "Tandatangani & Kirim Suara"
                )}sSubmitting ? (
              </Button>
              <p className="text-sm text-gray-500 mt-2">mate-spin" />
                Suara Anda akan dienkripsi dan ditandatangani secara digital
              </p></>
            </div>: (
          )}      "Tandatangani & Kirim Suara"
                )}
          {/* Tabs Ringkasan & Hasil Pemilihan */}
          <Tabs defaultValue="overview" className="mb-6">
            <TabsList className="grid w-full grid-cols-2">ani secara digital
              <TabsTrigger value="overview">Ringkasan</TabsTrigger>
              <TabsTrigger value="results">Hasil Pemilihan</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              <ElectionDetails Hasil Pemilihan */}
                election={{e="overview" className="mb-6">
                  ...election,e="grid w-full grid-cols-2">
                  banner: election?.banner_url,gkasan</TabsTrigger>
                }}sTrigger value="results">Hasil Pemilihan</TabsTrigger>
              />bsList>
            </TabsContent>alue="overview">
            {/* // Update the Results tab content section */}
            <TabsContent value="results">
              <Card>.election,
                <CardContent className="pt-6">,
                  <h3 className="text-lg font-semibold mb-4">
                    Hasil Pemilihan dari Blockchain
                  </h3>nt>
                  {election && election.showRealTimeResults !== false ? (
                    <div className="space-y-6">
                      <div className="space-y-4">
                        {/* Simple vote count display */}
                        {election.candidatest-semibold mb-4">
                          .slice(0, 3)ri Blockchain
                          .map((candidate, index) => (
                            <divlection.showRealTimeResults !== false ? (
                              key={candidate.id}
                              className="flex items-center justify-between"
                            >imple vote count display */}
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
                                <span>ate, index) => (
                                  {candidate.name || `Kandidat #${index + 1}`}
                                </span>idate.id}
                              </div>ame="flex items-center justify-between"
                              <span className="font-semibold">
                                {blockchainResults[candidate.id] || 0} suara
                              </span>className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
                            </div>pan>
                          ))}     {candidate.name || `Kandidat #${index + 1}`}
                                </span>
                        {/* Show ellipsis if there are more candidates */}
                        {election.candidates.length > 3 && (">
                          <div className="text-center text-gray-500">...</div>
                        )}    </span>
                      </div></div>
                          ))}
                      {/* Button to redirect to live count page */}
                      <div className="mt-6 text-center">ore candidates */}
                        <Buttonon.candidates.length > 3 && (
                          onClick={() => {text-center text-gray-500">...</div>
                            // Redirect to live count page while preserving election code
                            router.push(`/live-count?code=${election.code}`);
                          }}
                          variant="outline"t to live count page */}
                          className="w-full"ext-center">
                        >Button
                          Lihat Live Count Lengkap
                          <ArrowRight className="ml-2 h-4 w-4" />preserving election code
                        </Button>r.push(`/live-count?code=${election.code}`);
                      </div>
                    </div>variant="outline"
                  ) : (   className="w-full"
                    <div className="text-center py-6">
                      <Lock className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                      <p className="text-gray-600">-2 h-4 w-4" />
                        Hasil pemilihan akan disembunyikan hingga periode
                        pemilihan berakhir.
                      </p>
                    </div>
                  )}<div className="text-center py-6">
                </CardContent>assName="mx-auto h-10 w-10 text-gray-400 mb-3" />
              </Card> <p className="text-gray-600">
            </TabsContent>sil pemilihan akan disembunyikan hingga periode
          </Tabs>       pemilihan berakhir.
        </>           </p>
      )}            </div>
    </div>        )}
  );            </CardContent>
}             </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
