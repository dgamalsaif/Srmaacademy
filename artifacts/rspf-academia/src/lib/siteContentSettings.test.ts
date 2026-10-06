import { strict as assert } from "node:assert";
import { test } from "node:test";
import {
  DEFAULT_SITE_CONTENT_SETTINGS,
  getOrderedRegistrationFields,
  type RegistrationFieldSetting,
} from "./siteContentSettings";

test("registration fields follow the admin-configured order and missing defaults are appended", () => {
  const defaults = DEFAULT_SITE_CONTENT_SETTINGS.registrationFields;
  const reordered = [defaults[3], defaults[0], defaults[5]];
  const ordered = getOrderedRegistrationFields({ registrationFields: reordered });

  assert.equal(ordered[0].id, "affiliation");
  assert.equal(ordered[1].id, "fullName");
  assert.equal(ordered[2].id, "city");
  // every default field still renders exactly once
  assert.equal(ordered.length, defaults.length);
  for (const field of defaults) {
    assert.equal(ordered.filter((f) => f.id === field.id).length, 1);
  }
});

test("unknown saved field ids are dropped and empty settings fall back to defaults", () => {
  const legacyField = {
    ...DEFAULT_SITE_CONTENT_SETTINGS.registrationFields[0],
    id: "legacy",
  } as unknown as RegistrationFieldSetting;
  const ordered = getOrderedRegistrationFields({
    registrationFields: [...DEFAULT_SITE_CONTENT_SETTINGS.registrationFields, legacyField],
  });

  assert.equal(ordered.filter((f) => f.id === "legacy").length, 0);
  assert.deepEqual(
    getOrderedRegistrationFields(null).map((f) => f.id),
    DEFAULT_SITE_CONTENT_SETTINGS.registrationFields.map((f) => f.id),
  );
});
