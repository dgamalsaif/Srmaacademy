import { strict as assert } from "node:assert";
import { test } from "node:test";
import { getOpportunityVisibility, saveOpportunityVisibility } from "./opportunityVisibility";

test("per-opportunity visibility writes remain independent of other opportunities and site settings", async () => {
  // In-memory query doubles only; never connect to or modify the project's database.
  const siteSettings = { brand: { opportunityInquiryChannel: "email" }, showOpportunityDetails: true };
  const records = new Map<string, Record<string, unknown>>([["site_content", siteSettings]]);
  const transaction = {
    insert: () => ({
      values: (record: { key: string; value: Record<string, unknown> }) => ({
        onConflictDoUpdate: async () => { records.set(record.key, record.value); },
      }),
    }),
  };
  await saveOpportunityVisibility(transaction, 1, ["seats", "price"]);
  await saveOpportunityVisibility(transaction, 2, ["description"]);
  assert.deepEqual(records.get("opportunity_display:1"), { hiddenFields: ["seats", "price"] });
  assert.deepEqual(records.get("opportunity_display:2"), { hiddenFields: ["description"] });
  await saveOpportunityVisibility(transaction, 1, []);
  assert.deepEqual(records.get("opportunity_display:1"), { hiddenFields: [] });
  assert.deepEqual(records.get("opportunity_display:2"), { hiddenFields: ["description"] });
  assert.equal(records.get("site_content"), siteSettings);

  const reader = {
    select: () => ({
      from: () => ({
        where: async () => [...records].filter(([key]) => key.startsWith("opportunity_display:"))
          .map(([key, value]) => ({ key, value })),
      }),
    }),
  };
  const loaded = await getOpportunityVisibility([1, 2], reader);
  assert.deepEqual(loaded.get(1), []);
  assert.deepEqual(loaded.get(2), ["description"]);
  assert.equal(loaded.get(3), undefined);
  assert.equal((await getOpportunityVisibility([], reader)).size, 0);
});