import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  message?: string;
  submessage?: string;
}

export function LoadingSpinner({
  message = "Loading...",
  submessage = "Please wait",
}: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="h-12 w-12 animate-spin text-purple-500 mb-4" />
      <p className="text-lg font-medium">{message}</p>
      <p className="text-sm text-gray-500">{submessage}</p>
    </div>
  );
}
