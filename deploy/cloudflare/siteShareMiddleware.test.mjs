import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import ts from "typescript";

const code = ts.transpileModule(readFileSync(new URL("../../functions/_middleware.ts", import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { onRequest } = await import(`data:text/javascript;base64,${Buffer.from(code).toString("base64")}`);

test("Pages serves current versioned metadata to crawlers but leaves people and opportunity previews alone", async () => {
  const originalFetch = globalThis.fetch;
  const originalRewriter = globalThis.HTMLRewriter;
  const html = '<meta property="og:image" content="old"><meta property="og:image:secure_url" content="old"><meta name="twitter:image" content="old">';
  let calls = 0;
  globalThis.fetch = async (url) => {
    calls++;
    assert.equal(String(url), "https://example.test/api/site-share-metadata");
    return Response.json({ imagePath: "/api/site-share-image?v=0123456789abcdef" });
  };
  globalThis.HTMLRewriter = class {
    handlers = [];
    on(selector, handler) { this.handlers.push([selector, handler]); return this; }
    transform(response) {
      const handlers = this.handlers;
      return new Response(new ReadableStream({ async start(controller) {
        let text = await response.text();
        for (const [selector, handler] of handlers) {
          const attribute = selector.slice(5, -1);
          let content;
          handler.element({ setAttribute(_key, value) { content = value; } });
          text = text.replace(new RegExp(`(<meta ${attribute} content=")[^"]*`), `$1${content}`);
        }
        controller.enqueue(new TextEncoder().encode(text));
        controller.close();
      } }), { headers: response.headers });
    }
  };
  const context = (path, agent) => ({ request: new Request(`https://example.test${path}`, { headers: { "user-agent": agent } }), next: async () => new Response(html, { headers: { "content-type": "text/html" } }) });
  try {
    const result = await onRequest(context("/", "WhatsApp"));
    assert.equal(result.headers.get("cache-control"), "no-store");
    assert.equal((await result.text()).match(/https:\/\/example.test\/api\/site-share-image\?v=0123456789abcdef/g).length, 3);
    for (const path of ["/research/106", "/share/research/106", "/survey?rid=106"]) {
      assert.equal(await (await onRequest(context(path, "WhatsApp"))).text(), html);
    }
    assert.equal(await (await onRequest(context("/", "Mozilla/5.0"))).text(), html);
    assert.equal(calls, 1);
    globalThis.fetch = async () => { throw new Error("offline"); };
    assert.equal(await (await onRequest(context("/", "WhatsApp"))).text(), html);
  } finally {
    globalThis.fetch = originalFetch;
    globalThis.HTMLRewriter = originalRewriter;
  }
});