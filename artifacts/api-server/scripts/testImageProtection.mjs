import assert from "node:assert/strict";

const baseUrl = (process.env.API_BASE_URL || `http://127.0.0.1:${process.env.PORT || 8080}`).replace(/\/$/, "");

const catalogResponse = await fetch(`${baseUrl}/api/programs`);
assert.equal(catalogResponse.status, 200, "The public catalog should be available.");
const programs = await catalogResponse.json();
assert.ok(Array.isArray(programs), "The catalog response should be an array.");

for (const program of programs) {
  for (const key of ["imagePath", "objectPath", "uploadURL"]) {
    assert.equal(Object.hasOwn(program, key), false, `Public catalog must not expose ${key}.`);
  }
  assert.ok(
    program.imageUrl === "" || /^\/api\/programs\/\d+\/(?:image|poster\.svg)$/.test(program.imageUrl),
    "Public catalog image URLs must remain same-origin application routes.",
  );
  assert.equal(JSON.stringify(program).includes("/objects/"), false, "Public catalog must not expose object storage paths.");
}

const anonymousUpload = await fetch(`${baseUrl}/api/program-images/upload`, {
  method: "POST",
  headers: { "Content-Type": "image/jpeg" },
  body: Buffer.from([0xff, 0xd8, 0xff]),
});
assert.ok(
  [401, 403].includes(anonymousUpload.status),
  "Anonymous callers must not be able to upload research images.",
);

const imageProgram = programs.find((program) => program.imageUrl);
if (imageProgram) {
  const imageResponse = await fetch(`${baseUrl}${imageProgram.imageUrl}`, { redirect: "manual" });
  assert.equal(imageResponse.status, 200, "The same-origin image route should serve the protected image.");
  assert.equal(imageResponse.headers.get("location"), null, "The image route must not redirect clients to a signed storage URL.");
  assert.match(imageResponse.headers.get("cache-control") || "", /no-store/, "Protected images must not be stored in browser caches.");
  assert.equal(imageResponse.headers.get("x-content-type-options"), "nosniff");
  assert.match(imageResponse.headers.get("content-disposition") || "", /^inline;/, "Protected images must use inline display.");
  assert.ok(["image/jpeg", "image/png", "image/webp", "image/svg+xml"].some((type) => (imageResponse.headers.get("content-type") || "").startsWith(type)));
  console.log("Verified protected image response headers.");
} else {
  console.log("No public image is available in this environment; skipped response-header assertion.");
}

console.log("Image protection checks passed.");