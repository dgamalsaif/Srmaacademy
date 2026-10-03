import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import ts from "typescript";

const source = readFileSync(new URL("./worker.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
}).outputText;
const { default: worker } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
const config = JSON.parse(readFileSync(new URL("./wrangler.jsonc", import.meta.url), "utf8"));

test("Cloudflare routes both public hostnames through the share-aware Worker", () => {
  assert.equal(config.name, "srma-api-proxy");
  assert.equal(config.assets, undefined, "Keep the existing Pages frontend");
  for (const hostname of ["srmaacademy.com", "www.srmaacademy.com"]) {
    for (const route of ["/api/*", "/research/*", "/share/research/*"]) {
      assert.ok(config.routes.some(r => r.pattern === `${hostname}${route}`), `Missing route: ${hostname}${route}`);
    }
  }
});

test("an API-only Worker passes ordinary visitors through to the existing Pages origin", async () => {
  const originalFetch = globalThis.fetch;
  const request = new Request("https://academy.example.com/research/302?lang=en", {
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  globalThis.fetch = async passedRequest => {
    assert.equal(passedRequest, request);
    return new Response("existing Pages frontend");
  };
  try {
    const response = await worker.fetch(request, { API_ORIGIN: "https://api.example.com" });
    assert.equal(await response.text(), "existing Pages frontend");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("social crawlers receive opportunity metadata while visitors receive the SPA", async () => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  let assetCalls = 0;
  const env = {
    API_ORIGIN: "https://api.example.com/",
    ASSETS: { fetch: async () => { assetCalls++; return new Response("frontend"); } },
  };
  globalThis.fetch = async (url, options) => {
    calls.push({ url: String(url), options });
    return new Response("opportunity metadata", { headers: { "Content-Type": "text/html" } });
  };
  try {
    for (const agent of ["facebookexternalhit/1.1", "WhatsApp/2.0", "Twitterbot/1.0", "TelegramBot", "LinkedInBot", "Slackbot", "Discordbot"]) {
      const response = await worker.fetch(new Request("https://academy.example.com/research/302?lang=en", {
        headers: { "User-Agent": agent },
      }), env);
      assert.equal(await response.text(), "opportunity metadata");
      const call = calls.at(-1);
      assert.equal(call.url, "https://api.example.com/api/programs/302/share?lang=en");
      assert.equal(call.options.headers.get("x-forwarded-host"), "academy.example.com");
      assert.equal(call.options.headers.get("x-forwarded-proto"), "https");
    }
    assert.equal(assetCalls, 0);
    const browser = await worker.fetch(new Request("https://academy.example.com/research/302", {
      headers: { "User-Agent": "Mozilla/5.0" },
    }), env);
    assert.equal(await browser.text(), "frontend");
    assert.equal(assetCalls, 1);

    for (const path of ["/share/research/302", "/research/302?preview=1", "/research/302/?crawler=1"]) {
      const response = await worker.fetch(new Request(`https://academy.example.com${path}`, {
        headers: { "User-Agent": "Mozilla/5.0" },
      }), env);
      assert.equal(await response.text(), "opportunity metadata");
      assert.match(calls.at(-1).url, /\/api\/programs\/302\/share/);
    }
    const api = await worker.fetch(new Request("https://academy.example.com/api/programs/302"), env);
    assert.equal(await api.text(), "opportunity metadata");
    assert.equal(calls.at(-1).url, "https://api.example.com/api/programs/302");
  } finally {
    globalThis.fetch = originalFetch;
  }
});