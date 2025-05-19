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

interface ElectionStatsProps {
  data: Array<{
    candidate: { id: string; name: string };
    voteCount: number;
  }>;
  lastUpdated: Date | null;
  loading?: boolean;
}

export default function ElectionStats({
  data,
  lastUpdated,
  loading = false,
}: ElectionStatsProps) {
  // Calculate stats
  const stats = React.useMemo(() => {
    const totalVotes = data.reduce((sum, result) => sum + result.voteCount, 0);

    // In a real app, we would get this from your database
    const estimatedTotalVoters = Math.max(
      totalVotes,
      Math.round(totalVotes * 1.5)
    );
    const participationRate =
      estimatedTotalVoters > 0
        ? Math.round((totalVotes / estimatedTotalVoters) * 100)
        : 0;

    return {
      totalVotes,
      participationRate,
      precincts: { reporting: 24, total: 36 }, // This should come from your database
    };
  }, [data]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Voting Statistics</CardTitle>
          <CardDescription>Current count metrics</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-[200px]">
          <div className="animate-pulse text-muted-foreground">
            Loading stats...
          </div>
        </CardContent>
      </Card>
    );
  }

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
            {lastUpdated ? lastUpdated.toLocaleTimeString() : "Never"}
          </span>
        </motion.div>
      </CardContent>
    </Card>
  );
}
