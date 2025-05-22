import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart2 } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="w-full max-w-4xl mx-auto text-center">
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-2 text-gray-900">
            <span className="text-emerald-600">Votely</span>Sign
          </h1>
          <p className="text-lg text-gray-600 mt-4">
            Vote digitally, signed & secured by blockchain
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <Link href="/vote" className="w-full">
            <Button className="w-full h-24 text-xl bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-lg transition-all flex flex-col">
              <span>Go Vote</span>
              <span className="text-xs mt-1 font-normal">Cast your ballot securely</span>
              <ArrowRight className="ml-2 h-5 w-5 absolute right-4" />
            </Button>
          </Link>
          
          <Link href="/live-count" className="w-full">
            <Button
              variant="secondary"
              className="w-full h-24 text-xl bg-purple-500 hover:bg-purple-600 text-white rounded-xl shadow-lg transition-all flex flex-col"
            >
              <span>Live Count</span>
              <span className="text-xs mt-1 font-normal">Monitor election results</span>
              <BarChart2 className="ml-2 h-5 w-5 absolute right-4" />
            </Button>
          </Link>
          
          <Link href="/create" className="w-full">
            <Button
              variant="outline"
              className="w-full h-24 text-xl border-2 border-gray-300 hover:border-gray-400 rounded-xl shadow-lg transition-all flex flex-col"
            >
              <span>Create Election</span>
              <span className="text-xs mt-1 font-normal">Set up your own ballot</span>
              <ArrowRight className="ml-2 h-5 w-5 absolute right-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
