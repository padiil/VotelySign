"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getElectionByCode,
  getElectionResults,
} from "@/actions/election-actions";

// Import our components
import ElectionCodeForm from "@/components/live-count/election-code-form";
import VoteDistributionChart from "@/components/live-count/vote-distribution-chart";
import ElectionStats from "@/components/live-count/election-stats";
import LiveUpdates from "@/components/live-count/live-updates";
import CandidateDetails from "@/components/live-count/candidate-details";
import VotingTrends from "@/components/live-count/voting-trends";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { LockKeyhole } from "lucide-react";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";

export default function LiveCountPage() {
  const [election, setElection] = useState<any>(null);
  const [electionCode, setElectionCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // States for centralized data fetching
  const [results, setResults] = useState<any[]>([]);
  const [previousResults, setPreviousResults] = useState<any[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  // Ref to prevent overlapping fetches
  const isFetchingRef = useRef(false);
  // Ref to store latest results without causing re-renders
  const resultsRef = useRef<any[]>([]);

  // Handle code submission
  const handleSubmitCode = async (code: string) => {
    setError(null);
    setLoading(true);
    setElectionCode(code);

    try {
      const response = await getElectionByCode(code);

      if (response.success && response.data) {
        setElection(response.data);
        console.log("Election data:", response.data); // Debug log to check structure
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

  // Centralized data fetching function - REMOVED results from dependencies
  const fetchResults = useCallback(async () => {
    // Don't fetch if: no election data or another fetch is in progress
    if (!election || isFetchingRef.current) return;

    try {
      isFetchingRef.current = true;
      setIsFetching(true);

      const response = await getElectionResults(election.id);

      if (response.success && response.data) {
        // Compare with ref to avoid dependency on state
        const hasChanges =
          JSON.stringify(response.data) !== JSON.stringify(resultsRef.current);

        if (hasChanges) {
          // Use the current results as previous results
          setPreviousResults(resultsRef.current);

          // Update the results
          setResults(response.data);
          resultsRef.current = response.data;
          setLastUpdated(new Date());
        }
      }
    } catch (err) {
      console.error("Error fetching results:", err);
    } finally {
      setIsFetching(false);
      isFetchingRef.current = false;
    }
  }, [election]); // Only depend on election, NOT results

  // Set up polling with a ref to track the interval
  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined;

    if (election) {
      // Initial fetch
      fetchResults();

      // Set up polling interval with a longer time (10 seconds is more reasonable)
      intervalId = setInterval(() => {
        fetchResults();
      }, 10000);
    }

    // Clean up function
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [election, fetchResults]);

  // The rest of your component remains the same...
  if (!election) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Enter Election Code</CardTitle>
          <CardDescription>
            The election code was provided in your election PDF
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ElectionCodeForm
            onSubmit={handleSubmitCode}
            isLoading={loading}
            error={error}
          />
        </CardContent>
        <CardFooter className="flex-col space-y-3 border-t pt-4">
          <div className="flex items-center text-xs text-muted-foreground">
            <LockKeyhole className="h-3 w-3 mr-1" />
            Results are only accessible with a valid election code
          </div>
          <Collapsible className="w-full">
            <CollapsibleTrigger className="text-xs text-blue-500 hover:underline">
              Don't have an election code?
            </CollapsibleTrigger>
            <CollapsibleContent className="text-xs text-gray-600 pt-2">
              <p>Election codes are provided when an election is created.</p>
              <ul className="list-disc pl-4 mt-2">
                <li>If you're an organizer, check your election PDF</li>
                <li>If you're a voter, ask your election administrator</li>
                <li>You can create your own election from the home page</li>
              </ul>
            </CollapsibleContent>
          </Collapsible>
        </CardFooter>
      </Card>
    );
  }

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
            <VoteDistributionChart
              data={results}
              loading={isFetching && results.length === 0}
            />
            <ElectionStats
              data={results}
              lastUpdated={lastUpdated}
              loading={isFetching && results.length === 0}
              totalVoters={election?.voters_count} // Use the dynamically fetched count
            />
            <LiveUpdates
              data={results}
              previousData={previousResults}
              lastUpdated={lastUpdated}
              loading={isFetching && results.length === 0}
            />
          </div>
        </TabsContent>
        <TabsContent value="details">
          <CandidateDetails
            candidates={election.candidates}
            data={results}
            totalVoters={election?.voters_count}
          />
        </TabsContent>
        <TabsContent value="trends">
          <VotingTrends data={results} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
