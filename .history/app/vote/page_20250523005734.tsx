"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Loader2,
  Lock,
  LogOut,
  Vote,
  FileText,
  BarChart3,
  Shield,
  KeyRound,
  Users,
} from "lucide-react";
import Link from "next/link";
import CandidateCard from "@/components/candidate-card";
import Image from "next/image";
import { getElectionByCode } from "@/actions/election-actions";
import { verifyVoterCode, checkVoterHasVoted } from "@/actions/voter-actions";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import ElectionDetails from "@/components/election-details";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  sendVoteToBlockchain,
  getVotesCountFromBlockchain,
} from "@/lib/eth-voting";
import { schnorrSign } from "@/lib/crypto";
import CountdownTimer from "@/components/countdown-timer";

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
    voters_count?: number;
  };

  const [election, setElection] = useState<Election | null>(null);
  type Voter = {
    id: string;
    [key: string]: any;
  };
  const [voter, setVoter] = useState<Voter | null | undefined>(null);
  const [voteResults, setVoteResults] = useState(null);

  // Load saved election and voter data from localStorage on component mount
  useEffect(() => {
    // Check if we have saved election data
    const savedElectionCode = localStorage.getItem("electionCode");
    const savedElectionData = localStorage.getItem("electionData");

    if (savedElectionCode && savedElectionData) {
      setElectionCode(savedElectionCode);
      try {
        const parsedElection = JSON.parse(savedElectionData);
        setElection(parsedElection);
        setElectionFound(true);

        // Also check if we have voter data
        const savedVoterCode = localStorage.getItem("voterCode");
        const savedVoterData = localStorage.getItem("voterData");

        if (savedVoterCode && savedVoterData) {
          setVoterCode(savedVoterCode);
          try {
            const parsedVoter = JSON.parse(savedVoterData);
            setVoter(parsedVoter);
            setVoterVerified(true);
          } catch (e) {
            console.error("Error parsing saved voter data:", e);
            clearVoterData();
          }
        }
      } catch (e) {
        console.error("Error parsing saved election data:", e);
        clearAllData();
      }
    }

    // Check if vote was already submitted
    const voteWasSubmitted = localStorage.getItem("voteSubmitted");
    if (voteWasSubmitted === "true") {
      setVoteSubmitted(true);
    }
  }, []);

  const clearVoterData = () => {
    localStorage.removeItem("voterCode");
    localStorage.removeItem("voterData");
    setVoterCode("");
    setVoter(null);
    setVoterVerified(false);
    setSelectedCandidate(null);
  };

  const clearAllData = () => {
    localStorage.removeItem("electionCode");
    localStorage.removeItem("electionData");
    localStorage.removeItem("voterCode");
    localStorage.removeItem("voterData");
    localStorage.removeItem("voteSubmitted");
    setElectionCode("");
    setVoterCode("");
    setElection(null);
    setVoter(null);
    setElectionFound(false);
    setVoterVerified(false);
    setSelectedCandidate(null);
    setVoteSubmitted(false);
  };

  const handleLogout = () => {
    clearAllData();
  };

  const fetchElection = async (code: string) => {
    setIsSubmitting(true);

    try {
      const result = await getElectionByCode(code);

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

      // Save to localStorage
      localStorage.setItem("electionCode", code);
      localStorage.setItem("electionData", JSON.stringify(result.data));
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

    await fetchElection(electionCode);
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

      // Save voter data to localStorage
      localStorage.setItem("voterCode", voterCode);
      localStorage.setItem("voterData", JSON.stringify(result.data));
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
      const check = await checkVoterHasVoted({
        kodePemilih: voterCode,
        electionId: election.id,
      });

      if (!check.success) {
        toast({
          title: "Error",
          description:
            check.error ||
            "Kamu sudah melakukan voting, tidak bisa vote dua kali.",
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
        ? Buffer.from(
            await window.crypto.subtle.digest(
              "SHA-256",
              new TextEncoder().encode(JSON.stringify(voteData))
            )
          ).toString("hex")
        : require("crypto")
            .createHash("sha256")
            .update(JSON.stringify(voteData))
            .digest("hex");

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

      // Mark vote as submitted
      setVoteSubmitted(true);
      localStorage.setItem("voteSubmitted", "true");

      // We preserve the election data but clear the voting process data
      clearVoterData();
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
          description:
            error?.message || "Failed to cast vote. Please try lagi.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Ambil hasil voting dari blockchain
  const [blockchainResults, setBlockchainResults] = useState<{
    [candidateId: string]: number;
  }>({});

  useEffect(() => {
    async function fetchResults() {
      if (!election) return;
      const results: { [candidateId: string]: number } = {};
      for (const candidate of election.candidates) {
        results[candidate.id] = await getVotesCountFromBlockchain(
          Number(candidate.id)
        );
      }
      setBlockchainResults(results);
    }
    fetchResults();
  }, [election, voteSubmitted]);

  if (voteSubmitted) {
    return (
      <div className="w-full bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="container"
        >
          <Link href="/" className="inline-block mb-6">
            <Button
              variant="ghost"
              size="sm"
              className="text-teal-700 hover:text-teal-800 hover:bg-teal-50 dark:text-teal-500 dark:hover:bg-teal-950/50"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Beranda
            </Button>
          </Link>

          <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
            <CardContent className="pt-12 pb-8 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-teal-600 dark:text-teal-500" />
              </div>

              <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">
                Suara Berhasil Dikirim!
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-8">
                Terima kasih telah berpartisipasi dalam pemilihan ini. Suara
                Anda telah terverifikasi di blockchain.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="border-teal-200 text-teal-700 hover:bg-teal-50 hover:text-teal-800 dark:border-teal-900/30 dark:text-teal-500 dark:hover:bg-teal-900/20"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Ganti Pemilihan
                </Button>

                <Link href="/">
                  <Button className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white border-0">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Kembali ke Beranda
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 py-8">
      <div className="container">
        <div className="flex justify-between items-center mb-6">
          <Link href="/" className="inline-block">
            <Button
              variant="ghost"
              size="sm"
              className="text-teal-700 hover:text-teal-800 hover:bg-teal-50 dark:text-teal-500 dark:hover:bg-teal-950/50"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali
            </Button>
          </Link>

          {electionFound && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-teal-200 text-teal-700 hover:bg-teal-50 hover:text-teal-800 dark:border-teal-900/30 dark:text-teal-500 dark:hover:bg-teal-900/20"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Ganti Pemilihan
            </Button>
          )}
        </div>

        <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-teal-700 to-emerald-600 bg-clip-text text-transparent dark:from-teal-500 dark:to-emerald-400">
          Berikan Suara Anda
        </h1>

        {!electionFound ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="mb-6 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden">
              <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800">
                <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
                  <Vote className="mr-2 h-5 w-5 text-teal-600 dark:text-teal-500" />
                  Akses Pemilihan
                </CardTitle>
                <CardDescription className="dark:text-gray-400">
                  Masukkan kode pemilihan untuk melanjutkan
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleElectionCodeSubmit}>
                  <div className="space-y-4">
                    <div>
                      <Label
                        htmlFor="electionCode"
                        className="text-gray-700 dark:text-gray-300"
                      >
                        Kode Pemilihan
                      </Label>
                      <Input
                        id="electionCode"
                        placeholder="Masukkan kode pemilihan"
                        value={electionCode}
                        onChange={(e) => setElectionCode(e.target.value)}
                        className="mt-1.5 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
                        disabled={isSubmitting}
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white border-0"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Memproses...
                        </>
                      ) : (
                        "Akses Pemilihan"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Election Info & Banner */}
            <Card className="mb-6 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden">
              {election?.banner_url && (
                <div className="relative w-full h-48">
                  <Image
                    src={election.banner_url || "/placeholder.svg"}
                    alt="Banner pemilihan"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-white/90 text-teal-700 hover:bg-white/80 dark:bg-gray-900/90 dark:text-teal-400">
                      Kode: {election.code}
                    </Badge>
                  </div>
                </div>
              )}

              <CardHeader
                className={
                  election?.banner_url
                    ? "pt-3"
                    : "pb-3 border-b border-gray-100 dark:border-gray-800"
                }
              >
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-gray-900 dark:text-gray-100">
                      {election?.title}
                    </CardTitle>
                    <CardDescription className="dark:text-gray-400 mt-1">
                      {election?.description}
                    </CardDescription>
                  </div>
                  {!election?.banner_url && (
                    <Badge
                      variant="outline"
                      className="text-xs font-mono border-teal-100 text-teal-700 dark:border-teal-900/40 dark:text-teal-500"
                    >
                      Kode: {election?.code}
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                {election && (
                  <div className="p-4 bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 rounded-lg shadow-sm border border-teal-100 dark:border-teal-900/30">
                    <CountdownTimer
                      startTime={election?.start_time ?? null}
                      endTime={election?.end_time ?? null}
                      variant="compact"
                      className="justify-center text-base"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {!voterVerified ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="mb-6 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden">
                  <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800">
                    <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
                      <KeyRound className="mr-2 h-5 w-5 text-teal-600 dark:text-teal-500" />
                      Verifikasi Pemilih
                    </CardTitle>
                    <CardDescription className="dark:text-gray-400">
                      Masukkan kode pemilih untuk hak suara Anda
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <form onSubmit={handleVoterCodeVerify}>
                      <div className="space-y-4">
                        <div>
                          <Label
                            htmlFor="voterCode"
                            className="text-gray-700 dark:text-gray-300"
                          >
                            Kode Pemilih
                          </Label>
                          <div className="mt-1.5 relative">
                            <Input
                              id="voterCode"
                              placeholder="Masukkan kode pemilih Anda"
                              value={voterCode}
                              onChange={(e) => setVoterCode(e.target.value)}
                              className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 pr-10"
                              disabled={isSubmitting}
                            />
                            <Shield className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
                          </div>
                        </div>
                        <Button
                          type="submit"
                          className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white border-0"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Memproses...
                            </>
                          ) : (
                            "Verifikasi Kode Pemilih"
                          )}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            ) : null}

            <Card className="mb-6 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden">
              <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800">
                <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
                  <Vote className="mr-2 h-5 w-5 text-teal-600 dark:text-teal-500" />
                  Pilih Kandidat
                </CardTitle>
                <CardDescription className="dark:text-gray-400">
                  {voterVerified
                    ? "Pilih salah satu kandidat untuk memberikan suara Anda"
                    : "Verifikasi kode pemilih terlebih dahulu untuk memilih kandidat"}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {election?.candidates?.map((candidate) => (
                    <motion.div
                      key={candidate.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                    >
                      <CandidateCard
                        candidate={candidate}
                        isSelectable={voterVerified}
                        isSelected={selectedCandidate?.id === candidate.id}
                        onSelect={() => handleCandidateSelect(candidate)}
                      />
                    </motion.div>
                  ))}
                </div>

                {voterVerified && (
                  <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                    <Label
                      htmlFor="privateKey"
                      className="text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-2"
                    >
                      <KeyRound className="h-4 w-4 text-teal-600 dark:text-teal-500" />
                      Private Key
                    </Label>
                    <Input
                      id="privateKey"
                      placeholder="Masukkan private key Anda"
                      value={privateKey}
                      onChange={(e) => setPrivateKey(e.target.value)}
                      className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 font-mono"
                      required
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Private key didapat dari admin/panitia. Copy-paste persis
                      sesuai yang diberikan.
                    </p>
                  </div>
                )}

                {voterVerified && (
                  <div className="mt-8 text-center">
                    <Button
                      onClick={handleVoteSubmit}
                      disabled={
                        !selectedCandidate || !privateKey || isSubmitting
                      }
                      className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white border-0 px-8 py-6 text-lg"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Memproses...
                        </>
                      ) : (
                        "Tandatangani & Kirim Suara"
                      )}
                    </Button>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      Suara Anda akan dienkripsi dan ditandatangani secara
                      digital
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tabs Ringkasan & Hasil Pemilihan */}
            <Tabs defaultValue="overview" className="mb-6">
              <TabsList className="bg-gray-100 dark:bg-gray-800">
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-950 data-[state=active]:text-teal-700 dark:data-[state=active]:text-teal-500"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Ringkasan
                </TabsTrigger>
                <TabsTrigger
                  value="results"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-950 data-[state=active]:text-teal-700 dark:data-[state=active]:text-teal-500"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Hasil Pemilihan
                </TabsTrigger>
              </TabsList>
              <TabsContent value="overview">
                <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
                  <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800">
                    <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
                      <FileText className="mr-2 h-5 w-5 text-teal-600 dark:text-teal-500" />
                      Detail Pemilihan
                    </CardTitle>
                    <CardDescription className="dark:text-gray-400">
                      Informasi tentang pemilihan ini
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pt-6">
                    {election && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                              Judul Pemilihan
                            </h3>
                            <p className="text-gray-900 dark:text-gray-100 font-medium">
                              {election.title}
                            </p>
                          </div>

                          <div>
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                              Kode Pemilihan
                            </h3>
                            <p className="text-gray-900 dark:text-gray-100 font-medium font-mono">
                              {election.code}
                            </p>
                          </div>

                          <div>
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                              Tanggal Mulai
                            </h3>
                            <p className="text-gray-900 dark:text-gray-100 font-medium">
                              {new Date(election.start_time).toLocaleString(
                                "id-ID",
                                {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </p>
                          </div>

                          <div>
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                              Tanggal Berakhir
                            </h3>
                            <p className="text-gray-900 dark:text-gray-100 font-medium">
                              {new Date(election.end_time).toLocaleString(
                                "id-ID",
                                {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </p>
                          </div>

                          <div className="md:col-span-2">
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                              Deskripsi
                            </h3>
                            <p className="text-gray-900 dark:text-gray-100 whitespace-pre-line">
                              {election.description}
                            </p>
                          </div>
                        </div>

                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                          <div className="flex flex-col sm:flex-row justify-between items-center">
                            <div className="flex items-center mb-2 sm:mb-0">
                              <Users className="h-5 w-5 text-teal-600 dark:text-teal-500 mr-2" />
                              <div>
                                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  Total Pemilih
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400">
                                  {election.voters_count || 0} pemilih terdaftar
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center">
                              <div
                                className={`w-3 h-3 rounded-full mr-2 ${
                                  new Date() > new Date(election.end_time)
                                    ? "bg-gray-400 dark:bg-gray-500"
                                    : new Date() >=
                                      new Date(election.start_time)
                                    ? "bg-emerald-500 dark:bg-emerald-400"
                                    : "bg-amber-500 dark:bg-amber-400"
                                }`}
                              ></div>
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {new Date() > new Date(election.end_time)
                                  ? "Pemilihan Berakhir"
                                  : new Date() >= new Date(election.start_time)
                                  ? "Pemilihan Berjalan"
                                  : "Pemilihan Belum Dimulai"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Kandidat ({election.candidates.length})
                          </h3>
                          <div className="flex flex-wrap gap-3">
                            {election.candidates.map((candidate) => (
                              <div
                                key={candidate.id}
                                className="flex items-center bg-white dark:bg-gray-900 px-3 py-2 rounded-full border border-gray-200 dark:border-gray-800"
                              >
                                <div className="w-6 h-6 bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-900/30 dark:to-emerald-900/30 rounded-full mr-2 flex items-center justify-center text-xs text-teal-700 dark:text-teal-500 font-medium">
                                  {candidate.photo_url ? (
                                    <img
                                      src={candidate.photo_url}
                                      alt={candidate.name}
                                      className="w-full h-full rounded-full object-cover"
                                    />
                                  ) : (
                                    candidate.name.charAt(0)
                                  )}
                                </div>
                                <span className="text-sm text-gray-900 dark:text-gray-100">
                                  {candidate.name}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
             <TabsContent value="results">
  <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
    <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800">
      <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
        <BarChart3 className="mr-2 h-5 w-5 text-teal-600 dark:text-teal-500" />
        Hasil Pemilihan dari Blockchain
      </CardTitle>
      <CardDescription className="dark:text-gray-400">
        {new Date() <= new Date(election?.end_time || "") &&
        election?.showRealTimeResults === false
          ? "Hasil akan ditampilkan setelah pemilihan berakhir"
          : "Data suara yang tercatat di blockchain"}
      </CardDescription>
    </CardHeader>

    <CardContent className="pt-6">
      {election && (
        <>
          {election.showRealTimeResults !== false ||
          new Date() > new Date(election.end_time) ? (
            <div className="space-y-6">
              <div className="space-y-4">
                {election.candidates.map((candidate, index) => {
                  const votes = blockchainResults[candidate.id] || 0;
                  const totalVotes = Object.values(blockchainResults).reduce(
                    (sum, count) => sum + count,
                    0
                  );
                  const percentage =
                    totalVotes > 0
                      ? ((votes / totalVotes) * 100).toFixed(1)
                      : "0.0";
                      
                  // Calculate if this is the leading candidate    
                  const isLeading = 
                    totalVotes > 0 && 
                    votes === Math.max(...Object.values(blockchainResults));

                  return (
                    <motion.div
                      key={candidate.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={`p-3 rounded-lg ${
                        isLeading 
                          ? "bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 border border-teal-100 dark:border-teal-900/40"
                          : "bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-900/30 dark:to-emerald-900/30 rounded-full mr-3 flex items-center justify-center text-teal-700 dark:text-teal-500 font-medium border border-teal-100 dark:border-teal-900/50">
                            {candidate.photo_url ? (
                              <img
                                src={candidate.photo_url}
                                alt={candidate.name}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              candidate.name.charAt(0)
                            )}
                          </div>
                          <div>
                            <p className="text-gray-900 dark:text-gray-100 font-medium flex items-center">
                              {candidate.name}
                              {isLeading && votes > 0 && (
                                <ArrowUpCircle className="ml-1.5 h-4 w-4 text-teal-600 dark:text-teal-400" />
                              )}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                              {candidate.description
                                ? candidate.description.substring(0, 60) + "..."
                                : ""}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <Badge
                            variant={Number(percentage) > 50 ? "default" : "outline"}
                            className={
                              Number(percentage) > 50
                                ? "bg-gradient-to-r from-teal-600 to-emerald-600 text-white border-0"
                                : "text-teal-700 border-teal-200 dark:text-teal-400 dark:border-teal-900/40"
                            }
                          >
                            {votes} suara
                          </Badge>
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="flex items-center">
                          <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                isLeading
                                  ? "bg-gradient-to-r from-teal-600 to-emerald-600"
                                  : "bg-teal-500/70 dark:bg-teal-600/70"
                              }`}
                              style={{
                                width: `${percentage}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300 min-w-[42px] text-right ml-2">
                            {percentage}%
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-between mt-6">
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 flex-1">
                  <div className="flex items-center mb-1">
                    <BarChart3 className="h-4 w-4 text-teal-600 dark:text-teal-500 mr-2" />
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Total Suara Masuk
                    </p>
                  </div>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    {Object.values(blockchainResults).reduce(
                      (sum, count) => sum + count,
                      0
                    )}
                  </p>
                </div>
                
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 flex-1">
                  <div className="flex items-center mb-1">
                    <Users className="h-4 w-4 text-teal-600 dark:text-teal-500 mr-2" />
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Partisipasi
                    </p>
                  </div>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    {election.voters_count
                      ? `${(
                          (Object.values(blockchainResults).reduce(
                            (sum, count) => sum + count,
                            0
                          ) /
                            election.voters_count) *
                          100
                        ).toFixed(1)}%`
                      : "0.0%"}
                  </p>
                </div>
              </div>

              {/* Button to redirect to live count page */}
              <Button
                onClick={() => {
                  router.push(`/live-count?code=${election.code}`);
                }}
                className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white border-0 mt-4"
              >
                <BarChart3 className="mr-2 h-5 w-5" />
                Lihat Dashboard Live Count Lengkap
              </Button>
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <Lock className="h-8 w-8 text-gray-400 dark:text-gray-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Hasil Masih Disembunyikan
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
                Hasil pemilihan akan ditampilkan setelah periode
                pemilihan berakhir pada{" "}
                {new Date(election.end_time).toLocaleString(
                  "id-ID",
                  {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                )}
                .
              </p>

              <Button
                onClick={() => {
                  router.push(`/live-count?code=${election.code}`);
                }}
                className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white border-0"
              >
                <BarChart3 className="mr-2 h-5 w-5" />
                Lihat Live Count
              </Button>
            </div>
          )}
        </>
      )}
    </CardContent>
  </Card>
</TabsContent>
              <TabsContent value="results">
                <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
                  <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800">
                    <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
                      <BarChart3 className="mr-2 h-5 w-5 text-teal-600 dark:text-teal-500" />
                      Hasil Pemilihan dari Blockchain
                    </CardTitle>
                    <CardDescription className="dark:text-gray-400">
                      Data suara yang tercatat di blockchain
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pt-6">
                    {election && election.showRealTimeResults !== false ? (
                      <div className="space-y-6">
                        <div className="space-y-4">
                          {election.candidates
                            .slice(0, 3)
                            .map((candidate, index) => {
                              const votes =
                                blockchainResults[candidate.id] || 0;
                              const maxVotes = Math.max(
                                ...Object.values(blockchainResults),
                                1
                              );
                              const percentage =
                                maxVotes > 0 ? (votes / maxVotes) * 100 : 0;

                              return (
                                <div
                                  key={candidate.id}
                                  className="flex items-center justify-between"
                                >
                                  <div className="flex items-center">
                                    <div className="w-10 h-10 bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-900/30 dark:to-emerald-900/30 rounded-full mr-3 flex items-center justify-center text-teal-700 dark:text-teal-500 font-medium border border-teal-100 dark:border-teal-900/50">
                                      {candidate.photo_url ? (
                                        <img
                                          src={candidate.photo_url}
                                          alt={candidate.name}
                                          className="w-full h-full rounded-full object-cover"
                                        />
                                      ) : (
                                        candidate.name.charAt(0)
                                      )}
                                    </div>
                                    <span className="text-gray-900 dark:text-gray-100">
                                      {candidate.name ||
                                        `Kandidat #${index + 1}`}
                                    </span>
                                  </div>
                                  <div className="flex items-center">
                                    <div className="w-24 md:w-48 h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mr-3">
                                      <div
                                        className="h-full bg-gradient-to-r from-teal-600 to-emerald-600"
                                        style={{
                                          width: `${percentage}%`,
                                        }}
                                      ></div>
                                    </div>
                                    <span className="font-semibold text-gray-900 dark:text-gray-100 min-w-[80px] text-right">
                                      {votes} suara
                                    </span>
                                  </div>
                                </div>
                              );
                            })}

                          {election.candidates.length > 3 && (
                            <div className="text-center text-gray-500 dark:text-gray-400">
                              ...
                            </div>
                          )}
                        </div>

                        {/* Button to redirect to live count page */}
                        <div className="mt-6 text-center">
                          <Button
                            onClick={() => {
                              router.push(`/live-count?code=${election.code}`);
                            }}
                            className="w-full border-teal-200 text-teal-700 hover:bg-teal-50 hover:text-teal-800 dark:border-teal-900/30 dark:text-teal-500 dark:hover:bg-teal-900/20"
                            variant="outline"
                          >
                            Lihat Live Count Lengkap
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          <Lock className="h-8 w-8 text-gray-400 dark:text-gray-600" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                          Hasil Masih Disembunyikan
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                          Hasil pemilihan akan ditampilkan setelah periode
                          pemilihan berakhir.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
      </div>
    </div>
  );
}
