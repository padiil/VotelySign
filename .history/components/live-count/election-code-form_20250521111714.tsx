"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, LockKeyhole } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ElectionCodeFormProps {
  onSubmit: (code: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export default function ElectionCodeForm({
  onSubmit,
  isLoading,
  error,
}: ElectionCodeFormProps) {
  const [electionCode, setElectionCode] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (electionCode.trim()) {
      await onSubmit(electionCode.trim());
    }
  };

  return (
    <div className="container py-12 max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold mb-4">Live Vote Count</h1>
        <p className="text-muted-foreground">
          Enter your election code to view results
        </p>
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle>Enter Election Code</CardTitle>
          <CardDescription>
            The election code was provided in your election PDF
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Form content */}
          </form>
        </CardContent>
        <CardFooter className="flex-col space-y-3 border-t pt-4">
          <div className="flex items-center text-xs text-muted-foreground">
            <LockKeyhole className="h-3 w-3 mr-1" />
            Results are only accessible with a valid election code
          </div>
          <Collapsible className="w-full">
            <CollapsibleTrigger className="text-xs text-blue-500 hover:underline">
              Don't have an election code?
            </CollapsibleTrigger>
            <CollapsibleContent className="text-xs text-gray-600 pt-2">
              <p>Election codes are provided when an election is created.</p>
              <ul className="list-disc pl-4 mt-2">
                <li>If you're an organizer, check your election PDF</li>
                <li>If you're a voter, ask your election administrator</li>
                <li>You can create your own election from the home page</li>
              </ul>
            </CollapsibleContent>
          </Collapsible>
        </CardFooter>
      </Card>
    </div>
  );
}
