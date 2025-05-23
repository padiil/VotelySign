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
import { Badge } from "@/components/ui/badge";
import { Bell, RefreshCw, AlertCircle } from "lucide-react";

interface Update {
  time: string;
  message: string;
  type: "new" | "update" | "info";
}

interface Candidate {
  id: string;
  name: string;
}

interface Result {
  candidate: Candidate;
  voteCount: number;
}

interface LiveUpdatesProps {
  data: Result[];
  previousData: Result[];
  lastUpdated: Date | null;
  loading?: boolean;
}

export default function LiveUpdates({
  data,
  previousData,
  lastUpdated,
  loading = false,
}: LiveUpdatesProps) {
  const [updates, setUpdates] = React.useState<Update[]>([]);

  // Generate updates based on data changes
  React.useEffect(() => {
    if (loading || !lastUpdated) return;

    // If this is the first load
    if (previousData.length === 0 && data.length > 0) {
      setUpdates([
        {
          time: formatTimeAgo(lastUpdated),
          message: "Data perhitungan suara dimuat",
          type: "info",
        },
      ]);
      return;
    }

    // Check for changes
    if (previousData.length > 0) {
      const newUpdates: Update[] = [];

      // Check for new votes
      for (const current of data) {
        const prev = previousData.find(
          (p) => p.candidate.id === current.candidate.id
        );

        if (prev) {
          const diff = current.voteCount - prev.voteCount;
          if (diff > 0) {
            newUpdates.push({
              time: formatTimeAgo(lastUpdated),
              message: `${current.candidate.name} mendapat ${diff} suara baru`,
              type: "update",
            });
          }
        }
      }

      // Add a generic update if nothing changed but data was refreshed
      if (
        newUpdates.length === 0 &&
        JSON.stringify(data) !== JSON.stringify(previousData)
      ) {
        newUpdates.push({
          time: formatTimeAgo(lastUpdated),
          message: "Hasil diperbarui",
          type: "info",
        });
      }

      // Update states
      if (newUpdates.length > 0) {
        setUpdates((prev) => [...newUpdates, ...prev].slice(0, 8));
      }
    }
  }, [data, previousData, lastUpdated, loading]);

  // Format relative time
  function formatTimeAgo(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    if (seconds < 60) return `${seconds} detik lalu`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} menit lalu`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} jam lalu`;
    return `${Math.floor(seconds / 86400)} hari lalu`;
  }

  // Get badge style based on update type
  const getBadgeStyle = (type: "new" | "update" | "info") => {
    switch (type) {
      case "new":
        return "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white border-0";
      case "update":
        return "bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white border-0";
      case "info":
      default:
        return "border-gray-200 text-gray-700 dark:border-gray-700 dark:text-gray-300";
    }
  };

  if (loading && updates.length === 0) {
    return (
      <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-teal-600 dark:text-teal-500" />
              <CardTitle className="text-gray-900 dark:text-gray-100">
                Pembaruan Terbaru
              </CardTitle>
            </div>
            {lastUpdated && (
              <Badge
                variant="outline"
                className="text-xs border-gray-200 text-gray-500 dark:border-gray-700 dark:text-gray-400"
              >
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                Memperbarui...
              </Badge>
            )}
          </div>
          <CardDescription className="dark:text-gray-400">
            Pembaruan live counting secara real-time
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-[200px]">
          <div className="animate-pulse text-gray-500 dark:text-gray-400 flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Memuat pembaruan...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-teal-600 dark:text-teal-500" />
            <CardTitle className="text-gray-900 dark:text-gray-100">
              Pembaruan Terbaru
            </CardTitle>
          </div>
          {lastUpdated && (
            <Badge
              variant="outline"
              className="text-xs border-gray-200 text-gray-500 dark:border-gray-700 dark:text-gray-400"
            >
              Diperbarui: {lastUpdated.toLocaleTimeString()}
            </Badge>
          )}
        </div>
        <CardDescription className="dark:text-gray-400">
          Pembaruan live counting secara real-time
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 h-[240px] overflow-y-auto">
        {updates.length > 0 ? (
          updates.map((update, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 flex-1">
                  {update.type === "update" ? (
                    <div className="p-1.5 rounded-full bg-gradient-to-r from-blue-100 to-teal-100 dark:from-blue-900/30 dark:to-teal-900/30">
                      <RefreshCw className="h-3 w-3 text-teal-600 dark:text-teal-500" />
                    </div>
                  ) : (
                    <div className="p-1.5 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-800">
                      <AlertCircle className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                    </div>
                  )}
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {update.message}
                  </span>
                </div>
                <Badge
                  variant={update.type === "info" ? "outline" : "default"}
                  className={`text-xs ${getBadgeStyle(update.type)}`}
                >
                  {update.time}
                </Badge>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400 py-4">
            <AlertCircle className="h-10 w-10 mb-2 text-gray-400 dark:text-gray-500" />
            <p>Belum ada pembaruan</p>
            <p className="text-xs mt-1">
              Pembaruan akan muncul setelah suara diterima
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
