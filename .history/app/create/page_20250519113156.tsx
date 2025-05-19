"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
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
import { v2 as cloudinary } from "cloudinary";

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
    voterCodes: string[];
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
    generatedCodes.voterCodes.forEach((code, idx) => {
      doc.text(`Pemilih #${idx + 1}: ${code}`, 14, 52 + idx * 8);
    });

    doc.save("kode-pemilihan.pdf");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create a FormData object for the election
      const formData = new FormData();
      formData.append("title", electionData.title);
      formData.append("description", electionData.description);
      formData.append("start_time", electionData.start_time);
      formData.append("end_time", electionData.end_time);

      if (electionData.banner) {
        formData.append("banner", electionData.banner);
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

      // Add candidates
      const candidatesToAdd = electionData.candidates.map((candidate) => ({
        name: candidate.name,
        photo_url: candidate.photo
          ? URL.createObjectURL(candidate.photo)
          : undefined,
        description: candidate.description,
      }));

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
        setGeneratedCodes((prev) => ({
          ...prev,
          voterCodes: Array.isArray(votersResult.data)
            ? votersResult.data.map((v) => v.code)
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
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Link href="/" className="inline-block mb-6">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Beranda
          </Button>
        </Link>

        {/* Tabs Ringkasan & Hasil Pemilihan dipindah ke atas */}
        <Tabs defaultValue="overview" className="mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Ringkasan</TabsTrigger>
            <TabsTrigger value="results">Hasil Pemilihan</TabsTrigger>
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
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">
                  Hasil Pemilihan Real-time
                </h3>
                {electionData.showRealTimeResults ? (
                  <div className="space-y-4">
                    {electionData.candidates.map((candidate, index) => (
                      <div
                        key={index}
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
                                width: `${Math.floor(Math.random() * 100)}%`,
                              }}
                            ></div>
                          </div>
                          <span className="font-semibold">
                            {Math.floor(Math.random() * 100)} suara
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

                <h3 className="text-lg font-semibold mt-8 mb-4">
                  Status Pemilih
                </h3>
                <div className="border rounded-md overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          No.
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Pemilih
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {generatedCodes.voterCodes.map((code, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            Pemilih #{index + 1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                              Belum Memilih
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Card kode pemilihan & kode pemilih */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold mb-4 text-center">
              Pemilihan Berhasil Dibuat!
            </h2>
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
              <div className="mb-4">
                <Label className="text-sm text-gray-500">Kode Pemilihan</Label>
                <div className="text-2xl font-mono font-bold text-center p-3 bg-white border rounded-md">
                  {generatedCodes.electionCode}
                </div>
                <p className="text-sm text-gray-500 mt-1 text-center">
                  Bagikan kode ini kepada pemilih untuk mengakses pemilihan
                </p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Kode Pemilih</Label>
                <div className="max-h-40 overflow-y-auto p-3 bg-white border rounded-md">
                  <ul className="space-y-2">
                    {generatedCodes.voterCodes.map((code, index) => (
                      <li
                        key={index}
                        className="font-mono flex justify-between"
                      >
                        <span>Pemilih #{index + 1}</span>
                        <span className="font-bold">{code}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex justify-center mt-4">
                  <Button variant="outline" size="sm" onClick={handleExportPDF}>
                    <Upload className="mr-2 h-4 w-4" />
                    Ekspor sebagai PDF
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
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

      <h1 className="text-3xl font-bold mb-6">Create Your Election</h1>

      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Nama Pemilihan</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Contoh: Pemilihan Ketua Organisasi 2025"
                  value={electionData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="banner">Banner Pemilihan</Label>
                <div className="mt-1">
                  {electionData.banner ? (
                    <div className="relative w-full h-48 mb-3 rounded-lg overflow-hidden">
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
                    <div className="w-full h-48 mb-3 bg-gray-100 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-gray-300">
                      <ImageIcon className="h-10 w-10 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">
                        Upload banner pemilihan
                      </p>
                      <p className="text-xs text-gray-400">
                        Rekomendasi: 1200 x 400 piksel
                      </p>
                    </div>
                  )}
                  <Input
                    id="banner"
                    type="file"
                    accept="image/*"
                    onChange={handleBannerUpload}
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Banner akan ditampilkan di halaman pemilihan untuk menarik
                    perhatian pemilih.
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Jelaskan tentang pemilihan ini"
                  value={electionData.description}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_time">Tanggal Mulai</Label>
                  <div className="relative">
                    <Input
                      id="start_time"
                      name="start_time"
                      type="datetime-local"
                      value={electionData.start_time}
                      onChange={handleInputChange}
                      required
                    />
                    <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-gray-500" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="end_time">Tanggal Selesai</Label>
                  <div className="relative">
                    <Input
                      id="end_time"
                      name="end_time"
                      type="datetime-local"
                      value={electionData.end_time}
                      onChange={handleInputChange}
                      required
                    />
                    <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-gray-500" />
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="showRealTimeResults"
                    className="text-sm font-medium"
                  >
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
                          ? "bg-emerald-500"
                          : "bg-gray-300"
                      }`}
                    ></div>
                    <div
                      className={`dot absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition transform ${
                        electionData.showRealTimeResults ? "translate-x-4" : ""
                      }`}
                    ></div>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {electionData.showRealTimeResults
                    ? "Hasil pemilihan akan ditampilkan secara real-time selama pemilihan berlangsung."
                    : "Hasil pemilihan akan disembunyikan hingga periode pemilihan berakhir."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <h2 className="text-xl font-bold mb-4">Daftar Kandidat</h2>

        {electionData.candidates.map((candidate, index) => (
          <Card key={index} className="mb-4">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Kandidat #{index + 1}</h3>
                {electionData.candidates.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCandidate(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor={`candidate-name-${index}`}>
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
                  />
                </div>

                <div>
                  <Label htmlFor={`candidate-photo-${index}`}>
                    Foto Kandidat
                  </Label>
                  <div className="flex items-center mt-1">
                    <div className="w-20 h-20 bg-gray-200 rounded-md flex items-center justify-center mr-4">
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
                        <Upload className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                    <Input
                      id={`candidate-photo-${index}`}
                      type="file"
                      accept="image/*"
                      className="flex-1"
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
                  <Label htmlFor={`candidate-description-${index}`}>
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
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <Button
          type="button"
          variant="outline"
          className="w-full mb-6"
          onClick={addCandidate}
        >
          <Plus className="mr-2 h-4 w-4" />
          Tambah Kandidat
        </Button>

        <h2 className="text-xl font-bold mb-4">Daftar Pemilih</h2>
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="voters">Daftar Pemilih</Label>
                <Textarea
                  id="voters"
                  placeholder="Masukkan daftar pemilih (satu per baris)"
                  className="min-h-[150px]"
                  onChange={handleVoterInput}
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Format: Nama/Email (satu per baris)
                </p>
              </div>

              <div className="flex justify-center">
                <span className="text-sm text-gray-500">atau</span>
              </div>

              <Button type="button" variant="outline" className="w-full">
                <Upload className="mr-2 h-4 w-4" />
                Upload File CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            className="px-8 py-6 text-lg bg-emerald-600 hover:bg-emerald-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memproses...
              </>
            ) : (
              "Buat Pemilihan"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
