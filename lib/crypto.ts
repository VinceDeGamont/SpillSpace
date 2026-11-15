import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";

const SESSION_SECRET =
  process.env.SPILLSPACE_SESSION_SECRET ??
  "spillspace-session-secret-key-2026-psikologi-kerja";

const PSYCH_VAULT_SECRET =
  process.env.SPILLSPACE_PSYCH_VAULT_SECRET ??
  "spillspace-psych-vault-separation-secret-2026-uupdp";

const REFLECTION_ENC_KEY = createHash("sha256")
  .update(
    process.env.SPILLSPACE_REFLECTION_KEY ??
      "spillspace-aes256-gcm-reflection-key-2026",
  )
  .digest();

export const CONSENT_DOCUMENT_VERSION = "SpillSpace-Clickwrap-v1.0 (15/11/2026)";

export function hashPassword(plain: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(plain, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

export function verifyPassword(plain: string, storedHash: string | null): boolean {
  if (!storedHash || !storedHash.includes(":")) return false;
  const [salt, keyHex] = storedHash.split(":");
  const keyBuf = Buffer.from(keyHex, "hex");
  const derivedBuf = scryptSync(plain, salt, 64);
  if (keyBuf.length !== derivedBuf.length) return false;
  return timingSafeEqual(keyBuf, derivedBuf);
}

/**
 * Menghasilkan token pseudonim satu-arah untuk memisahkan Lapisan Data Identitas
 * dari Lapisan Data Psikologis (sesuai Pasal 9 ayat 1 Perjanjian).
 */
export function derivePsychSubjectToken(employeeId: string): string {
  return createHmac("sha256", PSYCH_VAULT_SECRET)
    .update(employeeId.trim().toUpperCase())
    .digest("hex");
}

/**
 * Menghasilkan kode anonim konsisten (mis. Anon-#4821) untuk tampilan Psikolog Mitra
 * tanpa pernah membuka NIK atau nama asli karyawan.
 */
export function deriveAnonCode(employeeId: string): string {
  const digest = createHmac("sha256", PSYCH_VAULT_SECRET + ":anon")
    .update(employeeId.trim().toUpperCase())
    .digest("hex");
  const num = (parseInt(digest.slice(0, 8), 16) % 9000) + 1000;
  return `Anon-#${num}`;
}

/**
 * Enkripsi AES-256-GCM untuk kolom isian bebas / curhatan saat disimpan di database
 * (sesuai Pasal 9 ayat 2 Perjanjian: enkripsi data saat disimpan).
 */
export function encryptReflection(plainText: string): string {
  const trimmed = plainText.trim();
  if (!trimmed) return "";
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", REFLECTION_ENC_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(trimmed, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decryptReflection(cipherText: string | null | undefined): string {
  if (!cipherText) return "";
  try {
    const parts = cipherText.split(":");
    if (parts.length !== 3) return "";
    const [ivHex, tagHex, dataHex] = parts;
    const decipher = createDecipheriv(
      "aes-256-gcm",
      REFLECTION_ENC_KEY,
      Buffer.from(ivHex, "hex"),
    );
    decipher.setAuthTag(Buffer.from(tagHex, "hex"));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(dataHex, "hex")),
      decipher.final(),
    ]);
    return decrypted.toString("utf8");
  } catch {
    return "";
  }
}

export type SessionPayload = {
  employeeId: string;
  role: "employee" | "hr";
  exp: number;
};

export function signSessionToken(payload: SessionPayload): string {
  const data = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const sig = createHmac("sha256", SESSION_SECRET).update(data).digest("base64url");
  return `${data}.${sig}`;
}

export function verifySessionToken(token: string | undefined | null): SessionPayload | null {
  if (!token || !token.includes(".")) return null;
  try {
    const [data, sig] = token.split(".");
    const expectedSig = createHmac("sha256", SESSION_SECRET)
      .update(data)
      .digest("base64url");
    const sigBuf = Buffer.from(sig);
    const expBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }
    const parsed = JSON.parse(Buffer.from(data, "base64url").toString("utf8")) as SessionPayload;
    if (!parsed.employeeId || typeof parsed.exp !== "number" || Date.now() > parsed.exp) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}
