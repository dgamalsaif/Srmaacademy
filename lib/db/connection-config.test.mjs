import assert from "node:assert/strict";
import { test } from "node:test";
import { getPostgresConnectionConfig } from "./src/connection-config.ts";

test("Render internal hostnames and the supplied database name remain intact", () => {
  const config = getPostgresConnectionConfig("postgresql://example:example@dpg-example-a/actual_database");
  const url = new URL(config.connectionString);
  assert.equal(url.hostname, "dpg-example-a");
  assert.equal(url.pathname, "/actual_database");
  assert.equal(config.ssl, undefined);
  assert.equal(url.searchParams.has("sslmode"), false);
});

for (const mode of ["prefer", "require", "verify-ca"]) {
  test(`legacy ${mode} TLS mode preserves pg's verified behavior explicitly`, () => {
    const config = getPostgresConnectionConfig(`postgresql://example:example@database.example/db?sslmode=${mode}`);
    assert.equal(new URL(config.connectionString).searchParams.get("sslmode"), "verify-full");
    assert.equal(config.ssl, undefined);
  });
}

test("explicit TLS modes are retained", () => {
  for (const mode of ["verify-full", "disable"]) {
    const config = getPostgresConnectionConfig(`postgresql://example:example@database.example/db?sslmode=${mode}`);
    assert.equal(new URL(config.connectionString).searchParams.get("sslmode"), mode);
  }
});

test("Neon compatibility retains verified TLS by default", () => {
  const config = getPostgresConnectionConfig("postgresql://example:example@database.neon.tech/db");
  assert.equal(new URL(config.connectionString).searchParams.get("sslmode"), "verify-full");
});

test("legacy ssl=true uses explicit verified TLS", () => {
  const config = getPostgresConnectionConfig("postgresql://example:example@database.example/db?ssl=true");
  const url = new URL(config.connectionString);
  assert.equal(url.searchParams.get("sslmode"), "verify-full");
  assert.equal(url.searchParams.has("ssl"), false);
});

test("unrelated parameters and encoded credentials are not discarded", () => {
  const config = getPostgresConnectionConfig(" postgresql://example:p%40ss@database.example/db?application_name=srma ");
  const url = new URL(config.connectionString);
  assert.equal(url.password, "p%40ss");
  assert.equal(url.searchParams.get("application_name"), "srma");
});

test("non-PostgreSQL URLs are rejected", () => {
  assert.throws(() => getPostgresConnectionConfig("https://database.example/db"), /postgres/);
});