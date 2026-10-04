import { strict as assert } from "node:assert";
import { test } from "node:test";
import { isAllowedCoordinatorMutation } from "./coordinatorPermissions";
import { OPPORTUNITY_DISPLAY_FIELDS, validateHiddenFields } from "./opportunityVisibilityFields";

test("coordinator may only add/remove students and manage login/logout", () => {
  for (const [method, path] of [
    ["POST", "/coordinator/registrations"], ["POST", "/coordinator/registrations/"],
    ["DELETE", "/registrations/12"], ["POST", "/coordinator/logout"],
    ["POST", "/coordinator/login"],
  ]) assert.equal(isAllowedCoordinatorMutation(method, path), true, `${method} ${path}`);
});

test("coordinator cannot change students, approval, accounts, opportunities, contact, finances or public attribution", () => {
  for (const [method, path] of [
    ["PATCH", "/registrations/12"], ["PATCH", "/registrations/12/status"],
    ["POST", "/coordinator/change-name"], ["POST", "/coordinator/change-access-code"],
    ["PATCH", "/owner/profile"], ["PATCH", "/programs/12"], ["POST", "/programs"],
    ["DELETE", "/programs/12"], ["POST", "/program-images/upload"],
    ["POST", "/programs/batch-update"], ["POST", "/programs/batch-delete"],
    ["PUT", "/site-content-settings"], ["PATCH", "/site-content-settings/opportunity-inquiry"],
    ["PUT", "/coordinator-portal-settings"], ["POST", "/payments"],
    ["POST", "/registrations"], ["POST", "/service-requests"],
    ["DELETE", "/registrations/0"], ["DELETE", "/registrations/12/status"],
  ]) assert.equal(isAllowedCoordinatorMutation(method, path), false, `${method} ${path}`);
});

test("normal read and preflight requests remain available", () => {
  for (const method of ["GET", "HEAD", "OPTIONS"]) {
    assert.equal(isAllowedCoordinatorMutation(method, "/programs"), true);
  }
});

test("visibility accepts only explicit display fields and preserves show-all default", () => {
  assert.deepEqual(validateHiddenFields([]), []);
  assert.deepEqual(validateHiddenFields(["seats", "price", "seats"]), ["seats", "price"]);
  assert.deepEqual(validateHiddenFields([...OPPORTUNITY_DISPLAY_FIELDS]), OPPORTUNITY_DISPLAY_FIELDS);
  for (const bad of [null, {}, "price", [null], ["researchGroupUrl"], ["title"], ["__proto__"]]) {
    assert.throws(() => validateHiddenFields(bad));
  }
});