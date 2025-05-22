"use client";

import * as React from "react";
import { Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CountdownTimerProps {
  startTime: string | Date | null;
  endTime: string | Date | null;
  variant?: "default" | "compact" | "inline";
  className?: string;
}

export default function CountdownTimer({
  startTime,
  endTime,
  variant = "default",
  className = "",
}: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = React.useState<string>("");
  const [electionStatus, setElectionStatus] = React.useState<
    "upcoming" | "active" | "ended"
  >("active");

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
        prefix = variant === "inline" ? "Starts in " : "Starts in: ";
      } else if (electionStatus === "active") {
        targetDate = end;
        prefix = variant === "inline" ? "Ends in " : "Ends in: ";
      } else {
        setTimeRemaining("Election has ended");
        return;
      }

      const diffMs = targetDate.getTime() - now.getTime();
      if (diffMs <= 0) {
        // Only reload if we're not in an inline component
        if (variant !== "inline") {
          window.location.reload();
        }
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
      if (variant === "compact") {
        // Compact format: 2d 01:23:45
        if (days > 0) timeString += `${days}d `;
        timeString += `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
      } else {
        // Default and inline format: more readable
        if (days > 0) timeString += `${days}d `;
        if (hours > 0 || days > 0) timeString += `${hours}h `;
        timeString += `${minutes}m ${seconds}s`;
      }

      setTimeRemaining(`${prefix}${timeString}`);
    };

    updateTimer();
    const timerId = setInterval(updateTimer, 1000);

    return () => clearInterval(timerId);
  }, [startTime, endTime, electionStatus, variant]);

  // Render different variants
  if (variant === "compact") {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <Badge
          variant={electionStatus === "active" ? "default" : "outline"}
          className={electionStatus === "active" ? "bg-green-500" : ""}
        >
          {electionStatus === "upcoming"
            ? "Upcoming"
            : electionStatus === "active"
            ? "Live"
            : "Ended"}
        </Badge>
        <span className="font-mono text-sm">{timeRemaining}</span>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <span className={`inline-flex items-center gap-1 ${className}`}>
        {electionStatus === "active" ? (
          <Clock className="h-3 w-3 text-amber-500" />
        ) : electionStatus === "ended" ? (
          <CheckCircle className="h-3 w-3 text-green-500" />
        ) : (
          <AlertCircle className="h-3 w-3 text-blue-500" />
        )}
        <span className="text-sm">{timeRemaining}</span>
      </span>
    );
  }

  // Default variant
  return (
    <div className={`py-3 px-4 rounded-md bg-slate-50 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {electionStatus === "active" ? (
            <Clock className="h-4 w-4 text-amber-500" />
          ) : electionStatus === "ended" ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <AlertCircle className="h-4 w-4 text-blue-500" />
          )}
          <span className="text-sm font-medium text-slate-600">Status</span>
        </div>
        <Badge
          variant={electionStatus === "active" ? "default" : "outline"}
          className={electionStatus === "active" ? "bg-green-500" : ""}
        >
          {electionStatus === "upcoming"
            ? "Upcoming"
            : electionStatus === "active"
            ? "Live"
            : "Ended"}
        </Badge>
      </div>
      <div className="text-lg font-medium font-mono tracking-tight">
        {timeRemaining}
      </div>
    </div>
  );
}
