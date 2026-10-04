import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import ts from "typescript";

const helperSource = readFileSync(new URL("../../artifacts/rspf-academia/src/lib/opportunityDisplay.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(helperSource, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
}).outputText;
const { getOpportunityRegistrationPath, getOpportunitySharePath, getOpportunityShareText } = await import(
  `data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`
);

test("sharing uses public metadata HTML without changing the registration destination", () => {
  assert.equal(getOpportunitySharePath(154), "/share/research/154");
  assert.equal(getOpportunityRegistrationPath(154), "/survey?rid=RES-2026-154");
});

test("share links also reach the registration flow in the frontend preview", () => {
  const app = readFileSync(new URL("../../artifacts/rspf-academia/src/App.tsx", import.meta.url), "utf8");
  assert.ok(app.includes('<Route path="/share/research/:id">'));
  assert.ok(app.includes("getOpportunityRegistrationPath(Number(params.id))"));
  assert.ok(app.includes('get("lang") === "en" ? "&lang=en" : ""'));
});

test("every opportunity copy/share control uses metadata HTML, including the manual fallback", () => {
  const portal = readFileSync(new URL("../../artifacts/rspf-academia/src/pages/ParticipantPortal.tsx", import.meta.url), "utf8");
  const detail = readFileSync(new URL("../../artifacts/rspf-academia/src/pages/ResearchDetail.tsx", import.meta.url), "utf8");
  assert.ok(portal.includes("getOpportunityShareText(opportunity, window.location.origin, language)"));
  assert.ok(portal.includes("getOpportunityShareText(opp, window.location.origin, language)"));
  assert.ok(portal.includes("navigator.clipboard.writeText(text)"));
  assert.ok(portal.includes("input.value = text"));
  assert.ok(portal.includes("onClick={() => handleCopyOppLink(opp)}"));
  assert.equal((detail.match(/getOpportunitySharePath\(research.id\)/g) || []).length, 2);
  assert.ok(detail.includes("getOpportunityRegistrationPath(research.id)"), "Direct registration remains available");
  const survey = readFileSync(new URL("../../artifacts/rspf-academia/src/pages/OpportunitySurvey.tsx", import.meta.url), "utf8");
  const admin = readFileSync(new URL("../../artifacts/rspf-academia/src/pages/AdminDashboard.tsx", import.meta.url), "utf8");
  assert.ok(survey.includes("getOpportunitySharePath(selectedOpp.id)"));
  assert.ok(admin.includes("getOpportunitySharePath(research.id)"));
});

test("share metadata has its own canonical URL while human redirection opens the combined survey", () => {
  const apiSource = readFileSync(new URL("../../artifacts/api-server/src/routes/programs.ts", import.meta.url), "utf8");
  const handler = apiSource.slice(apiSource.indexOf('router.get("/programs/:id/share"'), apiSource.indexOf('router.get("/programs/:id/share"') + 8500);
  assert.ok(handler.includes('const destination = `${origin}/survey?rid=RES-2026-${program.id}'));
  assert.ok(handler.includes('const shareUrl = `${origin}/share/research/${program.id}'));
  assert.ok(handler.includes('<meta property="og:url" content="${escapeHtml(shareUrl)}">'));
  assert.ok(handler.includes('<link rel="canonical" href="${escapeHtml(shareUrl)}">'));
  assert.ok(handler.includes('window.location.replace(${JSON.stringify(destination)})'));
  assert.ok(handler.includes('/api/programs/${program.id}/image?v=${imageVersion}'), "Use a publicly accessible raster image rather than an SVG poster");
  assert.ok(handler.includes('<meta property="og:title" content="${escapeHtml(previewTitle)}">'));
  assert.ok(handler.includes('<meta name="twitter:title" content="${escapeHtml(previewTitle)}">'));
  assert.ok(!handler.includes('<meta http-equiv="refresh"'), "Crawlers must not be redirected to generic survey metadata");
  assert.ok(handler.includes("[specialtyLine, detailDescription]"), "Specialty remains visible when additional details are hidden");
});

test("every copied announcement has the heading, English study title, specialty and its own share URL", () => {
  for (const id of [1, 158, 302, 999]) {
    assert.equal(getOpportunityShareText({
      id, titleEn: `Study ${id}`, titleAr: "دراسة", specialtyAr: "الطب النفسي", specialtyEn: "Psychiatry",
    }, "https://srmaacademy.com/"), [
      "فرصة بحثية جديدة", `Study ${id}`, "التخصص: الطب النفسي", `https://srmaacademy.com/share/research/${id}`,
    ].join("\n"));
  }
});

test("English sharing keeps the English specialty and registration language", () => {
  assert.equal(getOpportunityShareText({
    id: 158, titleEn: "Study", specialtyAr: "الطب النفسي", specialtyEn: "Psychiatry",
  }, "https://srmaacademy.com", "en"),
  "New research opportunity\nStudy\nSpecialty: Psychiatry\nhttps://srmaacademy.com/share/research/158?lang=en");
});

test("sharing never invents a missing specialty or translates the research title into Arabic", () => {
  assert.equal(getOpportunityShareText({id: 158, titleAr: "دراسة"}, "https://srmaacademy.com"),
    "فرصة بحثية جديدة\nResearch Opportunity RES-2026-158\nhttps://srmaacademy.com/share/research/158");
});

test("server preview summaries match the announcement format for every opportunity", async () => {
  const source = readFileSync(new URL("../../artifacts/api-server/src/lib/opportunityDisplay.ts", import.meta.url), "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
  }).outputText;
  const { getOpportunityShareSummary } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
  for (const id of [1, 158, 302]) {
    const program = {id, titleEn: `Study ${id}`, specialtyAr: "الطب النفسي", specialtyEn: "Psychiatry"};
    const ar = getOpportunityShareSummary(program);
    assert.equal(ar.previewTitle, `فرصة بحثية جديدة | Study ${id}`);
    assert.equal(ar.specialtyLine, "التخصص: الطب النفسي");
    assert.equal(getOpportunityShareSummary(program, true).previewTitle, `New research opportunity | Study ${id}`);
    assert.equal(getOpportunityShareSummary(program, true).specialtyLine, "Specialty: Psychiatry");
  }
});