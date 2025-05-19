import { schnorr } from "@noble/curves/secp256k1";
// @ts-expect-error: snarkjs has no types
import * as snarkjs from "snarkjs";

function isValidHexPrivateKey(key: string): boolean {
  // 32 bytes = 64 hex chars
  return typeof key === "string" && /^[0-9a-fA-F]{64}$/.test(key);
}

/**
 * Schnorr signature using @noble/curves/secp256k1
 * @param messageHex - Hex string of the message hash (32 bytes)
 * @param privateKeyHex - Hex string of the private key (32 bytes)
 * @returns Hex string of the Schnorr signature
 */
export async function schnorrSign(messageHex: string, privateKeyHex: string): Promise<string> {
  if (!isValidHexPrivateKey(privateKeyHex)) {
    throw new Error("Invalid private key: must be 32 bytes hex string");
  }
  const msgBytes = Uint8Array.from(Buffer.from(messageHex, "hex"));
  const sig = schnorr.sign(msgBytes, privateKeyHex);
  return typeof sig === "string" ? sig : Buffer.from(sig).toString("hex");
}

/**
 * Generate a zero-knowledge proof (ZKP) using snarkjs (template for Bulletproofs-like proof)
 * @param value - Value to prove (e.g., candidateId)
 * @returns Stringified proof (for now, placeholder)
 */
export async function generateBulletproof(value: number): Promise<string> {
  // TODO: Implement real ZKP circuit and proof generation with snarkjs
  // Example: const proof = await snarkjs.groth16.fullProve({ in: value }, "circuit.wasm", "proving_key.zkey");
  // return JSON.stringify(proof);
  return `bulletproof-proof-for-${value}`;
}
