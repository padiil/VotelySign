import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"

interface ElectionDetailsProps {
  election: {
    banner?: File | string;
    name?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    candidates?: any[];
    voters?: any[];
    showRealTimeResults?: boolean;
  };
}

export default function ElectionDetails({ election }: ElectionDetailsProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-lg font-semibold mb-4">Detail Pemilihan</h3>

        {election.banner && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Banner Pemilihan</h4>
            <div className="relative w-full h-32 rounded-md overflow-hidden">
              <Image
                src={URL.createObjectURL(election.banner) || "/placeholder.svg"}
                alt="Banner pemilihan"
                fill
                className="object-cover"
              />
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-500">Nama Pemilihan</h4>
            <p>{election.name || "Belum diisi"}</p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">Deskripsi</h4>
            <p>{election.description || "Belum diisi"}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Tanggal Mulai</h4>
              <p>{election.startDate || "Belum diisi"}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500">Tanggal Selesai</h4>
              <p>{election.endDate || "Belum diisi"}</p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">Jumlah Kandidat</h4>
            <p>{election.candidates?.length || 0} kandidat</p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">Jumlah Pemilih</h4>
            <p>{election.voters?.length || 0} pemilih</p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">Tampilkan Hasil Real-time</h4>
            <p>{election.showRealTimeResults ? "Ya" : "Tidak, hasil akan ditampilkan setelah pemilihan berakhir"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
