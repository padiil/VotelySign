import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { Calendar, Users, UserCheck, Eye, EyeOff } from "lucide-react";

interface Election {
  banner?: File | string;
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  candidates?: any[];
  voters?: any[];
  showRealTimeResults?: boolean;
}

export default function ElectionDetails({ election }: { election: Election }) {
  return (
    <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden">
      <CardContent className="pt-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Detail Pemilihan
        </h3>

        {election.banner && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Banner Pemilihan
            </h4>
            <div className="relative w-full h-40 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <Image
                src={
                  typeof election.banner === "string"
                    ? election.banner
                    : election.banner
                    ? URL.createObjectURL(election.banner)
                    : "/placeholder.svg"
                }
                alt="Banner pemilihan"
                fill
                className="object-cover"
              />
            </div>
          </div>
        )}

        <div className="space-y-5">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-md p-3">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Nama Pemilihan
            </h4>
            <p className="text-gray-900 dark:text-gray-100 font-medium">
              {election.name || "Belum diisi"}
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900 rounded-md p-3">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Deskripsi
            </h4>
            <p className="text-gray-700 dark:text-gray-300">
              {election.description || "Belum diisi"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-2 bg-gray-50 dark:bg-gray-900 rounded-md p-3">
              <Calendar className="h-5 w-5 text-teal-600 dark:text-teal-500 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Tanggal Mulai
                </h4>
                <p className="text-gray-900 dark:text-gray-100">
                  {election.startDate || "Belum diisi"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2 bg-gray-50 dark:bg-gray-900 rounded-md p-3">
              <Calendar className="h-5 w-5 text-teal-600 dark:text-teal-500 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Tanggal Selesai
                </h4>
                <p className="text-gray-900 dark:text-gray-100">
                  {election.endDate || "Belum diisi"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2 bg-gray-50 dark:bg-gray-900 rounded-md p-3">
            <Users className="h-5 w-5 text-teal-600 dark:text-teal-500 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Jumlah Kandidat
              </h4>
              <p className="text-gray-900 dark:text-gray-100">
                <span className="font-semibold text-emerald-600 dark:text-emerald-500">
                  {election.candidates?.length || 0}
                </span>{" "}
                kandidat
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2 bg-gray-50 dark:bg-gray-900 rounded-md p-3">
            <UserCheck className="h-5 w-5 text-teal-600 dark:text-teal-500 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Jumlah Pemilih
              </h4>
              <p className="text-gray-900 dark:text-gray-100">
                <span className="font-semibold text-emerald-600 dark:text-emerald-500">
                  {election.voters?.length || 0}
                </span>{" "}
                pemilih
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2 bg-gray-50 dark:bg-gray-900 rounded-md p-3">
            {election.showRealTimeResults ? (
              <Eye className="h-5 w-5 text-teal-600 dark:text-teal-500 mt-0.5" />
            ) : (
              <EyeOff className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5" />
            )}
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Tampilkan Hasil Real-time
              </h4>
              <p className="text-gray-900 dark:text-gray-100">
                {election.showRealTimeResults
                  ? "Ya, hasil pemilihan dapat dilihat secara real-time"
                  : "Tidak, hasil akan ditampilkan setelah pemilihan berakhir"}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
