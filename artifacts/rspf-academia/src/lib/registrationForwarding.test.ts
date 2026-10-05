import { strict as assert } from "node:assert";
import { test } from "node:test";
import { getRegistrationForwarding, loadLatestForwardingBrand } from "./registrationForwarding";

test("new participant contact overrides old audience and global numbers without affecting coordinator contact", () => {
  const brand = { participantForwardTarget: "+1 202 555 0122", participantWhatsapp: "old-audience",
    whatsapp: "old-global", coordinatorForwardTarget: "12025550133" };
  assert.equal(getRegistrationForwarding(brand).target, "12025550122");
  assert.equal(getRegistrationForwarding(brand, true).target, "12025550133");
  assert.equal(getRegistrationForwarding({ ...brand, participantForwardTarget: "" }).target, "");
  assert.equal(getRegistrationForwarding(null).type, "none");
  assert.equal(getRegistrationForwarding({ participantForwardType: "none" }).type, "none");
});

test("contact data is fetched uncached after saving; a failure cannot restore stale or hardcoded numbers", async () => {
  const brand = await loadLatestForwardingBrand(async (path, options) => {
    assert.equal(path, "/api/site-content-settings");
    assert.equal(options?.cache, "no-store");
    return new Response(JSON.stringify({ brand: { participantForwardTarget: "12025550144" } }));
  });
  assert.equal(getRegistrationForwarding(brand).target, "12025550144");
  assert.equal(await loadLatestForwardingBrand(async () => new Response("unavailable", { status: 503 })), null);
  assert.equal(await loadLatestForwardingBrand(async () => { throw new Error("offline"); }), null);
  assert.equal(await loadLatestForwardingBrand(async () => new Response("{}")), null);
});