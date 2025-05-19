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
          message: "Vote counting data loaded",
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
              message: `${current.candidate.name} gained ${diff} vote${
                diff !== 1 ? "s" : ""
              }`,
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
          message: "Results refreshed",
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

    if (seconds < 60) return `${seconds} sec ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400)
      return `${Math.floor(seconds / 3600)} hour${
        Math.floor(seconds / 3600) !== 1 ? "s" : ""
      } ago`;
    return `${Math.floor(seconds / 86400)} day${
      Math.floor(seconds / 86400) !== 1 ? "s" : ""
    } ago`;
  }

  if (loading && updates.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Updates</CardTitle>
          <CardDescription>Live vote counting updates</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-[200px]">
          <div className="animate-pulse text-muted-foreground">
            Loading updates...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Updates</CardTitle>
        <CardDescription>Live vote counting updates</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {updates.length > 0 ? (
          updates.map((update, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex items-start gap-2"
            >
              <Badge
                variant={
                  update.type === "new"
                    ? "default"
                    : update.type === "update"
                    ? "secondary"
                    : "outline"
                }
              >
                {update.time}
              </Badge>
              <span>{update.message}</span>
            </motion.div>
          ))
        ) : (
          <div className="text-muted-foreground text-center py-4">
            No updates available yet
          </div>
        )}
      </CardContent>
    </Card>
  );
}
