"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, Vote, Plus } from "lucide-react";
import { useTheme } from "next-themes";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();

  // Handle hydration mismatch with SSR
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="w-full bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="container pt-16 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full text-center"
        >
          <div className="mb-12 flex flex-col items-center">
            <div className="mb-6 w-20 h-20 flex items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800">
              <Vote className="h-10 w-10 text-white" />
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4">
              <span className="bg-gradient-to-r from-teal-700 to-emerald-600 bg-clip-text text-transparent dark:from-teal-500 dark:to-emerald-400">
                Votely
              </span>
              <span className="text-gray-900 dark:text-gray-100">Sign</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Platform pemilu digital dengan verifikasi blockchain untuk hasil
              yang transparan dan aman
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Link href="/vote" className="w-full">
              <motion.div
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="h-full"
              >
                <Button className="w-full h-28 bg-gradient-to-r from-teal-700/90 to-teal-700 hover:from-teal-800 hover:to-teal-700 dark:from-teal-700 dark:to-teal-600 dark:hover:from-teal-600 dark:hover:to-teal-500 rounded-xl shadow-sm transition-all flex flex-col items-center justify-center p-6">
                  <Vote className="h-6 w-6 mb-2" />
                  <span className="text-lg font-semibold">Vote</span>
                  <span className="text-xs mt-1 font-normal text-teal-100">
                    Berikan suara Anda
                  </span>
                  <ArrowRight className="h-4 w-4 absolute right-4 opacity-70" />
                </Button>
              </motion.div>
            </Link>

            <Link href="/live-count" className="w-full">
              <motion.div
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="h-full"
              >
                <Button
                  variant="secondary"
                  className="w-full h-28 bg-gradient-to-r from-emerald-100 to-teal-100 hover:from-emerald-200 hover:to-teal-200 text-emerald-800 dark:from-emerald-900/30 dark:to-teal-900/30 dark:text-emerald-400 dark:hover:from-emerald-900/50 dark:hover:to-teal-900/50 rounded-xl shadow-sm transition-all flex flex-col items-center justify-center p-6"
                >
                  <BarChart3 className="h-6 w-6 mb-2" />
                  <span className="text-lg font-semibold">Live Count</span>
                  <span className="text-xs mt-1 font-normal">
                    Pantau hasil pemilihan
                  </span>
                  <ArrowRight className="h-4 w-4 absolute right-4 opacity-70" />
                </Button>
              </motion.div>
            </Link>

            <Link href="/create" className="w-full">
              <motion.div
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="h-full"
              >
                <Button
                  variant="outline"
                  className="w-full h-28 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-teal-200 dark:hover:border-teal-900/50 hover:bg-gray-50 dark:hover:bg-gray-900/80 text-gray-900 dark:text-gray-100 rounded-xl shadow-sm transition-all flex flex-col items-center justify-center p-6"
                >
                  <Plus className="h-6 w-6 mb-2 text-teal-700 dark:text-teal-500" />
                  <span className="text-lg font-semibold">Buat Pemilihan</span>
                  <span className="text-xs mt-1 font-normal text-gray-500 dark:text-gray-400">
                    Atur pemilihan Anda sendiri
                  </span>
                  <ArrowRight className="h-4 w-4 absolute right-4 opacity-70 text-teal-700 dark:text-teal-500" />
                </Button>
              </motion.div>
            </Link>
          </div>

          <div className="mt-24">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-12 text-gray-900 dark:text-gray-100">
                Fitur{" "}
                <span className="bg-gradient-to-r from-teal-700 to-emerald-600 bg-clip-text text-transparent dark:from-teal-500 dark:to-emerald-400">
                  Utama
                </span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {/* Feature 1 */}
                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 rounded-full mb-4 flex items-center justify-center">
                    <Vote className="h-6 w-6 text-teal-700 dark:text-teal-500" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
                    Voting Aman
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 flex-1">
                    Proses pemilihan terenkripsi dan terverifikasi dengan
                    teknologi blockchain
                  </p>
                </div>

                {/* Feature 2 */}
                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 rounded-full mb-4 flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-teal-700 dark:text-teal-500" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
                    Live Count
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 flex-1">
                    Pantau hasil pemilihan secara real-time dengan visualisasi
                    yang interaktif
                  </p>
                </div>

                {/* Feature 3 */}
                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 rounded-full mb-4 flex items-center justify-center">
                    <Plus className="h-6 w-6 text-teal-700 dark:text-teal-500" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
                    Mudah Dibuat
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 flex-1">
                    Buat dan kelola pemilihan Anda sendiri dengan antarmuka yang
                    intuitif
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="mt-24">
            <Link href="/vote">
              <Button
                size="lg"
                className="bg-gradient-to-r from-teal-700 to-emerald-600 hover:from-teal-800 hover:to-emerald-700 text-white border-0"
              >
                Mulai Gunakan VotelySign
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Footer Banner */}
      <div className="w-full bg-gradient-to-r from-teal-700 to-emerald-600 dark:from-teal-800 dark:to-emerald-700">
        <div className="container py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-white text-center md:text-left">
              <h3 className="text-lg font-semibold">
                Siap untuk pemilihan yang lebih transparan?
              </h3>
              <p className="text-teal-100 mt-1">
                Buat pemilihan pertama Anda sekarang, gratis!
              </p>
            </div>

            <div className="flex gap-4">
              <Link href="/vote">
                <Button
                  variant="default"
                  size="sm"
                  className="bg-white text-teal-700 hover:bg-teal-50"
                >
                  <Vote className="mr-2 h-4 w-4" />
                  Voting
                </Button>
              </Link>

              <Link href="/create">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white text-white hover:bg-white/20"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Buat Pemilihan
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
