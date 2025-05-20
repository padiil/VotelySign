import { schnorr } from "@noble/curves/secp256k1";
// @ts-expect-error: snarkjs has no types
import * as snarkjs from "snarkjs";
import fs from "fs";
import path from "path";

// --- CACHE WASM & ZKEY BUFFER ---
let wasmBuffer: Buffer | null = null;
let zkeyBuffer: Buffer | null = null;

function getWasmBuffer() {
  if (!wasmBuffer) {
    wasmBuffer = fs.readFileSync(path.resolve(process.cwd(), "zkp/vote_range.wasm"));
  }
  return wasmBuffer;
}

function getZkeyBuffer() {
  if (!zkeyBuffer) {
    zkeyBuffer = fs.readFileSync(path.resolve(process.cwd(), "zkp/proving_key.zkey"));
  }
  return zkeyBuffer;
}

function isValidHexPrivateKey(key: string): boolean {
  // 32 bytes = 64 hex chars
  return typeof key === "string" && /^[0-9a-fA-F]{64}$/.test(key);
}

export async function schnorrSign(messageHex: string, privateKeyHex: string): Promise<string> {
  if (!isValidHexPrivateKey(privateKeyHex)) {
    throw new Error("Invalid private key: must be 32 bytes hex string");
  }
  const msgBytes = Uint8Array.from(Buffer.from(messageHex, "hex"));
  const sig = schnorr.sign(msgBytes, privateKeyHex);
  return typeof sig === "string" ? sig : Buffer.from(sig).toString("hex");
}

/**
 * Generate a real ZKP proof using snarkjs (Bulletproofs-like)
 * Uses path string to .wasm and .zkey for performance
 */
export async function generateBulletproof(candidateId: number): Promise<string> {
  // Pastikan input ke circuit adalah number
  const input = { x: Number(candidateId), min: 1, max: 100 };
  console.log('[ZKP] Input to fullProve:', input);

  let seconds = 0;
  const interval = setInterval(() => {
    seconds++;
    console.log(`[ZKP] Generating proof... ${seconds} detik berlalu`);
  }, 1000);

  console.time("ZKP fullProve");
  console.log("[ZKP] Mulai generate proof untuk candidateId:", candidateId);
  // GUNAKAN PATH STRING, BUKAN BUFFER
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    input,
    path.resolve(process.cwd(), "zkp/vote_range.wasm"),
    path.resolve(process.cwd(), "zkp/proving_key.zkey")
  );
  clearInterval(interval);
  console.timeEnd("ZKP fullProve");
  console.log("[ZKP] Proof selesai. Panjang proof:", JSON.stringify(proof).length, "publicSignals:", publicSignals);
  return JSON.stringify({ proof, publicSignals });
}
