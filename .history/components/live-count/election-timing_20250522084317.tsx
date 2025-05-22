"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CalendarClock } from "lucide-react";
import CountdownTimer from "@/components/countdown-timer";

interface ElectionTimingProps {
  startTime: string | Date | null;
  endTime: string | Date | null;
}

export default function ElectionTiming({
  startTime,
  endTime,
}: ElectionTimingProps) {
  // Format dates for display
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "long",
      timeStyle: "short",
    }).format(date);
  };

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
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Countdown Timer */}
        <CountdownTimer startTime={startTime} endTime={endTime} />

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
