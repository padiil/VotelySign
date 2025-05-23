"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BarChart3, ArrowUpCircle, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface VoteDistributionChartProps {
  data: Array<{
    candidate: {
      id: string;
      name: string;
      photo_url?: string;
    };
    voteCount: number;
  }>;
  loading?: boolean;
}

export default function VoteDistributionChart({
  data,
  loading = false,
}: VoteDistributionChartProps) {
  const [isAnimating, setIsAnimating] = React.useState(false);
  const prevDataRef = React.useRef<string>("");

  // Define colors that match with teal-emerald theme
  const colors = [
    "#0d9488", // teal-600
    "#059669", // emerald-600
    "#0891b2", // cyan-600
    "#0284c7", // sky-600
    "#4f46e5", // indigo-600
    "#7c3aed", // violet-600
    "#9333ea", // purple-600
    "#c026d3", // fuchsia-600
  ];

  // Process data for the chart
  const chartData = React.useMemo(() => {
    // Calculate total votes
    const totalVotes = data.reduce((sum, item) => sum + item.voteCount, 0);

    return data.map((item, index) => ({
      name: item.candidate.name,
      value: item.voteCount,
      percentage:
        totalVotes > 0 ? Math.round((item.voteCount / totalVotes) * 100) : 0,
      color: colors[index % colors.length],
      id: item.candidate.id,
      photo_url: item.candidate.photo_url,
    }));
  }, [data]);

  // Detect changes to trigger animation
  React.useEffect(() => {
    const currentDataString = JSON.stringify(data);
    if (prevDataRef.current && prevDataRef.current !== currentDataString) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 800);
    }
    prevDataRef.current = currentDataString;
  }, [data]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 shadow-lg border border-gray-100 dark:border-gray-700 rounded-lg">
          <p className="font-medium text-gray-900 dark:text-gray-100">
            {payload[0].payload.name}
          </p>
          <p className="text-teal-600 dark:text-teal-400 mt-1">
            <span className="font-medium">{payload[0].value}</span> suara (
            {payload[0].payload.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-teal-600 dark:text-teal-500" />
            <CardTitle className="text-gray-900 dark:text-gray-100">
              Distribusi Suara
            </CardTitle>
          </div>
          <CardDescription className="dark:text-gray-400">
            Persentase perolehan suara tiap kandidat
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-[400px]">
          <div className="animate-pulse text-gray-500 dark:text-gray-400 flex flex-col items-center gap-2">
            <RefreshCw className="h-8 w-8 animate-spin text-teal-600/50 dark:text-teal-500/50" />
            <span>Memuat data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-teal-600 dark:text-teal-500" />
            <CardTitle className="text-gray-900 dark:text-gray-100">
              Distribusi Suara
            </CardTitle>
          </div>
          <CardDescription className="dark:text-gray-400">
            Persentase perolehan suara tiap kandidat
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-[400px]">
          <div className="text-gray-500 dark:text-gray-400 text-center">
            <BarChart3 className="h-12 w-12 mb-2 mx-auto text-gray-400 dark:text-gray-600" />
            <p>Belum ada suara yang tercatat</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort data by votes, highest first
  const sortedChartData = [...chartData].sort((a, b) => b.value - a.value);
  const totalVotes = sortedChartData.reduce((sum, item) => sum + item.value, 0);
  const leadingCandidate = sortedChartData[0];

  // Calculate if someone has 50%+ votes to win
  const hasWinner = leadingCandidate && leadingCandidate.percentage > 50;

  return (
    <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-teal-600 dark:text-teal-500" />
            <CardTitle className="text-gray-900 dark:text-gray-100">
              Distribusi Suara
            </CardTitle>
          </div>
          <Badge
            variant="outline"
            className="text-xs font-mono border-teal-100 text-teal-700 dark:border-teal-900/40 dark:text-teal-500"
          >
            Total: {totalVotes} suara
          </Badge>
        </div>
        <CardDescription className="dark:text-gray-400">
          Persentase perolehan suara tiap kandidat
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: 1,
            scale: isAnimating ? [1, 1.02, 1] : 1,
          }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-[300px] w-full mb-6"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sortedChartData}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={true}
                vertical={false}
                stroke="#374151"
                strokeOpacity={0.2}
              />
              <XAxis
                type="number"
                tick={{ fill: "var(--color-text, #111827)" }}
                axisLine={{ stroke: "#374151", strokeOpacity: 0.2 }}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: "var(--color-text, #111827)" }}
                width={100}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="value"
                radius={[0, 4, 4, 0]}
                animationDuration={800}
                label={{
                  position: "right",
                  formatter: (value: any, entry: any) =>
                    `${entry.payload.percentage}%`,
                  fill: "var(--color-text, #111827)",
                  fontWeight: 500,
                }}
              >
                {sortedChartData.map((entry, index) => (
                  <Cell
                    key={`cell-${entry.id}`}
                    fill={`url(#gradient-${entry.id})`}
                  />
                ))}
              </Bar>
              <defs>
                {sortedChartData.map((entry, index) => (
                  <linearGradient
                    key={`gradient-${entry.id}`}
                    id={`gradient-${entry.id}`}
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="0"
                  >
                    <stop
                      offset="0%"
                      stopColor={entry.color}
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="100%"
                      stopColor={entry.color}
                      stopOpacity={1}
                    />
                  </linearGradient>
                ))}
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Candidate Photos and Names */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {sortedChartData.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="flex flex-col items-center"
            >
              <Avatar
                className={`h-16 w-16 border-2 ${
                  index === 0
                    ? "border-teal-500 dark:border-teal-600"
                    : "border-gray-200 dark:border-gray-700"
                } mb-2`}
              >
                {entry.photo_url ? (
                  <AvatarImage src={entry.photo_url} alt={entry.name} />
                ) : (
                  <AvatarFallback
                    className={`text-xl ${
                      index === 0
                        ? "bg-gradient-to-br from-teal-50 to-emerald-50 text-teal-700 dark:from-teal-900/50 dark:to-emerald-900/50 dark:text-teal-400"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                    }`}
                  >
                    {entry.name.charAt(0)}
                  </AvatarFallback>
                )}
                {index === 0 && entry.percentage > 30 && (
                  <div className="absolute -top-1 -right-1 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full p-0.5 shadow-lg">
                    <ArrowUpCircle className="h-5 w-5 text-white" />
                  </div>
                )}
              </Avatar>
              <div className="text-center">
                <p className="font-medium text-sm text-gray-900 dark:text-gray-100 line-clamp-1">
                  {entry.name}
                </p>
                <Badge
                  variant={entry.percentage > 50 ? "default" : "outline"}
                  className={`mt-1 ${
                    entry.percentage > 50
                      ? "bg-gradient-to-r from-teal-600 to-emerald-600 text-white border-0"
                      : "border-gray-200 text-gray-700 dark:border-gray-700 dark:text-gray-300"
                  }`}
                >
                  {entry.value} suara ({entry.percentage}%)
                </Badge>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
      {hasWinner && (
        <CardFooter className="border-t border-gray-100 dark:border-gray-800 pt-4">
          <div className="w-full bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 p-3 rounded-md text-center text-teal-700 dark:text-teal-400 font-medium border border-teal-100 dark:border-teal-900/40">
            {leadingCandidate.name} memimpin dengan{" "}
            {leadingCandidate.percentage}% suara
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
