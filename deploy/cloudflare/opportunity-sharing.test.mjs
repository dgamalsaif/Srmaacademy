import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import ts from "typescript";

const helperSource = readFileSync(new URL("../../artifacts/rspf-academia/src/lib/opportunityDisplay.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(helperSource, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
}).outputText;
const { getOpportunityRegistrationPath, getOpportunitySharePath } = await import(
  `data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`
);

test("sharing uses public metadata HTML without changing the registration destination", () => {
  assert.equal(getOpportunitySharePath(154), "/share/research/154");
  assert.equal(getOpportunityRegistrationPath(154), "/survey?rid=RES-2026-154");
});

test("share links also reach the registration flow in the frontend preview", () => {
  const app = readFileSync(new URL("../../artifacts/rspf-academia/src/App.tsx", import.meta.url), "utf8");
  assert.ok(app.includes('<Route path="/share/research/:id">'));
  assert.ok(app.includes("<Redirect to={getOpportunityRegistrationPath(Number(params.id))} />"));
});

test("every opportunity copy/share control uses metadata HTML, including the manual fallback", () => {
  const portal = readFileSync(new URL("../../artifacts/rspf-academia/src/pages/ParticipantPortal.tsx", import.meta.url), "utf8");
  const detail = readFileSync(new URL("../../artifacts/rspf-academia/src/pages/ResearchDetail.tsx", import.meta.url), "utf8");
  assert.equal((portal.match(/getOpportunitySharePath\(oppId\)/g) || []).length, 1);
  assert.ok(portal.includes("getOpportunitySharePath(opp.id)"));
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
});