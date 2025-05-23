"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CalendarClock, Calendar, Clock, Timer } from "lucide-react";
import CountdownTimer from "@/components/countdown-timer";
import { Badge } from "@/components/ui/badge";

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
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "long",
      timeStyle: "short",
    }).format(date);
  };

  // Determine election status
  const getElectionStatus = () => {
    if (!startTime || !endTime) return "unknown";

    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (now < start) return "upcoming";
    if (now > end) return "ended";
    return "active";
  };

  // Get badge style based on status
  const getStatusBadgeStyle = () => {
    const status = getElectionStatus();

    if (status === "active") {
      return "bg-gradient-to-r from-teal-600 to-emerald-600 text-white border-0";
    }

    if (status === "upcoming") {
      return "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-700/30 dark:text-blue-400";
    }

    if (status === "ended") {
      return "bg-gray-100 border-gray-200 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400";
    }

    return "bg-gray-100 border-gray-200 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400";
  };

  // Get status label
  const getStatusLabel = () => {
    const status = getElectionStatus();

    if (status === "active") return "Sedang Berlangsung";
    if (status === "upcoming") return "Akan Datang";
    if (status === "ended") return "Telah Berakhir";
    return "Status Tidak Diketahui";
  };

  const startDate = startTime ? new Date(startTime) : null;
  const endDate = endTime ? new Date(endTime) : null;

  // Calculate duration in hours and days
  const getDuration = () => {
    if (!startDate || !endDate) return "Tidak diketahui";

    const durationMs = endDate.getTime() - startDate.getTime();
    const durationHours = Math.ceil(durationMs / (1000 * 60 * 60));

    if (durationHours < 24) {
      return `${durationHours} jam`;
    } else {
      const days = Math.floor(durationHours / 24);
      const remainingHours = durationHours % 24;
      return `${days} hari ${
        remainingHours > 0 ? `${remainingHours} jam` : ""
      }`;
    }
  };

  return (
    <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
              <CalendarClock className="w-5 h-5 mr-2 text-teal-600 dark:text-teal-500" />
              Waktu Pemilihan
            </CardTitle>
            <CardDescription className="dark:text-gray-400">
              Detail periode pemungutan suara
            </CardDescription>
          </div>
          <Badge variant="outline" className={getStatusBadgeStyle()}>
            {getStatusLabel()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Countdown Timer */}
        <CountdownTimer startTime={startTime} endTime={endTime} />

        {/* Start and End Times */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md space-y-2">
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <Calendar className="mr-2 h-4 w-4 text-teal-600 dark:text-teal-500" />
              Waktu Mulai
            </div>
            <p className="font-medium text-gray-900 dark:text-gray-100">
              {startDate ? formatDate(startDate) : "Belum ditentukan"}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md space-y-2">
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <Calendar className="mr-2 h-4 w-4 text-teal-600 dark:text-teal-500" />
              Waktu Berakhir
            </div>
            <p className="font-medium text-gray-900 dark:text-gray-100">
              {endDate ? formatDate(endDate) : "Belum ditentukan"}
            </p>
          </div>
        </div>

        {/* Duration */}
        <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md flex justify-between items-center">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-gradient-to-r from-teal-100 to-emerald-100 dark:from-teal-900/30 dark:to-emerald-900/30 mr-3">
              <Timer className="h-5 w-5 text-teal-600 dark:text-teal-500" />
            </div>
            <span className="text-gray-600 dark:text-gray-300">
              Total Durasi
            </span>
          </div>
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {getDuration()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
