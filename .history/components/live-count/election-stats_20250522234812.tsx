"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart3,
  CalendarCheck,
  Clock,
  Users,
  Map,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ElectionStatsProps {
  data: Array<{
    candidate: { id: string; name: string };
    voteCount: number;
  }>;
  lastUpdated: Date | null;
  loading?: boolean;
  totalVoters?: number;
}

export default function ElectionStats({
  data,
  lastUpdated,
  loading = false,
  totalVoters,
}: ElectionStatsProps) {
  // Calculate stats
  const stats = React.useMemo(() => {
    const totalVotes = data.reduce((sum, result) => sum + result.voteCount, 0);

    const actualTotalVoters =
      totalVoters !== undefined
        ? totalVoters
        : Math.max(totalVotes, Math.round(totalVotes * 1.5));

    const participationRate =
      actualTotalVoters > 0
        ? Math.round((totalVotes / actualTotalVoters) * 100)
        : 0;

    return {
      totalVotes,
      totalVoters: actualTotalVoters,
      participationRate,
      precincts: { reporting: 24, total: 36 },
    };
  }, [data, totalVoters]);

  if (loading) {
    return (
      <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
            <BarChart3 className="w-5 h-5 mr-2 text-teal-600 dark:text-teal-500" />
            Statistik Pemungutan Suara
          </CardTitle>
          <CardDescription className="dark:text-gray-400">
            Metrik perhitungan saat ini
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-[200px]">
          <div className="animate-pulse text-gray-500 dark:text-gray-400">
            <div className="flex items-center">
              <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
              Memuat statistik...
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
              <BarChart3 className="w-5 h-5 mr-2 text-teal-600 dark:text-teal-500" />
              Statistik Pemungutan Suara
            </CardTitle>
            <CardDescription className="dark:text-gray-400">
              Metrik perhitungan saat ini
            </CardDescription>
          </div>
          {lastUpdated && (
            <Badge
              variant="outline"
              className="text-xs border-gray-200 text-gray-500 dark:border-gray-700 dark:text-gray-400"
            >
              Updated: {lastUpdated.toLocaleTimeString()}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md flex justify-between items-center"
        >
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-gradient-to-r from-teal-100 to-emerald-100 dark:from-teal-900/30 dark:to-emerald-900/30 mr-3">
              <BarChart3 className="h-5 w-5 text-teal-600 dark:text-teal-500" />
            </div>
            <span className="text-gray-600 dark:text-gray-300">
              Total Suara
            </span>
          </div>
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {stats.totalVotes.toLocaleString()}
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md flex justify-between items-center"
        >
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-gradient-to-r from-teal-100 to-emerald-100 dark:from-teal-900/30 dark:to-emerald-900/30 mr-3">
              <CalendarCheck className="h-5 w-5 text-teal-600 dark:text-teal-500" />
            </div>
            <span className="text-gray-600 dark:text-gray-300">
              Tingkat Partisipasi
            </span>
          </div>
          <Badge
            variant={stats.participationRate > 50 ? "default" : "outline"}
            className={
              stats.participationRate > 50
                ? "bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white border-0"
                : "text-teal-700 border-teal-200 dark:text-teal-400 dark:border-teal-900"
            }
          >
            {stats.participationRate}%
          </Badge>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md flex justify-between items-center"
        >
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-gradient-to-r from-teal-100 to-emerald-100 dark:from-teal-900/30 dark:to-emerald-900/30 mr-3">
              <Users className="h-5 w-5 text-teal-600 dark:text-teal-500" />
            </div>
            <span className="text-gray-600 dark:text-gray-300">
              Total Pemilih
            </span>
          </div>
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {stats.totalVoters.toLocaleString()}
          </span>
        </motion.div>

       
      </CardContent>
    </Card>
  );
}
