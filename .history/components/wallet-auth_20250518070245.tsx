"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { getAuthMessage, signWithWallet } from "@/lib/wallet-auth";
import { authenticateWithWallet } from "@/actions/voter-actions";

interface WalletLoginProps {
  voterCode: string;
  electionId: string;
  onSuccess: (voterId: string) => void;
}

export default function WalletLogin({
  voterCode,
  electionId,
  onSuccess,
}: WalletLoginProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [walletInstalled, setWalletInstalled] = useState(false);

  useEffect(() => {
    // Check if MetaMask or OKX wallet is installed
    const checkWalletInstalled = () => {
      if (typeof window !== "undefined") {
        const ethereum = (window as any).ethereum;
        setWalletInstalled(!!ethereum);
      }
    };

    checkWalletInstalled();
  }, []);

  const handleWalletLogin = async (walletType: "metamask" | "okx") => {
    setIsLoading(true);
    setError(null);

    try {
      // Get the provider based on wallet type
      const ethereum = (window as any).ethereum;

      if (!ethereum) {
        throw new Error(
          `${
            walletType === "metamask" ? "MetaMask" : "OKX Wallet"
          } is not installed`
        );
      }

      // Request account access
      await ethereum.request({ method: "eth_requestAccounts" });

      // Get the message to sign
      const message = getAuthMessage(voterCode);

      // Sign the message with the wallet
      const signature = await signWithWallet(ethereum, message);

      // Get connected wallet address
      const accounts = await ethereum.request({ method: "eth_accounts" });
      const walletAddress = accounts[0];

      // Authenticate with the server
      const result = await authenticateWithWallet({
        electionId,
        voterCode,
        walletAddress,
        signature,
        message,
      });

      if (result.success && result.data) {
        onSuccess(result.data.id);
      } else {
        setError(result.error || "Authentication failed");
      }
    } catch (err: any) {
      setError(err.message || "Failed to connect wallet");
    } finally {
      setIsLoading(false);
    }
  };

  if (!walletInstalled) {
    return (
      <div className="p-4 border rounded-md bg-amber-50 text-amber-800">
        <h3 className="font-semibold mb-2">Wallet Not Detected</h3>
        <p>Please install MetaMask or OKX Wallet extension to continue.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Login with Your Wallet</h2>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={() => handleWalletLogin("metamask")}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <svg
            viewBox="0 0 35 33"
            height="20"
            width="20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M32.9582 1L19.8241 10.9219L22.2653 5.09267L32.9582 1Z"
              fill="#E2761B"
              stroke="#E2761B"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Add rest of MetaMask SVG path */}
          </svg>
          Connect with MetaMask
        </Button>

        <Button
          onClick={() => handleWalletLogin("okx")}
          disabled={isLoading}
          variant="outline"
          className="flex items-center gap-2"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M16 32C24.8366 32 32 24.8366 32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32Z"
              fill="#000000"
            />
            <path d="M8.7 8.7H14.7V14.7H8.7V8.7Z" fill="#FFFFFF" />
            <path d="M17.3 8.7H23.3V14.7H17.3V8.7Z" fill="#FFFFFF" />
            <path d="M8.7 17.3H14.7V23.3H8.7V17.3Z" fill="#FFFFFF" />
            <path d="M17.3 17.3H23.3V23.3H17.3V17.3Z" fill="#FFFFFF" />
          </svg>
          Connect with OKX
        </Button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
