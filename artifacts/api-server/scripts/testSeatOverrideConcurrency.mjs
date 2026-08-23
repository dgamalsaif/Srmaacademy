import assert from "node:assert/strict";

const baseUrl = (process.env.API_BASE_URL
  ?? (process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : "http://localhost:8080")).replace(/\/$/, "");
const cookie = process.env.TEST_OWNER_SESSION_COOKIE;

if (!cookie) {
  console.log("Skipped seat override concurrency test: provide TEST_OWNER_SESSION_COOKIE from a Clerk owner test session.");
  process.exit(0);
}

const marker = crypto.randomUUID();
const title = `Seat override race ${marker}`;
let programId;

try {
  const createResponse = await fetch(`${baseUrl}/api/programs`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify({
      category: "active",
      titleAr: title,
      titleEn: title,
      specialtyAr: "اختبار التزامن",
      specialtyEn: "Concurrency Testing",
      descriptionAr: "فرصة اختبارية مؤقتة.",
      descriptionEn: "Temporary concurrency test opportunity.",
      status: "open",
      journalTarget: "Test Journal",
      indexedIn: ["PubMed"],
      benefits: ["Concurrency validation"],
      duration: "1 day",
      supervisor: "Test Supervisor",
      priceOriginalSar: 1500,
      priceDiscountedSar: 1000,
    }),
  });
  if (!createResponse.ok) throw new Error(`Create program failed with ${createResponse.status}: ${await createResponse.text()}`);
  const created = await createResponse.json();
  programId = created.id;

  const patch = fetch(`${baseUrl}/api/programs/${programId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify({ seatsLeft: 1 }),
  });
  const registration = fetch(`${baseUrl}/api/registrations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      researchId: programId,
      fullName: "Capacity Race Test",
      specialization: "Testing",
      email: `capacity-${marker}@example.test`,
      whatsapp: "0500000000",
      affiliation: "SRMA Test",
      country: "Saudi Arabia",
      city: "Riyadh",
      orcid: "0000-0000-0000-0000",
      authorRole: "first_author",
    }),
  });
  const [patchResponse, registrationResponse] = await Promise.all([patch, registration]);
  if (!patchResponse.ok) throw new Error(`Seat override failed with ${patchResponse.status}: ${await patchResponse.text()}`);
  if (!registrationResponse.ok) throw new Error(`Registration failed with ${registrationResponse.status}: ${await registrationResponse.text()}`);

  const catalogResponse = await fetch(`${baseUrl}/api/programs`);
  if (!catalogResponse.ok) throw new Error(`Program list failed with ${catalogResponse.status}.`);
  const program = (await catalogResponse.json()).find((item) => item.id === programId);
  assert.ok(program, "The test opportunity should remain readable after the race.");
  assert.equal(program.totalSeats, 15, "The total capacity must remain fixed at 15.");
  assert.equal(program.firstAuthorSeatsLeft, 0, "The first-author seat reserved concurrently must not be restored.");
  assert.equal(program.seatsLeft, program.firstAuthorSeatsLeft + program.coAuthorSeatsLeft, "The aggregate seat count must equal the role allocation.");
  assert.ok(program.seatsLeft <= 14, "One successful reservation means no more than 14 seats can remain.");
  console.log("Seat override concurrency passed: the override did not restore a concurrently reserved seat.");
} finally {
  if (programId) {
    await fetch(`${baseUrl}/api/programs/${programId}`, { method: "DELETE", headers: { cookie } });
  }
}