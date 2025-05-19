"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getElectionByCode } from "@/actions/election-actions";

// Import our components
import ElectionCodeForm from "@/components/live-count/election-code-form";
import VoteDistributionChart from "@/components/live-count/vote-distribution-chart";
import ElectionStats from "@/components/live-count/election-stats";
import LiveUpdates from "@/components/live-count/live-updates";

export default function LiveCountPage() {
  const [election, setElection] = useState<any>(null);
  const [electionCode, setElectionCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle code submission
  const handleSubmitCode = async (code: string) => {
    setError(null);
    setLoading(true);
    setElectionCode(code);

    try {
      const response = await getElectionByCode(code);

      if (response.success && response.data) {
        setElection(response.data);
      } else {
        setError(response.error || "Invalid election code");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // If we don't have election data yet, show the code entry form
  if (!election) {
    return (
      <ElectionCodeForm
        onSubmit={handleSubmitCode}
        isLoading={loading}
        error={error}
      />
    );
  }

  // If we have election data, show the results
  return (
    <div className="container py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center flex-wrap gap-2 mb-2">
          <h1 className="text-4xl font-bold">Live Vote Count</h1>
          <Badge variant="outline" className="text-sm">
            Election Code: {electionCode}
          </Badge>
        </div>
        <h2 className="text-2xl font-semibold mb-6">{election.title}</h2>
        <p className="text-muted-foreground mb-8">
          Real-time election results and statistics
        </p>
      </motion.div>

      <Tabs defaultValue="overview" className="mb-8">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <VoteDistributionChart electionId={election.id} />
            <ElectionStats electionId={election.id} />
            <LiveUpdates electionId={election.id} />
          </div>
        </TabsContent>
        <TabsContent value="details">
          <p>Detailed vote information will go here</p>
        </TabsContent>
        <TabsContent value="trends">
          <p>Voting trends will go here</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
