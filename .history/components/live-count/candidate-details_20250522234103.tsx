"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  LabelList,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CandidateDetailsProps {
  candidates: Array<{
    id: string;
    name: string;
    photo_url?: string;
    description?: string;
  }>;
  data: Array<{
    candidate: { id: string; name: string };
    voteCount: number;
  }>;
  totalVoters?: number;
}

export default function CandidateDetails({
  candidates,
  data,
  totalVoters,
}: CandidateDetailsProps) {
  // Calculate total votes
  const totalVotes = React.useMemo(
    () => data.reduce((sum, item) => sum + item.voteCount, 0),
    [data]
  );

  // Combine candidates with their vote data
  const candidatesWithData = React.useMemo(
    () =>
      candidates
        .map((candidate) => {
          const result = data.find(
            (item) => item.candidate.id === candidate.id
          );
          const voteCount = result?.voteCount || 0;
          const votePercentage =
            totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;

          return {
            ...candidate,
            voteCount,
            votePercentage,
          };
        })
        .sort((a, b) => b.voteCount - a.voteCount),
    [candidates, data, totalVotes]
  );

  // Format data for bar chart
  const chartData = React.useMemo(
    () =>
      candidatesWithData.map((candidate) => ({
        name:
          candidate.name.length > 15
            ? `${candidate.name.substring(0, 15)}...`
            : candidate.name,
        votes: candidate.voteCount,
      })),
    [candidatesWithData]
  );

  // Get color based on percentage
  const getColorForPercentage = (percentage: number) => {
    if (percentage > 50)
      return "bg-gradient-to-r from-teal-600 to-emerald-600 text-white border-0 dark:from-teal-700 dark:to-emerald-600";
    if (percentage > 30)
      return "bg-gradient-to-r from-blue-600 to-teal-600 text-white border-0 dark:from-blue-700 dark:to-teal-600";
    return "border-gray-300 text-gray-700 dark:border-gray-700 dark:text-gray-300";
  };

  // Get progress color based on percentage
  const getProgressColor = (percentage: number) => {
    if (percentage > 50) return "bg-gradient-to-r from-teal-500 to-emerald-500";
    if (percentage > 30) return "bg-gradient-to-r from-blue-500 to-teal-500";
    return "bg-gradient-to-r from-gray-400 to-gray-500 dark:from-gray-600 dark:to-gray-500";
  };

  return (
    <div className="space-y-8">
      {/* Bar Chart Overview */}
      <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-gray-100">
            Distribusi Suara
          </CardTitle>
          <CardDescription className="text-gray-500 dark:text-gray-400">
            Jumlah suara detail untuk semua kandidat
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={chartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 40,
                  bottom: 5,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#374151"
                  strokeOpacity={0.2}
                />
                <XAxis
                  type="number"
                  tick={{ fill: "var(--color-text, #111827)" }}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={100}
                  tick={{ fill: "var(--color-text, #111827)" }}
                />
                <Tooltip
                  formatter={(value) => [`${value} suara`, "Suara"]}
                  labelFormatter={(name) => `Kandidat: ${name}`}
                  contentStyle={{
                    backgroundColor: "var(--bg-tooltip, white)",
                    borderColor: "var(--border-tooltip, #e5e7eb)",
                    borderRadius: "0.375rem",
                    boxShadow:
                      "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Bar
                  dataKey="votes"
                  fill="url(#colorGradient)"
                  radius={[0, 4, 4, 0]}
                  animationDuration={1500}
                >
                  <LabelList
                    dataKey="votes"
                    position="right"
                    fill="var(--color-text, #111827)"
                  />
                  <defs>
                    <linearGradient
                      id="colorGradient"
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="0"
                    >
                      <stop offset="0%" stopColor="#0d9488" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                  </defs>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Individual Candidate Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {candidatesWithData.map((candidate) => (
          <motion.div
            key={candidate.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16 border rounded-md bg-gray-100 dark:bg-gray-800">
                    {candidate.photo_url ? (
                      <AvatarImage
                        src={candidate.photo_url}
                        alt={candidate.name}
                      />
                    ) : (
                      <AvatarFallback className="text-2xl bg-gradient-to-br from-teal-50 to-emerald-50 text-teal-700 dark:from-teal-950 dark:to-emerald-950 dark:text-teal-300">
                        {candidate.name.charAt(0)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
                      {candidate.name}
                    </CardTitle>
                    <CardDescription className="dark:text-gray-400">
                      ID Kandidat: {candidate.id}
                    </CardDescription>
                  </div>
                </div>
                <Badge
                  variant={
                    candidate.votePercentage > 50 ? "default" : "outline"
                  }
                  className={cn(
                    "text-lg h-9 px-4",
                    getColorForPercentage(candidate.votePercentage)
                  )}
                >
                  {candidate.votePercentage}%
                </Badge>
              </CardHeader>
              <CardContent className="mt-4 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {candidate.voteCount} dari {totalVotes} suara
                    </span>
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {candidate.votePercentage}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full dark:bg-gray-800">
                    <div
                      className={cn(
                        "h-2 rounded-full",
                        getProgressColor(candidate.votePercentage)
                      )}
                      style={{ width: `${candidate.votePercentage}%` }}
                    />
                  </div>
                </div>

                {candidate.description && (
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                    <p>{candidate.description}</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="text-sm text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800 pt-3">
                {totalVoters && (
                  <p>
                    {Math.round((candidate.voteCount / totalVoters) * 100)}%
                    dari semua pemilih yang memenuhi syarat
                  </p>
                )}
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
