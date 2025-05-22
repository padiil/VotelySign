"use client";

import { ArrowRight, ArrowLeft } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface StepWizardProps {
  currentStep: number;
  steps: {
    title: string;
    description: string;
    content: React.ReactNode;
  }[];
  onNext: () => void;
  onPrevious: () => void;
}

export function StepWizard({
  currentStep,
  steps,
  onNext,
  onPrevious,
}: StepWizardProps) {
  const currentStepData = steps[currentStep - 1];
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === steps.length;

  if (!currentStepData) return null;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>
          Step {currentStep}: {currentStepData.title}
        </CardTitle>
        <CardDescription>{currentStepData.description}</CardDescription>
      </CardHeader>
      <CardContent>{currentStepData.content}</CardContent>
      <CardFooter className="flex justify-between">
        {!isFirstStep && (
          <Button variant="outline" onClick={onPrevious}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
        )}
        {isFirstStep && <div></div>}

        {!isLastStep ? (
          <Button onClick={onNext} className={isFirstStep ? "ml-auto" : ""}>
            Next <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
            Submit Election
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
