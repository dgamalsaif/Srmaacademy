import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import vm from "node:vm";
import ts from "typescript";
import { insertResearchProgramSchema } from "../../../lib/db/src/schema/submissions";

const routeSource = readFileSync(new URL("../src/routes/programs.ts", import.meta.url), "utf8");
const patchSource = routeSource.slice(routeSource.indexOf('router.patch("/programs/:id"'), routeSource.indexOf('router.delete("/programs/:id"'));
const routeTree = ts.createSourceFile("patch.ts", patchSource, ts.ScriptTarget.Latest, true);
let updatePayload = "";
function visit(node: ts.Node) {
  if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)
    && node.expression.name.text === "set") {
    updatePayload = node.arguments[0].getText(routeTree);
  }
  ts.forEachChild(node, visit);
}
visit(routeTree);

test("each replacement persists a fresh version after schema validation", () => {
  assert.ok(updatePayload, "Exercise the actual PATCH update payload");
  const parsed = insertResearchProgramSchema.partial().parse({
    imagePath: "/objects/research-images/12345678-1234-1234-1234-123456789abc",
    updatedAt: new Date(),
  });
  assert.equal("updatedAt" in parsed, false, "Creation schema deliberately excludes timestamps");
  const previous = new Date(Date.now() + 5000);
  const saved = vm.runInNewContext(`(${updatePayload})`, {
    parsed: { data: parsed }, seatOverride: { value: {} }, current: { updatedAt: previous },
  });
  assert.equal(saved.imagePath, parsed.imagePath);
  assert.ok(saved.updatedAt.getTime() > previous.getTime());
  const second = vm.runInNewContext(`(${updatePayload})`, {
    parsed: { data: parsed }, seatOverride: { value: {} }, current: saved,
  });
  assert.ok(second.updatedAt.getTime() > saved.updatedAt.getTime(), "Rapid replacements cannot reuse a URL");
});

test("deletion and ordinary edits also persist the server-owned timestamp", () => {
  for (const data of [{ imagePath: "" }, { titleEn: "Updated title" }]) {
    const parsed = insertResearchProgramSchema.partial().parse(data);
    const previous = new Date("2026-01-01T00:00:00Z");
    const saved = vm.runInNewContext(`(${updatePayload})`, {
      parsed: { data: parsed }, seatOverride: { value: {} }, current: { updatedAt: previous },
    });
    assert.ok(saved.updatedAt.getTime() > previous.getTime());
    if ("imagePath" in data) assert.equal(saved.imagePath, "");
    else assert.equal("imagePath" in saved, false, "Editing text must preserve the existing image");
  }
});

const pickerSource = readFileSync(new URL("../../rspf-academia/src/components/ResearchImagePicker.tsx", import.meta.url), "utf8");
const handlers = ts.transpileModule(
  pickerSource.slice(pickerSource.indexOf("  const setUploadingState"), pickerSource.indexOf("  return (")),
  { compilerOptions: { target: ts.ScriptTarget.ES2022 } },
).outputText;

function createPicker(initialImageUrl = "/api/programs/154/image?v=old") {
  const state = { preview: initialImageUrl, error: "", parentError: "", token: null as string | null, uploading: false };
  const revoked: string[] = [];
  let sequence = 0;
  let response = { ok: true, status: 201, text: async () => JSON.stringify({ imageToken: "new-token" }) };
  const context = vm.createContext({
    ALLOWED_IMAGE_TYPES: new Set(["image/png"]), ALLOWED_IMAGE_EXTENSIONS: new Set([".png"]),
    MAX_IMAGE_SIZE: 10 * 1024 * 1024,
    previewObjectUrl: { current: null }, acceptedPreviewUrl: { current: initialImageUrl },
    fileInputRef: { current: { value: "" } },
    setPreviewUrl: (value: string) => { state.preview = value; },
    setError: (value: string) => { state.error = value; },
    onErrorChange: (value: string) => { state.parentError = value; },
    setUploading: (value: boolean) => { state.uploading = value; },
    onUploadingChange: () => {},
    onImageTokenChange: (value: string) => { state.token = value; },
    URL: { createObjectURL: () => `blob:image-${++sequence}`, revokeObjectURL: (url: string) => revoked.push(url) },
    buildApiUrl: (path: string) => path, fetch: async () => response,
  });
  vm.runInContext(`${handlers}\nglobalThis.upload = uploadImage; globalThis.remove = removeImage;`, context);
  return {
    state, revoked,
    upload: (file = { name: "replacement.png", type: "image/png", size: 100 }) => (context.upload as Function)(file),
    remove: () => (context.remove as Function)(),
    fail: () => { response = { ok: false, status: 503, text: async () => JSON.stringify({ error: "Storage unavailable" }) }; },
    succeed: () => { response = { ok: true, status: 201, text: async () => JSON.stringify({ imageToken: "new-token" }) }; },
  };
}

test("failed replacement restores the existing image and blocks saving", async () => {
  const picker = createPicker();
  picker.fail();
  await picker.upload();
  assert.equal(picker.state.preview, "/api/programs/154/image?v=old");
  assert.equal(picker.state.token, null);
  assert.equal(picker.state.parentError, "Storage unavailable");
  assert.equal(picker.state.uploading, false);
  assert.deepEqual(picker.revoked, ["blob:image-1"]);
});

test("a failed second upload preserves the previous successful preview and token", async () => {
  const picker = createPicker();
  await picker.upload();
  picker.fail();
  await picker.upload();
  assert.equal(picker.state.preview, "blob:image-1");
  assert.equal(picker.state.token, "new-token");
  assert.ok(picker.state.parentError);
  assert.deepEqual(picker.revoked, ["blob:image-2"]);
  picker.succeed();
  await picker.upload();
  assert.equal(picker.state.preview, "blob:image-3");
  assert.equal(picker.state.parentError, "");
  assert.deepEqual(picker.revoked, ["blob:image-2", "blob:image-1"]);
});

test("removal clears upload errors without resurrecting the deleted preview", async () => {
  const picker = createPicker();
  picker.fail();
  await picker.upload();
  picker.remove();
  assert.equal(picker.state.parentError, "");
  assert.equal(picker.state.token, "");
  await picker.upload();
  assert.equal(picker.state.preview, "");
  assert.equal(picker.state.token, "");
});

test("invalid files block saving until removed or replaced successfully", async () => {
  const picker = createPicker();
  await picker.upload({ name: "bad.heic", type: "image/heic", size: 100 });
  assert.ok(picker.state.parentError);
  assert.equal(picker.state.token, null);
  picker.remove();
  await picker.upload({ name: "big.png", type: "image/png", size: 11 * 1024 * 1024 });
  assert.ok(picker.state.parentError);
  await picker.upload();
  assert.equal(picker.state.parentError, "");
  assert.equal(picker.state.token, "new-token");
});

test("the actual admin form blocks submission while the picker reports an error", () => {
  const admin = readFileSync(new URL("../../rspf-academia/src/pages/AdminDashboard.tsx", import.meta.url), "utf8");
  assert.ok(admin.includes("onErrorChange={setImageError}"));
  assert.ok(admin.includes("if (imageError) {"));
  assert.ok(admin.includes("disabled={submitting || imageUploading || Boolean(imageError)}"));
});