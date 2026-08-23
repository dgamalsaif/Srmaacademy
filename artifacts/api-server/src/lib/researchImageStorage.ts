import { createCipheriv, createDecipheriv, createHash, randomBytes, randomUUID } from "node:crypto";

const REPLIT_SIDECAR_ENDPOINT = "http://127.0.0.1:1106";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const IMAGE_PATH_PREFIX = "/objects/research-images/";
const IMAGE_DISPLAY_URL_TTL_SECONDS = 2 * 60;
const IMAGE_UPLOAD_URL_TTL_SECONDS = 60;
const IMAGE_UPLOAD_TOKEN_TTL_SECONDS = 15 * 60;

type SignedMethod = "GET" | "PUT";

export async function uploadResearchImage(input: {
  data: Buffer;
  contentType: unknown;
}) {
  const contentType = validateResearchImage(input.data, input.contentType);

  const objectPath = `${IMAGE_PATH_PREFIX}${randomUUID()}`;
  const uploadURL = await signObjectUrl({
    objectPath,
    method: "PUT",
    ttlSeconds: IMAGE_UPLOAD_URL_TTL_SECONDS,
  });
  const uploadResponse = await fetch(uploadURL, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: input.data,
    signal: AbortSignal.timeout(30_000),
  });
  if (!uploadResponse.ok) {
    throw new Error(`Failed to upload research image (status ${uploadResponse.status}).`);
  }

  return {
    imageToken: encryptImageUploadToken({
      objectPath,
      expiresAt: Date.now() + IMAGE_UPLOAD_TOKEN_TTL_SECONDS * 1000,
    }),
  };
}

export async function getResearchImageUrl(objectPath: string) {
  assertResearchImagePath(objectPath);
  return signObjectUrl({
    objectPath,
    method: "GET",
    ttlSeconds: IMAGE_DISPLAY_URL_TTL_SECONDS,
  });
}

export function resolveResearchImageUploadToken(token: unknown) {
  if (typeof token !== "string" || !token.trim()) {
    throw new ResearchImageValidationError("رمز الصورة غير صالح أو انتهت صلاحيته.");
  }

  try {
    const [version, iv, tag, ciphertext] = token.split(".");
    if (version !== "v1" || !iv || !tag || !ciphertext) throw new Error("Invalid image token.");
    const decipher = createDecipheriv("aes-256-gcm", getImageTokenKey(), Buffer.from(iv, "base64url"));
    decipher.setAuthTag(Buffer.from(tag, "base64url"));
    const payload = JSON.parse(Buffer.concat([
      decipher.update(Buffer.from(ciphertext, "base64url")),
      decipher.final(),
    ]).toString("utf8")) as { objectPath?: unknown; expiresAt?: unknown };

    if (typeof payload.expiresAt !== "number" || payload.expiresAt < Date.now() || typeof payload.objectPath !== "string") {
      throw new Error("Expired image token.");
    }
    assertResearchImagePath(payload.objectPath);
    return payload.objectPath;
  } catch {
    throw new ResearchImageValidationError("رمز الصورة غير صالح أو انتهت صلاحيته.");
  }
}

export function assertResearchImagePath(objectPath: string) {
  if (!/^\/objects\/research-images\/[0-9a-f-]{36}$/i.test(objectPath)) {
    throw new ResearchImageValidationError("مسار الصورة غير صالح.");
  }
}

export class ResearchImageValidationError extends Error {}

function validateResearchImage(data: Buffer, rawContentType: unknown) {
  const contentType = typeof rawContentType === "string"
    ? rawContentType.split(";")[0].trim().toLowerCase()
    : "";
  const size = data.length;
  if (!Number.isInteger(size) || size < 1 || size > MAX_IMAGE_BYTES) {
    throw new ResearchImageValidationError("يجب ألا يتجاوز حجم الصورة 5 ميغابايت.");
  }
  if (!ALLOWED_IMAGE_TYPES.has(contentType) || !hasExpectedImageSignature(data, contentType)) {
    throw new ResearchImageValidationError("الصور المسموح بها هي JPG أو PNG أو WebP فقط.");
  }
  return contentType;
}

function hasExpectedImageSignature(data: Buffer, contentType: string) {
  if (contentType === "image/jpeg") {
    return data.length >= 3 && data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff;
  }
  if (contentType === "image/png") {
    return data.length >= 8
      && data.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  }
  return data.length >= 12
    && data.subarray(0, 4).equals(Buffer.from("RIFF"))
    && data.subarray(8, 12).equals(Buffer.from("WEBP"));
}

function encryptImageUploadToken(payload: { objectPath: string; expiresAt: number }) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getImageTokenKey(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(JSON.stringify(payload), "utf8"),
    cipher.final(),
  ]);
  return [
    "v1",
    iv.toString("base64url"),
    cipher.getAuthTag().toString("base64url"),
    ciphertext.toString("base64url"),
  ].join(".");
}

function getImageTokenKey() {
  const secret = process.env["SESSION_SECRET"];
  if (!secret) throw new Error("SESSION_SECRET is required to protect research image uploads.");
  return createHash("sha256").update("srma-research-image-upload-token\0").update(secret).digest();
}

async function signObjectUrl({
  objectPath,
  method,
  ttlSeconds,
}: {
  objectPath: string;
  method: SignedMethod;
  ttlSeconds: number;
}) {
  const { bucketName, privatePrefix } = getStorageLocation();
  const objectName = `${privatePrefix}/research-images/${objectPath.slice(IMAGE_PATH_PREFIX.length)}`;

  const response = await fetch(`${REPLIT_SIDECAR_ENDPOINT}/object-storage/signed-object-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      bucket_name: bucketName,
      object_name: objectName,
      method,
      expires_at: new Date(Date.now() + ttlSeconds * 1000).toISOString(),
    }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) {
    throw new Error(`Failed to sign research image URL (status ${response.status}).`);
  }

  const body = await response.json() as { signed_url?: string };
  if (!body.signed_url) {
    throw new Error("Object storage did not return a signed URL.");
  }
  return body.signed_url;
}

function getStorageLocation() {
  const raw = (process.env["PRIVATE_OBJECT_DIR"] || "").replace(/^\/+|\/+$/g, "");
  const [bucketName, ...prefixParts] = raw.split("/");
  if (!bucketName || prefixParts.length === 0) {
    throw new Error("PRIVATE_OBJECT_DIR is not configured.");
  }

  return { bucketName, privatePrefix: prefixParts.join("/") };
}