"use client";

import * as React from "react";
import { 
  Card, 
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
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
  LabelList
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

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
  totalVoters 
}: CandidateDetailsProps) {
  // Calculate total votes
  const totalVotes = React.useMemo(() => 
    data.reduce((sum, item) => sum + item.voteCount, 0), 
  [data]);
  
  // Combine candidates with their vote data
  const candidatesWithData = React.useMemo(() => 
    candidates.map(candidate => {
      const result = data.find(item => item.candidate.id === candidate.id);
      const voteCount = result?.voteCount || 0;
      const votePercentage = totalVotes > 0 
        ? Math.round((voteCount / totalVotes) * 100) 
        : 0;
      
      return {
        ...candidate,
        voteCount,
        votePercentage
      };
    }).sort((a, b) => b.voteCount - a.voteCount),
  [candidates, data, totalVotes]);
  
  // Format data for bar chart
  const chartData = React.useMemo(() => 
    candidatesWithData.map(candidate => ({
      name: candidate.name.length > 15 
        ? `${candidate.name.substring(0, 15)}...` 
        : candidate.name,
      votes: candidate.voteCount
    })),
  [candidatesWithData]);

  return (
    <div className="space-y-8">
      {/* Bar Chart Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Vote Distribution</CardTitle>
          <CardDescription>
            Detailed vote counts for all candidates
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
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip 
                  formatter={(value) => [`${value} votes`, 'Votes']}
                  labelFormatter={(name) => `Candidate: ${name}`}
                />
                <Bar 
                  dataKey="votes" 
                  fill="#8884d8" 
                  radius={[0, 4, 4, 0]}
                  animationDuration={1500}
                >
                  <LabelList dataKey="votes" position="right" />
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
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16 border rounded-md">
                    {candidate.photo_url ? (
                      <AvatarImage src={candidate.photo_url} alt={candidate.name} />
                    ) : (
                      <AvatarFallback className="text-2xl">
                        {candidate.name.charAt(0)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{candidate.name}</CardTitle>
                    <CardDescription>Candidate ID: {candidate.id}</CardDescription>
                  </div>
                </div>
                <Badge
                  variant={candidate.votePercentage > 50 ? "default" : "outline"}
                  className="text-lg h-9 px-4"
                >
                  {candidate.votePercentage}%
                </Badge>
              </CardHeader>
              <CardContent className="mt-4 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-muted-foreground">
                      {candidate.voteCount} out of {totalVotes} votes
                    </span>
                    <span className="text-sm font-medium">
                      {candidate.votePercentage}%
                    </span>
                  </div>
                  <Progress value={candidate.votePercentage} className="h-2" />
                </div>
                
                {candidate.description && (
                  <div className="text-sm text-muted-foreground mt-4">
                    <p>{candidate.description}</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="text-sm text-muted-foreground">
                {totalVoters && (
                  <p>
                    {Math.round((candidate.voteCount / totalVoters) * 100)}% of all eligible voters
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