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
            <div className="space-y-2">
              <Input
                placeholder="e.g. 7J14UBIP"
                value={electionCode}
                onChange={(e) => setElectionCode(e.target.value)}
                className="text-center text-xl font-mono tracking-wider uppercase"
                maxLength={8}
              />
              {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                "Verifying..."
              ) : (
                <>
                  View Results <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center border-t pt-4">
          <div className="flex items-center text-xs text-muted-foreground">
            <LockKeyhole className="h-3 w-3 mr-1" />
            Results are only accessible with a valid election code
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
