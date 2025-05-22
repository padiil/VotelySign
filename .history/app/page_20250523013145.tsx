"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, Vote, Plus, Home } from "lucide-react";
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
              Platform pemilu digital dengan verifikasi blockchain untuk hasil yang transparan dan aman
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
           
          </div>
          
          <div className="mt-24">
            <Link href="/vote">
            
            </Link>
          </div>
        </motion.div>
      </div>
      
    
    </div>
  );
}