"use client";

import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Candidate = {
  name: string;
  description: string;
  photo_url?: string;
};

type CandidateCardProps = {
  candidate: Candidate;
  isSelectable?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
  className?: string;
};

export default function CandidateCard({
  candidate,
  isSelectable = false,
  isSelected = false,
  onSelect,
  className,
}: CandidateCardProps) {
  return (
    <Card
      className={cn(
        "overflow-hidden transition-all border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950",
        isSelectable &&
          "cursor-pointer hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-emerald-950/10",
        isSelected && "ring-2 ring-emerald-500 dark:ring-emerald-600 shadow-md",
        className
      )}
      onClick={isSelectable ? onSelect : undefined}
    >
      <div className="relative aspect-square bg-gray-100 dark:bg-gray-800">
        <Image
          src={candidate.photo_url || "/placeholder.svg?height=200&width=200"}
          alt={candidate.name}
          fill
          className="object-cover"
        />
        {isSelected && (
          <div className="absolute top-2 right-2 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-full p-1 shadow-lg">
            <CheckCircle className="h-5 w-5 text-white" />
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-bold text-lg mb-1 text-gray-900 dark:text-gray-100">
          {candidate.name}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          {candidate.description}
        </p>
        {isSelectable && (
          <div
            className={cn(
              "mt-4 text-center p-2 rounded-md border transition-colors",
              isSelected
                ? "bg-gradient-to-r from-teal-50 to-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400"
                : "border-gray-200 text-gray-500 dark:border-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900"
            )}
          >
            {isSelected ? "Terpilih" : "Pilih Kandidat"}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
