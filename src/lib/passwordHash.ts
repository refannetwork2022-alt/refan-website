// Sub-admin passwords are stored as PBKDF2-SHA256 hashes, never as readable text.
// Same format as api/_lib/firebase.ts (which checks them at sign-in): pbkdf2$<iterations>$<salt b64>$<hash b64>
const ITERATIONS = 100000;

const toB64 = (bytes: ArrayBuffer | Uint8Array) => btoa(String.fromCharCode(...new Uint8Array(bytes)));

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations: ITERATIONS }, key, 256);
  return `pbkdf2$${ITERATIONS}$${toB64(salt)}$${toB64(bits)}`;
}
