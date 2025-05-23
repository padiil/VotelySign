import { ethers } from "ethers";
import voting from "../voting.json";

// Ganti dengan alamat kontrak hasil deploy kamu di Sepolia
export const CONTRACT_ADDRESS = "0x7e5f495d5d9e9e362ab9a2cf818993430074149f";

// Ganti dengan ABI kontrak Voting kamu (copy dari Remix > tab ABI)
export const CONTRACT_ABI = voting.abi;

declare global {
  interface Window {
    ethereum?: any;
  }
}

// Fungsi untuk mengirim vote ke smart contract
export async function sendVoteToBlockchain({
  candidateId,
  schnorrSignature,
  zkpProof,
}: {
  candidateId: number;
  schnorrSignature: string;
  zkpProof: string;
}) {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask is not available");
  }
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  // Pastikan wallet di Sepolia
  const network = await provider.getNetwork();
  if (network.chainId !== 11155111) {
    // Coba switch ke Sepolia
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xAA36A7" }], // 11155111 hex
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        throw new Error(
          "Sepolia network belum ditambahkan di wallet. Tambahkan dulu."
        );
      }
      throw new Error(
        "Gagal switch ke jaringan Sepolia. Silakan ganti network di wallet ke Sepolia."
      );
    }
    // Refresh provider setelah switch
    return sendVoteToBlockchain({ candidateId, schnorrSignature, zkpProof });
  }
  await provider.send("eth_requestAccounts", []); // Ensure wallet is connected
  const signer = provider.getSigner();
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  // Panggil fungsi vote di smart contract
  const tx = await contract.vote(candidateId, schnorrSignature, zkpProof);
  await tx.wait(); // Tunggu konfirmasi
  return tx.hash;
}

// Fungsi untuk mengambil jumlah suara dari smart contract
export async function getVotesCountFromBlockchain(
  candidateId: number
): Promise<number> {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask is not available");
  }
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  // Pastikan wallet di Sepolia
  const network = await provider.getNetwork();
  if (network.chainId !== 11155111) {
    throw new Error("Pastikan wallet kamu di jaringan Sepolia");
  }
  const contract = new ethers.Contract(
    CONTRACT_ADDRESS,
    CONTRACT_ABI,
    provider
  );
  const count = await contract.getVotesCount(candidateId);
  return Number(count);
}
