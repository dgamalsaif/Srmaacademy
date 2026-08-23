import { randomUUID } from "node:crypto";

const REPLIT_SIDECAR_ENDPOINT = "http://127.0.0.1:1106";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const IMAGE_PATH_PREFIX = "/objects/research-images/";

type SignedMethod = "GET" | "PUT";

export async function requestResearchImageUpload(input: {
  size: unknown;
  contentType: unknown;
}) {
  const size = typeof input.size === "number" ? input.size : Number(input.size);
  const contentType = typeof input.contentType === "string" ? input.contentType.toLowerCase() : "";

  if (!Number.isInteger(size) || size < 1 || size > MAX_IMAGE_BYTES) {
    throw new ResearchImageValidationError("يجب ألا يتجاوز حجم الصورة 5 ميغابايت.");
  }
  if (!ALLOWED_IMAGE_TYPES.has(contentType)) {
    throw new ResearchImageValidationError("الصور المسموح بها هي JPG أو PNG أو WebP فقط.");
  }

  const objectPath = `${IMAGE_PATH_PREFIX}${randomUUID()}`;
  const uploadURL = await signObjectUrl({
    objectPath,
    method: "PUT",
    ttlSeconds: 15 * 60,
  });

  return { uploadURL, objectPath, contentType };
}

export async function getResearchImageUrl(objectPath: string) {
  assertResearchImagePath(objectPath);
  return signObjectUrl({
    objectPath,
    method: "GET",
    ttlSeconds: 10 * 60,
  });
}

export function assertResearchImagePath(objectPath: string) {
  if (!/^\/objects\/research-images\/[0-9a-f-]{36}$/i.test(objectPath)) {
    throw new ResearchImageValidationError("مسار الصورة غير صالح.");
  }
}

export class ResearchImageValidationError extends Error {}

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