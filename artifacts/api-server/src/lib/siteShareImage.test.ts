import assert from "node:assert/strict";
import { test } from "node:test";
import { siteShareImageSource, siteShareImageVersion, validateSocialShareImageUrl } from "./siteShareImage";

test("sharing uses the actual animated-logo GIF or owner's image, never MP4", () => {
  assert.equal(siteShareImageSource({ logoUrl: "/srma-animated-logo.mp4" }), "/srma-share-logo.gif");
  assert.equal(siteShareImageSource({ logoUrl: "/srma-animated-logo.mp4" }, "WhatsApp/2"), "/srma-share-logo.jpg");
  assert.equal(siteShareImageSource({ logoUrl: "https://example.org/logo.gif" }), "https://example.org/logo.gif");
  assert.equal(siteShareImageSource({ logoUrl: "/srma-animated-logo.mp4", socialShareImageUrl: "/objects/uploads/research-images/example.jpg" }), "/objects/uploads/research-images/example.jpg");
  assert.equal(siteShareImageSource({ socialShareImageUrl: "https://example.org/custom.png" }), "https://example.org/custom.png");
  assert.equal(siteShareImageSource({ logoUrl: "/custom.mp4" }), "/srma-logo.jpg");
});

test("image URLs reject video, unsafe URLs and recursive preview routes", () => {
  for (const value of ["javascript:alert(1)", "//evil.test/image", "/../image.png", "https://user:pass@example.org/image.png", "/movie.mp4", "/api/site-share-image", "https://example.org/api/site-share-image?v=old", "/image\\file.png"]) {
    assert.throws(() => validateSocialShareImageUrl(value));
  }
  assert.equal(validateSocialShareImageUrl(""), "");
  assert.equal(validateSocialShareImageUrl("/custom.gif"), "/custom.gif");
});

test("two replacements and same-URL saves get different crawler image versions", () => {
  const first = { socialShareImageUrl: "/first.jpg", socialShareImageVersion: "first" };
  assert.notEqual(siteShareImageVersion(first), siteShareImageVersion({ ...first, socialShareImageUrl: "/second.jpg" }));
  assert.notEqual(siteShareImageVersion(first), siteShareImageVersion({ ...first, socialShareImageVersion: "second" }));
});