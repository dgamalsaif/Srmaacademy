import { strict as assert } from "node:assert";
import { test } from "node:test";
import { DEFAULT_SITE_CONTENT_SETTINGS, getSelectedInquiryChannels, buildOpportunityInquiryLinks } from "./siteContentSettings";

test("one, two and all inquiry channels remain independent with correct targets", () => {
  const brand = { ...DEFAULT_SITE_CONTENT_SETTINGS.brand, opportunityInquiryEnabled: true,
    opportunityInquiryWhatsapp: "12025550122", opportunityInquiryEmail: "inquiry@example.org",
    opportunityInquiryTelegram: "ExampleResearch", participantForwardTarget: "12025550133" };
  for (const channels of [["whatsapp"], ["whatsapp", "email"], ["whatsapp", "email", "telegram"]] as const) {
    const links = buildOpportunityInquiryLinks({ ...brand, opportunityInquiryChannels: [...channels] }, "Example study", "en");
    assert.deepEqual(links.map(link => link.channel), [...channels]);
    assert.match(links[0].href, /12025550122/);
    if (channels.length > 1) assert.match(links[1].href, /^mailto:inquiry@example\.org/);
    if (channels.length > 2) assert.match(links[2].href, /^https:\/\/t\.me\/ExampleResearch/);
  }
  assert.deepEqual(getSelectedInquiryChannels({ ...brand, opportunityInquiryChannel: "email" }), ["email"]);
  assert.equal(buildOpportunityInquiryLinks({ ...brand, opportunityInquiryChannels: [] }).length, 0);
  assert.equal(buildOpportunityInquiryLinks({ ...brand, opportunityInquiryChannels: ["whatsapp"], opportunityInquiryWhatsapp: "" }).length, 0);
  assert.equal(buildOpportunityInquiryLinks({ ...brand, opportunityInquiryChannels: ["email"], opportunityInquiryEnabled: false }).length, 0);
});