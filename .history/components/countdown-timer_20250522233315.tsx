"use client";

import * as React from "react";
import { Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
        prefix = variant === "inline" ? "Mulai dalam " : "Mulai dalam: ";
      } else if (electionStatus === "active") {
        targetDate = end;
        prefix = variant === "inline" ? "Berakhir dalam " : "Berakhir dalam: ";
      } else {
        setTimeRemaining("Pemilihan telah berakhir");
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
        if (days > 0) timeString += `${days}h `;
        if (hours > 0 || days > 0) timeString += `${hours}j `;
        timeString += `${minutes}m ${seconds}d`;
      }

      setTimeRemaining(`${prefix}${timeString}`);
    };

    updateTimer();
    const timerId = setInterval(updateTimer, 1000);

    return () => clearInterval(timerId);
  }, [startTime, endTime, electionStatus, variant]);

  // Get status badge styles consistent with navbar theme
  const getBadgeStyles = () => {
    if (electionStatus === "active") {
      return "bg-gradient-to-r from-teal-600 to-emerald-600 text-white border-0";
    }

    if (electionStatus === "upcoming") {
      return "bg-transparent border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400";
    }

    return "bg-transparent border-gray-400 text-gray-600 dark:border-gray-500 dark:text-gray-400";
  };

  // Get status label
  const getStatusLabel = () => {
    if (electionStatus === "upcoming") return "Akan Datang";
    if (electionStatus === "active") return "Live";
    return "Selesai";
  };

  // Render different variants
  if (variant === "compact") {
    return (
      <div className={cn("inline-flex items-center gap-2", className)}>
        <Badge variant="outline" className={cn(getBadgeStyles())}>
          {getStatusLabel()}
        </Badge>
        <span className="font-mono text-sm dark:text-gray-300">
          {timeRemaining}
        </span>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <span className={cn("inline-flex items-center gap-1", className)}>
        {electionStatus === "active" ? (
          <Clock className="h-3 w-3 text-emerald-600 dark:text-emerald-500" />
        ) : electionStatus === "ended" ? (
          <CheckCircle className="h-3 w-3 text-gray-500 dark:text-gray-400" />
        ) : (
          <AlertCircle className="h-3 w-3 text-blue-600 dark:text-blue-400" />
        )}
        <span className="text-sm dark:text-gray-300">{timeRemaining}</span>
      </span>
    );
  }

  // Default variant
  return (
    <div
      className={cn(
        "py-4 px-5 rounded-lg border border-gray-100 bg-white shadow-sm dark:bg-gray-900 dark:border-gray-800",
        className
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {electionStatus === "active" ? (
            <Clock className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
          ) : electionStatus === "ended" ? (
            <CheckCircle className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          ) : (
            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-500" />
          )}
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Status Pemilihan
          </span>
        </div>
        <Badge
          variant="outline"
          className={cn(getBadgeStyles(), "font-medium")}
        >
          {getStatusLabel()}
        </Badge>
      </div>
      <div className="text-lg font-medium font-mono tracking-tight text-gray-900 dark:text-gray-100">
        {timeRemaining}
      </div>
    </div>
  );
}
