import { schnorr } from "@noble/curves/secp256k1";

// --- CACHE WASM & ZKEY BUFFER ---
let wasmBuffer: Buffer | null = null;
let zkeyBuffer: Buffer | null = null;

function getWasmBuffer() {
  if (!wasmBuffer) {
    wasmBuffer = null; // Dummy implementation for browser compatibility
  }
  return wasmBuffer;
}

function getZkeyBuffer() {
  if (!zkeyBuffer) {
    zkeyBuffer = null; // Dummy implementation for browser compatibility
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

// Dummy ZKP generator untuk frontend/browser (tidak pakai snarkjs)
export async function generateBulletproof(candidateId: number): Promise<string> {
  // Return dummy proof, karena snarkjs tidak bisa di browser
  return JSON.stringify({ proof: "dummy", publicSignals: [candidateId, 1, 100] });
}
