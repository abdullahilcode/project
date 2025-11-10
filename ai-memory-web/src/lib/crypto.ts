"use server";

import { randomBytes, webcrypto } from "node:crypto";

const subtle = webcrypto.subtle;

export interface EncryptionEnvelope {
  ciphertext: string;
  iv: string;
  tag?: string;
  algorithm: "AES-GCM";
  version: string;
}

function getKeyMaterial(secretKey?: string) {
  const key = secretKey ?? process.env.AES_ENCRYPTION_KEY;
  if (!key) {
    throw new Error(
      "AES encryption key is not configured. Set AES_ENCRYPTION_KEY env variable.",
    );
  }
  const buffer = Buffer.from(key.padEnd(32, "0")).subarray(0, 32);
  return subtle.importKey("raw", buffer, { name: "AES-GCM" }, false, [
    "encrypt",
    "decrypt",
  ]);
}

export async function encryptPayload<T>(
  payload: T,
  secretKey?: string,
): Promise<EncryptionEnvelope> {
  const key = await getKeyMaterial(secretKey);
  const iv = randomBytes(12);
  const encoded = new TextEncoder().encode(JSON.stringify(payload));
  const ciphertext = await subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoded,
  );
  return {
    ciphertext: Buffer.from(ciphertext).toString("base64"),
    iv: iv.toString("base64"),
    algorithm: "AES-GCM",
    version: "v1",
  };
}

export async function decryptPayload<T>(
  envelope: EncryptionEnvelope,
  secretKey?: string,
): Promise<T> {
  const key = await getKeyMaterial(secretKey);
  const plaintext = await subtle.decrypt(
    {
      name: "AES-GCM",
      iv: Buffer.from(envelope.iv, "base64"),
    },
    key,
    Buffer.from(envelope.ciphertext, "base64"),
  );
  const decoded = new TextDecoder().decode(plaintext);
  return JSON.parse(decoded) as T;
}

export function isEncryptionEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_ENCRYPTION === "true";
}
