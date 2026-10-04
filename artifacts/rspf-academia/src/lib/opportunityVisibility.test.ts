import { strict as assert } from "node:assert";
import { test } from "node:test";
import { getPublicImageUrl, isFieldVisible, normalizeHiddenFields } from "./opportunityVisibility";

test("display switches are independent and default to showing information", () => {
  assert.equal(isFieldVisible({}, "description"), true);
  const opportunity = { hiddenFields: ["description", "price"], imageUrl: "/api/programs/1/poster.svg?v=2" };
  assert.equal(isFieldVisible(opportunity, "description"), false);
  assert.equal(isFieldVisible(opportunity, "price"), false);
  assert.equal(isFieldVisible(opportunity, "image"), true);
  assert.equal(isFieldVisible(opportunity, "specialty"), true);
  assert.equal(getPublicImageUrl(opportunity), opportunity.imageUrl);
  assert.equal(getPublicImageUrl({ ...opportunity, hiddenFields: ["image"] }), undefined);
  assert.deepEqual(normalizeHiddenFields(["price", "price", "unknown"]), ["price"]);
});