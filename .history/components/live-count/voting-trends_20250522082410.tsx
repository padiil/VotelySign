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
  snapshots: Array<{
    timestamp: Date;
    results: Array<{
      candidateId: string;
      candidateName: string;
      voteCount: number;
    }>;
  }>;
}

// Simulated trend data (in a real app, this would come from periodic snapshots stored in your DB)
const generateMockTrendData = (
  candidates: Array<{ id: string; name: string }>
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

    candidates.forEach((candidate) => {
      const finalCount = candidate.voteCount || 0;
      // Earlier times have fewer votes, trending upward
      const factor = Math.min(
        1,
        (timeIndex + 1) / hours.length + Math.random() * 0.1
      );
      point[candidate.name] = Math.floor(finalCount * factor);
    });

    return point;
  });
};

export default function VotingTrends({ data }: VotingTrendsProps) {
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

  // Generate mock trend data for demonstration
  // In a real app, you'd use real periodic snapshots from your database
  const trendData = React.useMemo(
    () => generateMockTrendData(candidates),
    [candidates]
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

  // Calculate participation over time (mock data)
  const participationTrend = React.useMemo(() => {
    const totalVoters = 100; // For demonstration
    return trendData.map((point) => {
      const totalVotesAtTime = candidates.reduce(
        (sum, candidate) => sum + ((point[candidate.name] as number) || 0),
        0
      );

      return {
        timestamp: point.timestamp,
        participation: Math.round((totalVotesAtTime / totalVoters) * 100),
      };
    });
  }, [trendData, candidates]);

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
              Simulation
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
          <CardTitle>Voter Participation</CardTitle>
          <CardDescription>
            Percentage of eligible voters who have cast ballots over time
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
                <Tooltip
                  formatter={(value) => [`${value}%`, "Participation"]}
                />
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
          <CardTitle>Voting Analysis</CardTitle>
          <CardDescription>Key insights from voting patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Peak Voting Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2:30 PM</div>
                <p className="text-xs text-muted-foreground">
                  Highest volume of votes recorded
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Vote Velocity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3.2/min</div>
                <p className="text-xs text-muted-foreground">
                  Average votes per minute
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Estimated Completion
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">30 min</div>
                <p className="text-xs text-muted-foreground">
                  Until all expected votes are cast
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
