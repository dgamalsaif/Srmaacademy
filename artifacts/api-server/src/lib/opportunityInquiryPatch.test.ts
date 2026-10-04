import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { validateInquiryPatch } from "./opportunityInquiryPatch";
// Load the pure frontend helper at runtime without pulling a different artifact
// into the API project's TypeScript rootDir.
const { DEFAULT_SITE_CONTENT_SETTINGS, getOpportunityInquiryLink } = await import(
  new URL("../../../rspf-academia/src/lib/siteContentSettings.ts", import.meta.url).href
);

const brand = DEFAULT_SITE_CONTENT_SETTINGS.brand;
test("inquiry saves accept only their own fields, not global settings or sharing", () => {
  assert.deepEqual(validateInquiryPatch({opportunityInquiryEnabled:false}), {opportunityInquiryEnabled:false});
  for (const input of [{primaryColor:"#abcdef"}, {whatsapp:"966500000001"}, {brand:{}}, {showOpportunityDetails:true}, {opportunityContactType:"email"}]) {
    assert.throws(() => validateInquiryPatch(input));
  }
});
test("all five channels validate, and invalid destinations fail explicitly", () => {
  for (const [channel,key,value] of [
    ["whatsapp","opportunityInquiryWhatsapp","966500000001"],
    ["email","opportunityInquiryEmail","inquiry@example.org"],
    ["telegram","opportunityInquiryTelegram","@test_inquiry"],
    ["phone","opportunityInquiryPhone","+966500000001"],
    ["custom_url","opportunityInquiryCustomUrl","https://example.org/inquiry"],
  ]) assert.doesNotThrow(() => validateInquiryPatch({opportunityInquiryChannel:channel,[key]:value}));
  for (const [channel,key,value] of [
    ["whatsapp","opportunityInquiryWhatsapp","not a number"],
    ["email","opportunityInquiryEmail","invalid"],
    ["telegram","opportunityInquiryTelegram","https://evil.example/chat"],
    ["custom_url","opportunityInquiryCustomUrl","javascript:alert(1)"],
    ["whatsapp","opportunityInquiryWhatsapp",""],
  ]) assert.throws(() => validateInquiryPatch({opportunityInquiryChannel:channel,[key]:value}));
});
test("WhatsApp uses the edited number and substitutes the real title in both languages", () => {
  const title = "Clinical Outcomes $& — 2026";
  const edited = {...brand,opportunityInquiryWhatsapp:"0500000001",
    opportunityInquiryMessageAr:"استفسار: title",opportunityInquiryMessageEn:"Hello: {title}",opportunityInquiryLabelAr:"اسألنا"};
  for (const language of ["ar","en"] as const) {
    const link = getOpportunityInquiryLink(edited,title,language)!;
    const url = new URL(link.href);
    assert.equal(url.pathname,"/966500000001");
    assert.ok(url.searchParams.get("text")!.includes(title));
    assert.equal(link.labelAr,"اسألنا");
  }
});
test("email, Telegram username/URL/phone, telephone and custom links target the selected contact", () => {
  const title = "Contact Test Study";
  const email = getOpportunityInquiryLink({...brand,opportunityInquiryChannel:"email",opportunityInquiryEmail:"test@example.org"},title,"en")!;
  assert.ok(email.href.startsWith("mailto:test@example.org?"));
  assert.ok(decodeURIComponent(email.href).includes(title));
  for (const value of ["@test_inquiry","https://t.me/test_inquiry","+966500000001"]) {
    const tg = getOpportunityInquiryLink({...brand,opportunityInquiryChannel:"telegram",opportunityInquiryTelegram:value},title)!;
    assert.equal(new URL(tg.href).hostname,"t.me");
    assert.ok(new URL(tg.href).searchParams.get("text")!.includes(title));
  }
  assert.equal(getOpportunityInquiryLink({...brand,opportunityInquiryChannel:"phone",opportunityInquiryPhone:"+966500000001"},title)!.href,"tel:+966500000001");
  assert.equal(getOpportunityInquiryLink({...brand,opportunityInquiryChannel:"custom_url",opportunityInquiryCustomUrl:"https://example.org/inquiry"},title)!.href,"https://example.org/inquiry");
  assert.equal(getOpportunityInquiryLink({...brand,opportunityInquiryEnabled:false},title),null);
});
test("scoped persistence uses an atomic brand merge, not replacement of site settings", () => {
  const source = readFileSync(new URL("./siteContentSettings.ts",import.meta.url),"utf8");
  const method = source.slice(source.indexOf("export async function saveOpportunityInquirySettings"));
  assert.match(method,/jsonb_set/);
  assert.match(method,/'\{brand\}'/);
  assert.match(method,/\|\| \$\{JSON\.stringify\(patch\)\}/);
  assert.match(method,/\.returning\(\)/);
});