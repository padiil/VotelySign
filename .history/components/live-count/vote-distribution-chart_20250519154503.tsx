"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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

  // Define colors
  const colors = [
    "#0ea5e9",
    "#8b5cf6",
    "#f43f5e",
    "#10b981",
    "#f59e0b",
    "#6366f1",
    "#ec4899",
    "#14b8a6",
  ];

  // Process data for the chart
  const chartData = React.useMemo(() => {
    return data.map((item, index) => ({
      name: item.candidate.name,
      value: item.voteCount,
      color: colors[index % colors.length],
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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vote Distribution</CardTitle>
          <CardDescription>Live count of votes per candidate</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-[300px]">
          <div className="animate-pulse text-muted-foreground">
            Loading data...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vote Distribution</CardTitle>
          <CardDescription>Live count of votes per candidate</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-[300px]">
          <div className="text-muted-foreground">No votes recorded yet</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vote Distribution</CardTitle>
        <CardDescription>Live count of votes per candidate</CardDescription>
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
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                animationDuration={1000}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        {chartData.map((entry, index) => (
          <motion.div
            key={index}
            className="flex items-center gap-2"
            animate={{
              opacity: isAnimating ? [1, 0.8, 1] : 1,
            }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span>
              {entry.name}: {entry.value} votes
            </span>
          </motion.div>
        ))}
      </CardFooter>
    </Card>
  );
}
