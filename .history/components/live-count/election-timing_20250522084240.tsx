"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, Clock, CheckCircle, AlertCircle } from "lucide-react";

interface ElectionTimingProps {
  startTime: string | Date | null;
  endTime: string | Date | null;
}

export default function ElectionTiming({
  startTime,
  endTime,
}: ElectionTimingProps) {
  const [timeRemaining, setTimeRemaining] = React.useState<string>("");
  const [electionStatus, setElectionStatus] = React.useState<
    "upcoming" | "active" | "ended"
  >("active");

  // Format dates for display
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "long",
      timeStyle: "short",
    }).format(date);
  };

  // Calculate time remaining or elapsed
  React.useEffect(() => {
    if (!startTime || !endTime) return;

    const start = new Date(startTime);
    const end = new Date(endTime);

    // Set up countdown timer
    const updateTimer = () => {
      const now = new Date();

      // Determine election status
      if (now < start) {
        setElectionStatus("upcoming");
      } else if (now > end) {
        setElectionStatus("ended");
      } else {
        setElectionStatus("active");
      }

      let targetDate: Date;
      let prefix: string;

      if (electionStatus === "upcoming") {
        targetDate = start;
        prefix = "Starts in: ";
      } else if (electionStatus === "active") {
        targetDate = end;
        prefix = "Ends in: ";
      } else {
        setTimeRemaining("Election has ended");
        return;
      }

      const diffMs = targetDate.getTime() - now.getTime();
      if (diffMs <= 0) {
        window.location.reload(); // Refresh when status changes
        return;
      }

      // Calculate remaining time
      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      let timeString = "";
      if (days > 0) timeString += `${days}d `;
      timeString += `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

      setTimeRemaining(`${prefix}${timeString}`);
    };

    updateTimer();
    const timerId = setInterval(updateTimer, 1000);

    return () => clearInterval(timerId);
  }, [startTime, endTime, electionStatus]);

  const startDate = startTime ? new Date(startTime) : null;
  const endDate = endTime ? new Date(endTime) : null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Election Timing</CardTitle>
            <CardDescription>Voting period details</CardDescription>
          </div>
          {electionStatus === "active" && (
            <Badge className="bg-green-500">Live</Badge>
          )}
          {electionStatus === "upcoming" && (
            <Badge
              variant="outline"
              className="text-blue-500 border-blue-200 bg-blue-50"
            >
              Upcoming
            </Badge>
          )}
          {electionStatus === "ended" && (
            <Badge variant="outline" className="text-gray-500">
              Ended
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Countdown Timer - Simplified, no animations */}
        <div className="py-3 px-4 rounded-md bg-slate-50 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            {electionStatus === "active" ? (
              <Clock className="h-5 w-5 text-amber-500" />
            ) : electionStatus === "ended" ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-blue-500" />
            )}
            <span className="text-sm font-medium text-slate-600">Status</span>
          </div>
          <div className="text-xl font-bold tracking-wide font-mono">
            {timeRemaining}
          </div>
        </div>

        {/* Start and End Times */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center text-sm text-muted-foreground">
              <CalendarClock className="mr-2 h-4 w-4" />
              Start Time
            </div>
            <p className="font-medium">
              {startDate ? formatDate(startDate) : "Not specified"}
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center text-sm text-muted-foreground">
              <CalendarClock className="mr-2 h-4 w-4" />
              End Time
            </div>
            <p className="font-medium">
              {endDate ? formatDate(endDate) : "Not specified"}
            </p>
          </div>
        </div>

        {/* Duration */}
        <div className="pt-2">
          <div className="text-sm text-muted-foreground mb-1">
            Total Duration
          </div>
          <p className="font-medium">
            {startDate && endDate
              ? `${Math.ceil(
                  (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60)
                )} hours`
              : "Unknown"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
