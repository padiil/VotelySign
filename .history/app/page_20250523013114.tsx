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

        
            
            </Link>
          </div>
        </motion.div>
      </div>
      
    
    </div>
  );
}