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
import { getElectionResults } from "@/actions/election-actions";

interface ElectionStatsProps {
  electionId: string;
}

export default function ElectionStats({ electionId }: ElectionStatsProps) {
  const [stats, setStats] = React.useState({
    totalVotes: 0,
    participationRate: 0,
    precincts: { reporting: 0, total: 0 },
    lastUpdated: new Date(),
  });

  const [loading, setLoading] = React.useState(true);

  const fetchStats = React.useCallback(async () => {
    if (!electionId) return;

    try {
      setLoading(true);
      // Fetch vote results
      const { success, data } = await getElectionResults(electionId);

      if (success && data) {
        const totalVotes = data.reduce(
          (sum, result) => sum + result.voteCount,
          0
        );

        // In a real app, we would fetch voter count and precinct data from the database
        // For now, we'll estimate participation based on assumed values
        const estimatedTotalVoters = Math.max(
          totalVotes,
          Math.round(totalVotes * 1.5)
        );
        const participationRate =
          estimatedTotalVoters > 0
            ? Math.round((totalVotes / estimatedTotalVoters) * 100)
            : 0;

        setStats({
          totalVotes,
          participationRate,
          precincts: { reporting: 24, total: 36 }, // This should come from your database
          lastUpdated: new Date(),
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  }, [electionId]);

  // Initial fetch and polling setup
  React.useEffect(() => {
    fetchStats();

    // Poll every 5 seconds
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Voting Statistics</CardTitle>
        <CardDescription>Current count metrics</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex justify-between"
        >
          <span className="text-muted-foreground">Total Votes</span>
          <span className="font-semibold">
            {stats.totalVotes.toLocaleString()}
          </span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex justify-between"
        >
          <span className="text-muted-foreground">Participation Rate</span>
          <span className="font-semibold">{stats.participationRate}%</span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex justify-between"
        >
          <span className="text-muted-foreground">Precincts Reporting</span>
          <span className="font-semibold">
            {stats.precincts.reporting}/{stats.precincts.total}
          </span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex justify-between"
        >
          <span className="text-muted-foreground">Last Updated</span>
          <span className="font-semibold">
            {stats.lastUpdated.toLocaleTimeString()}
          </span>
        </motion.div>
      </CardContent>
    </Card>
  );
}
