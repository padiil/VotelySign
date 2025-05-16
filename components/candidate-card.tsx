"use client"

import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import { CheckCircle } from "lucide-react"

export default function CandidateCard({ candidate, isSelectable = false, isSelected = false, onSelect }) {
  return (
    <Card
      className={`overflow-hidden transition-all ${isSelectable ? "cursor-pointer hover:shadow-md" : ""} ${
        isSelected ? "ring-2 ring-emerald-500 shadow-md" : ""
      }`}
      onClick={isSelectable ? onSelect : undefined}
    >
      <div className="relative aspect-square">
        <Image
          src={candidate.photo_url || "/placeholder.svg?height=200&width=200"}
          alt={candidate.name}
          fill
          className="object-cover"
        />
        {isSelected && (
          <div className="absolute top-2 right-2 bg-emerald-500 rounded-full p-1">
            <CheckCircle className="h-5 w-5 text-white" />
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-bold text-lg mb-1">{candidate.name}</h3>
        <p className="text-gray-600 text-sm">{candidate.description}</p>
        {isSelectable && (
          <div
            className={`mt-4 text-center p-2 rounded-md border ${
              isSelected ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "border-gray-200 text-gray-500"
            }`}
          >
            {isSelected ? "Terpilih" : "Pilih Kandidat"}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
