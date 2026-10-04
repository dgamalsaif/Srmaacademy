import assert from "node:assert/strict";
import { after, test } from "node:test";
import { pool } from "@workspace/db";
import { getEnglishOpportunityTitle } from "./opportunityDisplay";
import { DEFAULT_SITE_CONTENT_SETTINGS, sanitizeSiteContentSettings } from "./siteContentSettings";

after(async () => { await pool?.end(); });

test("opportunity titles use English, including legacy English titles", () => {
  assert.equal(getEnglishOpportunityTitle({ id: 128, titleEn: " English study ", titleAr: "دراسة" }), "English study");
  assert.equal(getEnglishOpportunityTitle({ id: 128, titleEn: "", titleAr: "Legacy English study" }), "Legacy English study");
  assert.equal(getEnglishOpportunityTitle({ id: 128, titleEn: "دراسة", titleAr: "دراسة" }), "Research Opportunity RES-2026-128");
});

test("the global details setting preserves false and true through JSON saves", () => {
  for (const showOpportunityDetails of [false, true]) {
    const saved = sanitizeSiteContentSettings({ ...DEFAULT_SITE_CONTENT_SETTINGS, showOpportunityDetails });
    const loaded = sanitizeSiteContentSettings(JSON.parse(JSON.stringify(saved)));
    assert.equal(loaded.showOpportunityDetails, showOpportunityDetails);
  }
  assert.equal(sanitizeSiteContentSettings({}).showOpportunityDetails, true);
  assert.equal(sanitizeSiteContentSettings({ showOpportunityDetails: "false" }).showOpportunityDetails, true);
});

test("old title-language settings cannot bring back Arabic research titles", () => {
  assert.equal(DEFAULT_SITE_CONTENT_SETTINGS.participantTitleLanguage, "english");
  assert.equal(DEFAULT_SITE_CONTENT_SETTINGS.coordinatorTitleLanguage, "english");
  const settings = sanitizeSiteContentSettings({
    ...DEFAULT_SITE_CONTENT_SETTINGS,
    participantTitleLanguage: "both",
    coordinatorTitleLanguage: "arabic",
  });
  assert.equal(settings.participantTitleLanguage, "english");
  assert.equal(settings.coordinatorTitleLanguage, "english");
  assert.equal(settings.brand.siteNameAr, DEFAULT_SITE_CONTENT_SETTINGS.brand.siteNameAr);
});