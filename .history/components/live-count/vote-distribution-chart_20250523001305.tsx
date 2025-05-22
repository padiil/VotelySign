"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PieChartIcon, ArrowUpCircle, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
            {payload[0].name}
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
            <PieChartIcon className="h-5 w-5 text-teal-600 dark:text-teal-500" />
            <CardTitle className="text-gray-900 dark:text-gray-100">
              Distribusi Suara
            </CardTitle>
          </div>
          <CardDescription className="dark:text-gray-400">
            Persentase perolehan suara tiap kandidat
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-[300px]">
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
            <PieChartIcon className="h-5 w-5 text-teal-600 dark:text-teal-500" />
            <CardTitle className="text-gray-900 dark:text-gray-100">
              Distribusi Suara
            </CardTitle>
          </div>
          <CardDescription className="dark:text-gray-400">
            Persentase perolehan suara tiap kandidat
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-[300px]">
          <div className="text-gray-500 dark:text-gray-400 text-center">
            <PieChartIcon className="h-12 w-12 mb-2 mx-auto text-gray-400 dark:text-gray-600" />
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
            <PieChartIcon className="h-5 w-5 text-teal-600 dark:text-teal-500" />
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
      <CardContent className="flex justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: 1,
            scale: isAnimating ? [1, 1.02, 1] : 1,
            rotate: isAnimating ? [0, 1, 0, -1, 0] : 0,
          }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-[300px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <defs>
                {sortedChartData.map((entry, index) => (
                  <linearGradient
                    key={`gradient-${entry.id}`}
                    id={`gradient-${entry.id}`}
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="1"
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
              <Pie
                data={sortedChartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                animationDuration={1000}
                stroke="#ffffff"
                strokeWidth={2}
              >
                {sortedChartData.map((entry) => (
                  <Cell
                    key={`cell-${entry.id}`}
                    fill={`url(#gradient-${entry.id})`}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4 border-t border-gray-100 dark:border-gray-800 pt-4">
        <div className="w-full grid grid-cols-2 gap-2">
          {sortedChartData.slice(0, 4).map((entry, index) => (
            <motion.div
              key={entry.id}
              className={`flex items-start gap-2 p-2 rounded-md ${
                index === 0
                  ? "bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20"
                  : ""
              }`}
              animate={{
                opacity: isAnimating ? [1, 0.8, 1] : 1,
              }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
            >
              <div
                className="w-3 h-3 mt-1.5 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-1">
                    {entry.name}
                    {index === 0 && entry.percentage > 30 && (
                      <span className="ml-1 inline-flex">
                        <ArrowUpCircle className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                      </span>
                    )}
                  </p>
                  <Badge
                    variant={entry.percentage > 50 ? "default" : "outline"}
                    className={
                      entry.percentage > 50
                        ? "bg-gradient-to-r from-teal-600 to-emerald-600 text-white border-0 ml-1 text-xs"
                        : "text-xs border-gray-200 dark:border-gray-700"
                    }
                  >
                    {entry.percentage}%
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {entry.value} suara
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {sortedChartData.length > 4 && (
          <div className="text-xs text-center text-gray-500 dark:text-gray-400">
            +{sortedChartData.length - 4} kandidat lainnya
          </div>
        )}

        {hasWinner && (
          <div className="bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 p-2 rounded-md text-sm text-center text-teal-700 dark:text-teal-400 font-medium border border-teal-100 dark:border-teal-900/40">
            {leadingCandidate.name} memimpin dengan{" "}
            {leadingCandidate.percentage}% suara
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
