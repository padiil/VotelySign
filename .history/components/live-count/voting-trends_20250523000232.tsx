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
import { TrendingUp, BarChart, Users } from "lucide-react";

interface TrendPoint {
  timestamp: string;
  [candidateName: string]: number | string;
}

interface VotingTrendsProps {
  data: Array<{
    candidate: { id: string; name: string };
    voteCount: number;
  }>;
  snapshots?: Array<{
    timestamp: Date;
    results: Array<{
      candidateId: string;
      candidateName: string;
      voteCount: number;
    }>;
  }>;
  totalVoters?: number;
}

// Simulated trend data (in a real app, this would come from periodic snapshots stored in your DB)
const generateMockTrendData = (
  candidates: Array<{ id: string; name: string; voteCount: number }>
) => {
  const now = new Date();
  const hours = Array.from({ length: 12 }, (_, i) => {
    const time = new Date(now);
    time.setHours(now.getHours() - (11 - i));
    return time;
  });

  // Generate realistic looking trend data with some randomness but maintaining current counts
  return hours.map((time, timeIndex) => {
    const point: TrendPoint = {
      timestamp: time.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    // Base factor that increases with time
    const timeFactor = Math.min(1, (timeIndex + 1) / hours.length);

    candidates.forEach((candidate) => {
      const finalCount = candidate.voteCount || 0;

      // Each candidate has a slightly different growth pattern
      // but all end up at their current vote count
      const randomVariation = Math.random() * 0.1;
      const growthFactor = Math.min(1, timeFactor + randomVariation);

      // Ensure values are integers and make sense for trends
      point[candidate.name] = Math.max(
        0,
        Math.floor(finalCount * growthFactor)
      );
    });

    return point;
  });
};

export default function VotingTrends({
  data,
  snapshots = [],
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

  // Generate trend data - prefer real snapshots if available, otherwise use mock data
  const trendData = React.useMemo(() => {
    // Use real snapshots if available
    if (snapshots && snapshots.length > 2) {
      return snapshots.map((snapshot) => {
        const point: TrendPoint = {
          timestamp: new Date(snapshot.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };

        snapshot.results.forEach((result) => {
          point[result.candidateName] = result.voteCount;
        });

        return point;
      });
    }

    // Otherwise use mock data
    return generateMockTrendData(candidates);
  }, [candidates, snapshots]);

  // Define colors for the charts that match with the teal-emerald theme
  const colors = [
    "#0d9488", // teal-600
    "#059669", // emerald-600
    "#0891b2", // cyan-600
    "#0284c7", // sky-600
    "#4f46e5", // indigo-600
    "#7c3aed", // violet-600
  ];

  // Calculate participation over time
  const participationTrend = React.useMemo(() => {
    const actualTotalVoters = totalVoters || 100;

    return trendData.map((point) => {
      const totalVotesAtTime = candidates.reduce((sum, candidate) => {
        const votes = point[candidate.name];
        return sum + (typeof votes === "number" ? votes : 0);
      }, 0);

      return {
        timestamp: point.timestamp,
        participation: Math.round((totalVotesAtTime / actualTotalVoters) * 100),
      };
    });
  }, [trendData, candidates, totalVoters]);

  // Calculate voting analytics
  const votingAnalytics = React.useMemo(() => {
    let totalVotesRecorded = 0;
    let participationRate = 0;

    if (candidates.length > 0) {
      totalVotesRecorded = candidates.reduce((sum, c) => sum + c.voteCount, 0);
      const actualTotalVoters = totalVoters || 100;
      participationRate = (totalVotesRecorded / actualTotalVoters) * 100;
    }

    return {
      totalVotesRecorded,
      participationRate: participationRate.toFixed(1),
    };
  }, [candidates, totalVoters]);

  // Custom tooltip for the charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 shadow-lg border border-gray-100 dark:border-gray-700 rounded-lg">
          <p className="font-medium text-gray-800 dark:text-gray-200 mb-1">
            {label}
          </p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <p
                key={`item-${index}`}
                style={{ color: entry.color }}
                className="flex items-center justify-between text-sm"
              >
                <span className="mr-4">{entry.name}:</span>
                <span className="font-mono font-medium">{entry.value}</span>
              </p>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-teal-600 dark:text-teal-500" />
              <CardTitle className="text-gray-900 dark:text-gray-100">
                Tren Pemilihan
              </CardTitle>
            </div>
            <Badge
              variant="outline"
              className="font-mono text-xs border-teal-100 text-teal-700 dark:border-teal-900/40 dark:text-teal-500"
            >
              {snapshots && snapshots.length > 2 ? "Real Data" : "Simulasi"}
            </Badge>
          </div>
          <CardDescription className="dark:text-gray-400">
            Tren jumlah suara masing-masing kandidat
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="line" className="w-full">
            <TabsList className="mb-4 w-full justify-start bg-gray-100 dark:bg-gray-800">
              <TabsTrigger
                value="line"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-950 data-[state=active]:text-teal-700 dark:data-[state=active]:text-teal-500"
              >
                Line Chart
              </TabsTrigger>
              <TabsTrigger
                value="area"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-950 data-[state=active]:text-teal-700 dark:data-[state=active]:text-teal-500"
              >
                Area Chart
              </TabsTrigger>
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
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#374151"
                      strokeOpacity={0.2}
                    />
                    <XAxis
                      dataKey="timestamp"
                      padding={{ left: 20, right: 20 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      tick={{ fill: "var(--color-text, #111827)" }}
                    />
                    <YAxis tick={{ fill: "var(--color-text, #111827)" }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    {candidates.map((candidate, index) => (
                      <Line
                        key={candidate.id}
                        type="monotone"
                        dataKey={candidate.name}
                        stroke={colors[index % colors.length]}
                        activeDot={{ r: 8 }}
                        strokeWidth={2}
                        dot={false}
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
                    <defs>
                      {candidates.map((candidate, index) => (
                        <linearGradient
                          key={`gradient-${candidate.id}`}
                          id={`gradient-${candidate.id}`}
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor={colors[index % colors.length]}
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor={colors[index % colors.length]}
                            stopOpacity={0.2}
                          />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#374151"
                      strokeOpacity={0.2}
                    />
                    <XAxis
                      dataKey="timestamp"
                      padding={{ left: 20, right: 20 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      tick={{ fill: "var(--color-text, #111827)" }}
                    />
                    <YAxis tick={{ fill: "var(--color-text, #111827)" }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    {candidates.map((candidate, index) => (
                      <Area
                        key={candidate.id}
                        type="monotone"
                        dataKey={candidate.name}
                        // Don't use stackId to prevent stacking (this is the key change)
                        stroke={colors[index % colors.length]}
                        fillOpacity={1}
                        fill={`url(#gradient-${candidate.id})`}
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
      <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-teal-600 dark:text-teal-500" />
            <CardTitle className="text-gray-900 dark:text-gray-100">
              Partisipasi Pemilih
            </CardTitle>
          </div>
          <CardDescription className="dark:text-gray-400">
            Persentase pemilih yang telah memberikan suara
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 p-4 rounded-md">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Total Suara
              </p>
              <p className="text-2xl font-bold text-teal-700 dark:text-teal-500">
                {votingAnalytics.totalVotesRecorded.toLocaleString()}
              </p>
            </div>
            <div className="bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 p-4 rounded-md">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Tingkat Partisipasi
              </p>
              <p className="text-2xl font-bold text-teal-700 dark:text-teal-500">
                {votingAnalytics.participationRate}%
              </p>
            </div>
            <div className="bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 p-4 rounded-md">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Total Pemilih
              </p>
              <p className="text-2xl font-bold text-teal-700 dark:text-teal-500">
                {(totalVoters || 0).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={participationTrend}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 30,
                }}
              >
                <defs>
                  <linearGradient
                    id="participationGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0.2} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#374151"
                  strokeOpacity={0.2}
                />
                <XAxis
                  dataKey="timestamp"
                  padding={{ left: 20, right: 20 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  tick={{ fill: "var(--color-text, #111827)" }}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: "var(--color-text, #111827)" }}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  formatter={(value) => [`${value}%`, "Partisipasi"]}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white dark:bg-gray-800 p-3 shadow-lg border border-gray-100 dark:border-gray-700 rounded-lg">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                            {label}
                          </p>
                          <p className="text-teal-600 dark:text-teal-500 font-medium">
                            Partisipasi: {payload[0].value}%
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="participation"
                  stroke="#0d9488"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#participationGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
