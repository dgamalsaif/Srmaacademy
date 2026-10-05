import { strict as assert } from "node:assert";
import { test } from "node:test";
import { validateBatchProgramScope, validateBatchProgramUpdates } from "./batchProgramUpdate";

test("bulk update supports selected, all and category scopes without silently ignoring invalid selections", () => {
  assert.deepEqual(validateBatchProgramScope({ ids: [2, 1, 2] }), { all: false, ids: [1, 2], category: undefined });
  assert.deepEqual(validateBatchProgramScope({ all: true }), { all: true, ids: [], category: undefined });
  assert.equal(validateBatchProgramScope({ all: true, category: "active" }).category, "active");
  for (const bad of [{}, { ids: [] }, { ids: [0] }, { ids: ["1"] }, { all: true, category: "unknown" }]) {
    assert.throws(() => validateBatchProgramScope(bad));
  }
});

test("bulk content updates are opt-in and retain clearing, visibility and list semantics", () => {
  assert.deepEqual(validateBatchProgramUpdates({ descriptionEn: "", supervisor: " Example ", benefits: [" One ", "Two"], hiddenFields: [] }), {
    descriptionEn: "", supervisor: "Example", benefits: "One|Two", hiddenFields: [],
  });
  assert.deepEqual(validateBatchProgramUpdates({ titleEn: "English title", journalIssn: "1234-5678", imageToken: "" }), {
    titleEn: "English title", journalIssn: "1234-5678", imageToken: "",
  });
  assert.deepEqual(validateBatchProgramUpdates({ priceOriginalSar: 1000 }), { priceOriginalSar: 1000 });
});

test("bulk update rejects hidden server fields, unknown aliases and invalid values rather than partially applying", () => {
  for (const bad of [{}, [], { id: 1 }, { totalSeats: 50 }, { firstAuthorSeatsLeft: 5 }, { updatedAt: "now" },
    { title: "Alias" }, { imagePath: "/other-image" }, { priceOriginalSar: 1.5 }, { priceDiscountedSar: -1 },
    { seatsLeft: 16 }, { titleEn: "" }, { hiddenFields: ["not-a-field"] }, { benefits: [1] }]) {
    assert.throws(() => validateBatchProgramUpdates(bad));
  }
});