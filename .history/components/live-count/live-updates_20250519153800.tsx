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
import { getElectionResults } from "@/actions/election-actions";

interface LiveUpdatesProps {
  electionId: string;
}

export default function LiveUpdates({ electionId }: LiveUpdatesProps) {
  const [updates, setUpdates] = React.useState<
    Array<{
      time: string;
      message: string;
      type: "new" | "update" | "info";
    }>
  >([{ time: "Loading...", message: "Fetching recent updates", type: "info" }]);

  const [lastFetchTime, setLastFetchTime] = React.useState<Date | null>(null);
  const [previousResults, setPreviousResults] = React.useState<any[]>([]);

  const fetchUpdates = React.useCallback(async () => {
    if (!electionId) return;

    try {
      const { success, data } = await getElectionResults(electionId);

      if (success && data) {
        const now = new Date();

        // If this is the first fetch
        if (!lastFetchTime) {
          setPreviousResults(data);
          setLastFetchTime(now);
          setUpdates([
            {
              time: formatTimeAgo(now),
              message: "Vote counting data loaded",
              type: "info",
            },
          ]);
          return;
        }

        // Compare with previous results to generate updates
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

        const newUpdates: Update[] = [];

        // Check for new votes
        for (const current of data) {
          const prev = previousResults.find(
            (p) => p.candidate.id === current.candidate.id
          );

          if (prev) {
            const diff = current.voteCount - prev.voteCount;
            if (diff > 0) {
              newUpdates.push({
                time: formatTimeAgo(now),
                message: `${current.candidate.name} gained ${diff} vote${
                  diff !== 1 ? "s" : ""
                }`,
                type: "update",
              });
            }
          }
        }

        // Add a generic update if nothing changed
        if (
          newUpdates.length === 0 &&
          JSON.stringify(data) !== JSON.stringify(previousResults)
        ) {
          newUpdates.push({
            time: formatTimeAgo(now),
            message: "Results refreshed",
            type: "info",
          });
        }

        // Update states
        if (newUpdates.length > 0) {
          setUpdates((prev) => [...newUpdates, ...prev].slice(0, 8));
        }

        setPreviousResults(data);
        setLastFetchTime(now);
      }
    } catch (error) {
      console.error("Error fetching updates:", error);
    }
  }, [electionId, lastFetchTime, previousResults]);

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

  // Initial fetch and polling setup
  React.useEffect(() => {
    fetchUpdates();

    // Poll every 5 seconds
    const interval = setInterval(fetchUpdates, 5000);
    return () => clearInterval(interval);
  }, [fetchUpdates]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Updates</CardTitle>
        <CardDescription>Live vote counting updates</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {updates.map((update, index) => (
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
        ))}
      </CardContent>
    </Card>
  );
}
