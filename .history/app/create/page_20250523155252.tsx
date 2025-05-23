"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Calendar,
  Loader2,
  Plus,
  Trash2,
  Upload,
  Lock,
  ImageIcon,
  FileText,
  Users,
  Vote,
  Info,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ElectionDetails from "@/components/election-details";
import Image from "next/image";
import {
  createElection,
  addCandidates,
  addVoters,
} from "@/actions/election-actions";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import type { Election } from "@/types";
import { jsPDF } from "jspdf";
import { uploadToCloudinary } from "@/utils/cloudinary";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function CreateElectionPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [electionCreated, setElectionCreated] = useState(false);
  const [electionData, setElectionData] = useState<{
    title: string;
    description: string;
    start_time: string;
    end_time: string;
    voters: string[];
    candidates: {
      id: number;
      name: string;
      photo: File | null;
      description: string;
    }[];
    showRealTimeResults: boolean;
    banner: File | null;
  }>({
    title: "",
    description: "",
    start_time: "",
    end_time: "",
    voters: [],
    candidates: [{ id: 1, name: "", photo: null, description: "" }],
    showRealTimeResults: true,
    banner: null,
  });

  const [createdElection, setCreatedElection] = useState<Election | null>(null);
  const [generatedCodes, setGeneratedCodes] = useState<{
    electionCode: string;
    voterCodes: { code: string; privateKey: string }[];
  }>({
    electionCode: "",
    voterCodes: [],
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setElectionData({
      ...electionData,
      [name]: value,
    });
  };

  const handleCandidateChange = (index: number, field: string, value: any) => {
    const updatedCandidates = [...electionData.candidates];
    updatedCandidates[index] = {
      ...updatedCandidates[index],
      [field]: value,
    };
    setElectionData({
      ...electionData,
      candidates: updatedCandidates,
    });
  };

  const addCandidate = () => {
    setElectionData({
      ...electionData,
      candidates: [
        ...electionData.candidates,
        {
          id: electionData.candidates.length + 1,
          name: "",
          photo: null,
          description: "",
        },
      ],
    });
  };

  const removeCandidate = (index: number) => {
    const updatedCandidates = [...electionData.candidates];
    updatedCandidates.splice(index, 1);
    setElectionData({
      ...electionData,
      candidates: updatedCandidates,
    });
  };

  const handleVoterInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const voterList = e.target.value
      .split("\n")
      .filter((voter) => voter.trim() !== "");
    setElectionData({
      ...electionData,
      voters: voterList,
    });
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setElectionData({
        ...electionData,
        banner: e.target.files[0],
      });
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Kode Pemilihan", 14, 18);
    doc.setFontSize(14);
    doc.text(generatedCodes.electionCode, 14, 28);

    doc.setFontSize(16);
    doc.text("Daftar Kode Pemilih:", 14, 42);

    doc.setFontSize(12);
    generatedCodes.voterCodes.forEach((v, idx) => {
      doc.text(`Pemilih #${idx + 1}: Kode: ${v.code}`, 14, 52 + idx * 12);
      doc.text(`Private Key: ${v.privateKey}`, 14, 58 + idx * 12);
    });

    doc.save("kode-pemilihan.pdf");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Upload banner to Cloudinary if exists
      let bannerUrl = null;
      if (electionData.banner) {
        bannerUrl = await uploadToCloudinary(electionData.banner, "banner");
      }

      // Create a FormData object for the election
      const formData = new FormData();
      formData.append("title", electionData.title);
      formData.append("description", electionData.description);
      formData.append("start_time", electionData.start_time);
      formData.append("end_time", electionData.end_time);
      formData.append(
        "showRealTimeResults",
        String(electionData.showRealTimeResults)
      );

      // Add banner URL instead of file
      if (bannerUrl) {
        formData.append("banner_url", bannerUrl);
      }

      // Create the election
      const electionResult = await createElection(formData);

      if (!electionResult.success) {
        toast({
          title: "Error",
          description: electionResult.error,
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      const election = electionResult.data;
      if (!election) {
        toast({
          title: "Error",
          description: "Election data is missing from the response.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      setCreatedElection(election);
      setGeneratedCodes((prev) => ({
        ...prev,
        electionCode: election.code,
      }));

      // Upload candidate photos and add candidates
      const candidatesToAdd = await Promise.all(
        electionData.candidates.map(async (candidate) => {
          let photoUrl = undefined;

          if (candidate.photo) {
            photoUrl = await uploadToCloudinary(candidate.photo, "candidate");
          }

          return {
            name: candidate.name,
            photo_url: photoUrl,
            description: candidate.description,
          };
        })
      );

      const candidatesResult = await addCandidates(
        election.id,
        candidatesToAdd
      );

      if (!candidatesResult.success) {
        toast({
          title: "Warning",
          description:
            "Election created but failed to add candidates: " +
            candidatesResult.error,
        });
      }

      // Add voters
      const votersResult = await addVoters(
        election.id,
        electionData.voters.length || 5
      );

      if (!votersResult.success) {
        toast({
          title: "Warning",
          description:
            "Election created but failed to add voters: " + votersResult.error,
        });
      } else {
        // votersResult.data sudah array of { code, privateKey }
        setGeneratedCodes((prev) => ({
          ...prev,
          voterCodes: Array.isArray(votersResult.data)
            ? votersResult.data
            : [],
        }));
      }

      setElectionCreated(true);
    } catch (error) {
      console.error("Error creating election:", error);
      toast({
        title: "Error",
        description: "Failed to create election. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (electionCreated) {
    return (
      <div className="container py-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link href="/" className="inline-block mb-6">
            <Button variant="ghost" size="sm" className="text-teal-700 hover:text-teal-800 hover:bg-teal-50 dark:text-teal-500 dark:hover:bg-teal-950/50">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Beranda
            </Button>
          </Link>

          <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-teal-700 to-emerald-600 bg-clip-text text-transparent dark:from-teal-500 dark:to-emerald-400">
            Pemilihan Berhasil Dibuat
          </h1>

          {/* Tabs Ringkasan & Hasil Pemilihan */}
          <Tabs defaultValue="overview" className="mb-6">
            <TabsList className="bg-gray-100 dark:bg-gray-800">
              <TabsTrigger value="overview" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-950 data-[state=active]:text-teal-700 dark:data-[state=active]:text-teal-500">
                <FileText className="w-4 h-4 mr-2" />
                Ringkasan
              </TabsTrigger>
              <TabsTrigger value="results" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-950 data-[state=active]:text-teal-700 dark:data-[state=active]:text-teal-500">
                <BarChart3 className="w-4 h-4 mr-2" />
                Hasil Pemilihan
              </TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              <ElectionDetails
                election={{
                  ...electionData,
                  banner: electionData.banner ?? undefined,
                }}
              />
            </TabsContent>
            <TabsContent value="results">
              <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
                <CardHeader>
                  <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
                    <BarChart3 className="mr-2 h-5 w-5 text-teal-600 dark:text-teal-500" />
                    Hasil Pemilihan Real-time
                  </CardTitle>
                  <CardDescription className="dark:text-gray-400">
                    Visualisasi perolehan suara kandidat
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {electionData.showRealTimeResults ? (
                    <div className="space-y-4">
                      {electionData.candidates.map((candidate, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full mr-3 flex items-center justify-center">
                              {candidate.photo ? (
                                <img 
                                  src={URL.createObjectURL(candidate.photo)} 
                                  alt={candidate.name || `Kandidat #${index + 1}`} 
                                  className="h-full w-full rounded-full object-cover" 
                                />
                              ) : (
                                <span className="text-gray-500 dark:text-gray-400 font-medium">
                                  {(candidate.name || `K${index + 1}`).charAt(0)}
                                </span>
                              )}
                            </div>
                            <span className="text-gray-900 dark:text-gray-100">
                              {candidate.name || `Kandidat #${index + 1}`}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-48 h-4 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mr-3">
                              <div
                                className="h-full bg-gradient-to-r from-teal-600 to-emerald-600"
                                style={{
                                  width: `${Math.floor(Math.random() * 100)}%`,
                                }}
                              ></div>
                            </div>
                            <span className="font-semibold text-gray-900 dark:text-gray-100">
                              {Math.floor(Math.random() * 100)} suara
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Lock className="mx-auto h-10 w-10 text-gray-400 dark:text-gray-600 mb-3" />
                      <p className="text-gray-600 dark:text-gray-400">
                        Hasil pemilihan akan disembunyikan hingga periode
                        pemilihan berakhir.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Card kode pemilihan & kode pemilih */}
          <Card className="mb-6 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden">
            <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800">
              <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
                <Vote className="mr-2 h-5 w-5 text-teal-600 dark:text-teal-500" />
                Kode Akses Pemilihan
              </CardTitle>
              <CardDescription className="dark:text-gray-400">
                Kode berikut diperlukan untuk mengakses pemilihan
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                <div className="mb-6">
                  <Label className="text-sm text-gray-500 dark:text-gray-400">Kode Pemilihan</Label>
                  <div className="text-2xl font-mono font-bold text-center p-3 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-md text-teal-700 dark:text-teal-500">
                    {generatedCodes.electionCode}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
                    Bagikan kode ini kepada pemilih untuk mengakses pemilihan
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      Kode & Private Key Pemilih
                    </div>
                  </Label>
                  <div className="max-h-48 overflow-y-auto p-3 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-md mt-2">
                    <ul className="space-y-3">
                      {generatedCodes.voterCodes.map((v, index) => (
                        <li
                          key={index}
                          className="font-mono text-sm flex flex-col md:flex-row md:justify-between bg-gray-50 dark:bg-gray-900 p-2 rounded-md"
                        >
                          <span className="text-gray-500 dark:text-gray-400">Pemilih #{index + 1}</span>
                          <span className="font-bold text-gray-900 dark:text-gray-100">Kode: {v.code}</span>
                          <span className="font-bold text-xs break-all text-teal-700 dark:text-teal-500">
                            Private Key: {v.privateKey}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex justify-center mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportPDF}
                      className="border-teal-200 text-teal-700 hover:bg-teal-50 hover:text-teal-800 dark:border-teal-900/30 dark:text-teal-500 dark:hover:bg-teal-900/20"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Ekspor sebagai PDF
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  variant="default"
                  className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white border-0 w-full sm:w-auto"
                  onClick={() => router.push(`/live-count?code=${generatedCodes.electionCode}`)}
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Lihat Live Count
                </Button>
                <Button
                  variant="outline"
                  className="w-full sm:w-auto border-gray-200 dark:border-gray-800"
                  onClick={() => router.push("/")}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Kembali ke Beranda
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Link href="/" className="inline-block mb-6">
          <Button variant="ghost" size="sm" className="text-teal-700 hover:text-teal-800 hover:bg-teal-50 dark:text-teal-500 dark:hover:bg-teal-950/50">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
        </Link>

        <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-teal-700 to-emerald-600 bg-clip-text text-transparent dark:from-teal-500 dark:to-emerald-400">
          Buat Pemilihan Baru
        </h1>

        <form onSubmit={handleSubmit}>
          <Card className="mb-6 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden">
            <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800">
              <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
                <FileText className="mr-2 h-5 w-5 text-teal-600 dark:text-teal-500" />
                Informasi Pemilihan
              </CardTitle>
              <CardDescription className="dark:text-gray-400">
                Isikan detil dasar pemilihan yang akan dibuat
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="title" className="text-gray-700 dark:text-gray-300">
                    Nama Pemilihan
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Contoh: Pemilihan Ketua Organisasi 2025"
                    value={electionData.title}
                    onChange={handleInputChange}
                    required
                    className="mt-1.5 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
                  />
                </div>

                <div>
                  <Label htmlFor="banner" className="text-gray-700 dark:text-gray-300">
                    Banner Pemilihan
                  </Label>
                  <div className="mt-1.5">
                    {electionData.banner ? (
                      <div className="relative w-full h-48 mb-3 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800">
                        <Image
                          src={
                            URL.createObjectURL(electionData.banner) ||
                            "/placeholder.svg"
                          }
                          alt="Preview banner"
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-48 mb-3 bg-gray-50 dark:bg-gray-900 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-800">
                        <ImageIcon className="h-10 w-10 text-gray-400 dark:text-gray-600 mb-2" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Upload banner pemilihan
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          Rekomendasi: 1200 x 400 piksel
                        </p>
                      </div>
                    )}
                    <Input
                      id="banner"
                      type="file"
                      accept="image/*"
                      onChange={handleBannerUpload}
                      className="mt-2 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Banner akan ditampilkan di halaman pemilihan untuk menarik
                      perhatian pemilih.
                    </p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description" className="text-gray-700 dark:text-gray-300">
                    Deskripsi
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Jelaskan tentang pemilihan ini"
                    value={electionData.description}
                    onChange={handleInputChange}
                    required
                    className="mt-1.5 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 min-h-[100px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="start_time" className="text-gray-700 dark:text-gray-300">
                      Tanggal Mulai
                    </Label>
                    <div className="relative mt-1.5">
                      <Input
                        id="start_time"
                        name="start_time"
                        type="datetime-local"
                        value={electionData.start_time}
                        onChange={handleInputChange}
                        required
                        className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
                      />
                      <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="end_time" className="text-gray-700 dark:text-gray-300">
                      Tanggal Selesai
                    </Label>
                    <div className="relative mt-1.5">
                      <Input
                        id="end_time"
                        name="end_time"
                        type="datetime-local"
                        value={electionData.end_time}
                        onChange={handleInputChange}
                        required
                        className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
                      />
                      <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                    </div>
                  </div>
                </div>
                <div className="mt-4 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="showRealTimeResults"
                      className="text-gray-700 dark:text-gray-300 flex items-center gap-2"
                    >
                      <Info className="h-4 w-4 text-teal-600 dark:text-teal-500" />
                      Tampilkan Hasil Secara Real-time
                    </Label>
                    <div className="relative inline-flex items-center">
                      <input
                        type="checkbox"
                        id="showRealTimeResults"
                        name="showRealTimeResults"
                        className="sr-only"
                        checked={electionData.showRealTimeResults}
                        onChange={(e) => {
                          setElectionData({
                            ...electionData,
                            showRealTimeResults: e.target.checked,
                          });
                        }}
                      />
                      <div
                        className={`block h-6 w-10 rounded-full transition ${
                          electionData.showRealTimeResults
                            ? "bg-gradient-to-r from-teal-600 to-emerald-600"
                            : "bg-gray-300 dark:bg-gray-700"
                        }`}
                      ></div>
                      <div
                        className={`dot absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition transform ${
                          electionData.showRealTimeResults ? "translate-x-4" : ""
                        }`}
                      ></div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    {electionData.showRealTimeResults
                      ? "Hasil pemilihan akan ditampilkan secara real-time selama pemilihan berlangsung."
                      : "Hasil pemilihan akan disembunyikan hingga periode pemilihan berakhir."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden">
            <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800">
              <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
                <Vote className="mr-2 h-5 w-5 text-teal-600 dark:text-teal-500" />
                Daftar Kandidat
              </CardTitle>
              <CardDescription className="dark:text-gray-400">
                Tambahkan data kandidat yang akan dipilih
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {electionData.candidates.map((candidate, index) => (
                <motion.div
                  key={candidate.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className={cn(
                    "p-4 mb-4 rounded-lg border",
                    index === 0 
                      ? "bg-teal-50 border-teal-200 dark:bg-teal-900/10 dark:border-teal-900/30" 
                      : "bg-gray-50 border-gray-200 dark:bg-gray-900 dark:border-gray-800"
                  )}>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold flex items-center text-gray-900 dark:text-gray-100">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-500 text-sm font-bold mr-2">
                          {index + 1}
                        </span>
                        Kandidat #{index + 1}
                      </h3>
                      {electionData.candidates.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCandidate(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-500 dark:hover:bg-red-950/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor={`candidate-name-${index}`} className="text-gray-700 dark:text-gray-300">
                          Nama Kandidat
                        </Label>
                        <Input
                          id={`candidate-name-${index}`}
                          placeholder="Nama lengkap kandidat"
                          value={candidate.name}
                          onChange={(e) =>
                            handleCandidateChange(index, "name", e.target.value)
                          }
                          required
                          className="mt-1.5 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
                        />
                      </div>

                      <div>
                        <Label htmlFor={`candidate-photo-${index}`} className="text-gray-700 dark:text-gray-300">
                          Foto Kandidat
                        </Label>
                        <div className="flex items-center mt-1.5">
                          <div className="w-24 h-24 bg-white dark:bg-gray-900 rounded-md flex items-center justify-center mr-4 border border-gray-200 dark:border-gray-800 overflow-hidden">
                            {candidate.photo ? (
                              <img
                                src={
                                  URL.createObjectURL(candidate.photo) ||
                                  "/placeholder.svg"
                                }
                                alt={candidate.name}
                                className="w-full h-full object-cover rounded-md"
                              />
                            ) : (
                              <Upload className="h-6 w-6 text-gray-400 dark:text-gray-600" />
                            )}
                          </div>
                          <Input
                            id={`candidate-photo-${index}`}
                            type="file"
                            accept="image/*"
                            className="flex-1 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleCandidateChange(
                                  index,
                                  "photo",
                                  e.target.files[0]
                                );
                              }
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor={`candidate-description-${index}`} className="text-gray-700 dark:text-gray-300">
                          Visi & Misi
                        </Label>
                        <Textarea
                          id={`candidate-description-${index}`}
                          placeholder="Jelaskan visi dan misi kandidat"
                          value={candidate.description}
                          onChange={(e) =>
                            handleCandidateChange(
                              index,
                              "description",
                              e.target.value
                            )
                          }
                          required
                          className="mt-1.5 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 min-h-[80px]"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              <Button
                type="button"
                variant="outline"
                className="w-full mt-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-teal-300 hover:bg-teal-50 dark:hover:border-teal-800 dark:hover:bg-teal-900/20 text-gray-600 dark:text-gray-400 hover:text-teal-700 dark:hover:text-teal-500"
                onClick={addCandidate}
              >
                <Plus className="mr-2 h-4 w-4" />
                Tambah Kandidat
              </Button>
            </CardContent>
          </Card>

          <Card className="mb-6 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden">
            <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800">
              <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
                <Users className="mr-2 h-5 w-5 text-teal-600 dark:text-teal-500" />
                Daftar Pemilih
              </CardTitle>
              <CardDescription className="dark:text-gray-400">
                Tambahkan data pemilih yang dapat mengakses pemilihan
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="voters" className="text-gray-700 dark:text-gray-300">
                    Daftar Pemilih
                  </Label>
                  <Textarea
                    id="voters"
                    placeholder="Masukkan daftar pemilih (satu per baris)"
                    className="mt-1.5 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 min-h-[150px]"
                    onChange={handleVoterInput}
                    required
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 flex items-center">
                    <Info className="h-4 w-4 mr-1 text-teal-600 dark:text-teal-500" />
                    Format: Nama/Email (satu per baris)
                  </p>
                </div>

                <div className="flex items-center my-4">
                  <div className="flex-grow h-px bg-gray-200 dark:bg-gray-800"></div>
                  <span className="px-3 text-sm text-gray-500 dark:text-gray-400">atau</span>
                  <div className="flex-grow h-px bg-gray-200 dark:bg-gray-800"></div>
                </div>

                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload File CSV
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              type="submit"
              className="px-8 py-6 text-lg bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Memproses...
                </>
              ) : (
                "Buat Pemilihan"
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}