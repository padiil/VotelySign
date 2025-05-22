"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface TrendPoint {
  timestamp: string;
  [candidateName: string]: number | string;
}

interface VotingTrendsProps {
  data: Array<{
    candidate: { id: string; name: string };
    voteCount: number;
  }>;
  voteTimestamps?: Array<{
    candidateId: string;
    candidateName: string;
    timestamp: string;
  }>;
  totalVoters?: number;
}

export default function VotingTrends({
  data,
  voteTimestamps = [],
  totalVoters,
}: VotingTrendsProps) {
  // Extract candidate info
  const candidates = React.useMemo(
    () =>
      data.map((item) => ({
        id: item.candidate.id,
        name: item.candidate.name,
        voteCount: item.voteCount,
      })),
    [data]
  );

  // Unique colors for each candidate
  const colors = [
    "#0ea5e9",
    "#8b5cf6",
    "#f43f5e",
    "#10b981",
    "#f59e0b",
    "#6366f1",
  ];

  // Generate real trend data from actual vote timestamps
  const trendData = React.useMemo(() => {
    // If no timestamps, return empty array
    if (!voteTimestamps || voteTimestamps.length === 0) {
      return [];
    }

    // Sort timestamps chronologically
    const sortedTimestamps = [...voteTimestamps].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // Group by hour for better visualization
    const hourGroups: Record<string, { [candidateId: string]: number }> = {};

    // Initialize counters for each candidate
    const candidateCounts: Record<string, number> = {};
    candidates.forEach((c) => {
      candidateCounts[c.id] = 0;
    });

    // Process each vote timestamp
    sortedTimestamps.forEach((vote) => {
      // Format timestamp to hourly groups (YYYY-MM-DD HH:00)
      const date = new Date(vote.timestamp);
      const hourKey = date.toISOString().substring(0, 13) + ":00:00";

      // Initialize hour group if not exists
      if (!hourGroups[hourKey]) {
        hourGroups[hourKey] = { ...candidateCounts };
      }

      // Increment count for this candidate
      candidateCounts[vote.candidateId] =
        (candidateCounts[vote.candidateId] || 0) + 1;

      // Update all candidates' cumulative counts for this hour
      hourGroups[hourKey] = { ...candidateCounts };
    });

    // Convert to array format for chart
    return Object.entries(hourGroups).map(([timestamp, counts]) => {
      const point: TrendPoint = {
        timestamp: new Date(timestamp).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
        }),
      };

      // Add count for each candidate
      candidates.forEach((candidate) => {
        point[candidate.name] = counts[candidate.id] || 0;
      });

      return point;
    });
  }, [voteTimestamps, candidates]);

  // Calculate participation over time from real data
  const participationTrend = React.useMemo(() => {
    const actualTotalVoters = totalVoters || 100;

    return trendData.map((point) => {
      // Sum all candidate votes at this time point
      const totalVotesAtTime = candidates.reduce(
        (sum, candidate) => sum + ((point[candidate.name] as number) || 0),
        0
      );

      return {
        timestamp: point.timestamp,
        participation: Math.round((totalVotesAtTime / actualTotalVoters) * 100),
      };
    });
  }, [trendData, candidates, totalVoters]);

  // Calculate voting analytics
  const votingAnalytics = React.useMemo(() => {
    // Default values
    let totalVotesRecorded = 0;
    let participationRate = "0%";

    // Only calculate if we have candidates with votes
    if (candidates.length > 0) {
      // Calculate total votes
      totalVotesRecorded = candidates.reduce((sum, c) => sum + c.voteCount, 0);

      // Calculate participation rate
      const actualTotalVoters = totalVoters || 100;
      const rate = (totalVotesRecorded / actualTotalVoters) * 100;
      participationRate = `${rate.toFixed(1)}%`;
    }

    return {
      totalVotesRecorded,
      participationRate,
    };
  }, [candidates, totalVoters]);

  // If there's no data yet, show a message
  if (trendData.length === 0) {
    return (
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Voting Trends</CardTitle>
                <CardDescription>Vote count trends over time</CardDescription>
              </div>
              <Badge variant="outline" className="font-mono">
                Live Data
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No voting data available yet.</p>
          </CardContent>
        </Card>

        {/* Voting Analysis */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Rekap Pemilihan</CardTitle>
                <CardDescription>
                  Ringkasan jumlah suara saat ini
                </CardDescription>
              </div>
              <Badge variant="outline" className="font-mono text-xs">
                Live Data
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Suara Masuk
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {votingAnalytics.totalVotesRecorded}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Jumlah suara yang telah direkam
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Tingkat Partisipasi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {votingAnalytics.participationRate}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Persentase pemilih yang sudah memberikan suara
                  </p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Perkembangan Suara</CardTitle>
              <CardDescription>
                Jumlah suara dari waktu ke waktu
              </CardDescription>
            </div>
            <Badge variant="outline" className="font-mono">
              Live Data
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="line">
            <TabsList className="mb-4">
              <TabsTrigger value="line">Line Chart</TabsTrigger>
              <TabsTrigger value="area">Area Chart</TabsTrigger>
            </TabsList>

            <TabsContent value="line">
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={trendData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 30,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="timestamp"
                      padding={{ left: 20, right: 20 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {candidates.map((candidate, index) => (
                      <Line
                        key={candidate.id}
                        type="monotone"
                        dataKey={candidate.name}
                        stroke={colors[index % colors.length]}
                        activeDot={{ r: 8 }}
                        strokeWidth={2}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="area">
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={trendData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 30,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="timestamp"
                      padding={{ left: 20, right: 20 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {candidates.map((candidate, index) => (
                      <Area
                        key={candidate.id}
                        type="monotone"
                        dataKey={candidate.name}
                        stackId="1"
                        stroke={colors[index % colors.length]}
                        fill={`${colors[index % colors.length]}99`}
                      />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Voting Participation Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Tingkat Partisipasi</CardTitle>
          <CardDescription>
            Persentase pemilih yang telah memberikan suara dari waktu ke waktu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={participationTrend}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 30,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestamp"
                  padding={{ left: 20, right: 20 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value) => [`${value}%`, "Partisipasi"]} />
                <Line
                  type="monotone"
                  dataKey="participation"
                  stroke="#10b981"
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Voting Analysis */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Rekap Pemilihan</CardTitle>
              <CardDescription>Ringkasan jumlah suara saat ini</CardDescription>
            </div>
            <Badge variant="outline" className="font-mono text-xs">
              Live Data
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Suara Masuk
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {votingAnalytics.totalVotesRecorded}
                </div>
                <p className="text-xs text-muted-foreground">
                  Jumlah suara yang telah direkam
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Tingkat Partisipasi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {votingAnalytics.participationRate}
                </div>
                <p className="text-xs text-muted-foreground">
                  Persentase pemilih yang sudah memberikan suara
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
