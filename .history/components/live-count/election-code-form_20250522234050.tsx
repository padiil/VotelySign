"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, LockKeyhole } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";

interface ElectionCodeFormProps {
  onSubmit: (code: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  hideTitle?: boolean;
}

export default function ElectionCodeForm({
  onSubmit,
  isLoading,
  error,
  hideTitle = false,
}: ElectionCodeFormProps) {
  const [electionCode, setElectionCode] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (electionCode.trim()) {
      await onSubmit(electionCode.trim());
    }
  };

  // If we're in a dialog, render a simplified version
  if (hideTitle) {
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Input
            placeholder="Masukkan kode pemilihan"
            value={electionCode}
            onChange={(e) => setElectionCode(e.target.value)}
            className="text-center text-xl font-mono tracking-wider uppercase dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
            maxLength={8}
          />
          {error && (
            <p className="text-sm text-red-500 dark:text-red-400 text-center">
              {error}
            </p>
          )}
        </div>
        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 dark:from-teal-700 dark:to-emerald-600"
          disabled={isLoading}
        >
          {isLoading ? (
            "Memverifikasi..."
          ) : (
            <>
              Lihat Hasil <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>
    );
  }

  return (
    <div className="container py-12 max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-teal-700 to-emerald-600 bg-clip-text text-transparent dark:from-teal-500 dark:to-emerald-400">
          Live Vote Count
        </h1>
        <p className="text-muted-foreground dark:text-gray-400">
          Masukkan kode pemilihan untuk melihat hasil
        </p>
      </motion.div>

      <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-gray-100">
            Masukkan Kode Pemilihan
          </CardTitle>
          <CardDescription className="dark:text-gray-400">
            Kode pemilihan disediakan dalam PDF pemilihan Anda
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="contoh: 7J14UBIP"
                value={electionCode}
                onChange={(e) => setElectionCode(e.target.value)}
                className="text-center text-xl font-mono tracking-wider uppercase dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                maxLength={8}
              />
              {error && (
                <p className="text-sm text-red-500 dark:text-red-400 text-center">
                  {error}
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 dark:from-teal-700 dark:to-emerald-600"
              disabled={isLoading}
            >
              {isLoading ? (
                "Memverifikasi..."
              ) : (
                <>
                  Lihat Hasil <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex-col space-y-3 border-t border-gray-200 dark:border-gray-800 pt-4">
          <div className="flex items-center text-xs text-muted-foreground dark:text-gray-400">
            <LockKeyhole className="h-3 w-3 mr-1" />
            Hasil hanya dapat diakses dengan kode pemilihan yang valid
          </div>
          <Collapsible className="w-full">
            <CollapsibleTrigger className="text-xs text-teal-600 hover:text-teal-700 dark:text-teal-500 dark:hover:text-teal-400 hover:underline">
              Tidak memiliki kode pemilihan?
            </CollapsibleTrigger>
            <CollapsibleContent className="text-xs text-gray-600 dark:text-gray-400 pt-2">
              <p>Kode pemilihan disediakan saat pemilihan dibuat.</p>
              <ul className="list-disc pl-4 mt-2">
                <li>Jika Anda penyelenggara, periksa PDF pemilihan Anda</li>
                <li>
                  Jika Anda pemilih, tanyakan kepada administrator pemilihan
                </li>
                <li>
                  Anda dapat membuat pemilihan sendiri dari halaman beranda
                </li>
              </ul>
            </CollapsibleContent>
          </Collapsible>
        </CardFooter>
      </Card>
    </div>
  );
}
