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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function LiveCountPage() {
  return (
    <div className="container py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-6">Live Vote Count</h1>
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
            <AnimatedCircleChart />
            <StatsCard />
            <RecentUpdatesCard />
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

function AnimatedCircleChart() {
  const [data, setData] = React.useState([
    { name: "Candidate A", value: 400, color: "#0ea5e9" },
    { name: "Candidate B", value: 300, color: "#8b5cf6" },
    { name: "Candidate C", value: 200, color: "#f43f5e" },
    { name: "Candidate D", value: 100, color: "#10b981" },
  ]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vote Distribution</CardTitle>
        <CardDescription>Live count of votes per candidate</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-[300px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                animationDuration={1000}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        {data.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span>
              {entry.name}: {entry.value} votes
            </span>
          </div>
        ))}
      </CardFooter>
    </Card>
  );
}

function StatsCard() {
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
          <span className="font-semibold">1,000</span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex justify-between"
        >
          <span className="text-muted-foreground">Participation Rate</span>
          <span className="font-semibold">67%</span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex justify-between"
        >
          <span className="text-muted-foreground">Precincts Reporting</span>
          <span className="font-semibold">24/36</span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex justify-between"
        >
          <span className="text-muted-foreground">Last Updated</span>
          <span className="font-semibold">Just now</span>
        </motion.div>
      </CardContent>
    </Card>
  );
}

function RecentUpdatesCard() {
  const updates = [
    { time: "2 min ago", message: "Precinct 12 results uploaded", type: "new" },
    {
      time: "15 min ago",
      message: "Candidate B gained 45 votes",
      type: "update",
    },
    { time: "32 min ago", message: "Precinct 8 results uploaded", type: "new" },
    { time: "1 hour ago", message: "Vote counting started", type: "info" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Updates</CardTitle>
        <CardDescription>Live vote counting updates</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {updates.map((update, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="flex items-start gap-2"
          >
            <Badge
              variant={
                update.type === "new"
                  ? "default"
                  : update.type === "update"
                  ? "secondary"
                  : "outline"
              }
            >
              {update.time}
            </Badge>
            <span>{update.message}</span>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}
