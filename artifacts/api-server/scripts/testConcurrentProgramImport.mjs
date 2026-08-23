const baseUrl = process.env.API_BASE_URL
  ?? (process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : "http://localhost:8080");
const password = process.env.OWNER_ADMIN_PASSWORD;

if (!password) throw new Error("OWNER_ADMIN_PASSWORD must be available to run the import concurrency test.");

async function signIn() {
  const response = await fetch(`${baseUrl}/api/owner/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  if (!response.ok) throw new Error(`Owner sign-in failed with ${response.status}.`);
  const cookie = response.headers.get("set-cookie");
  if (!cookie) throw new Error("Owner sign-in did not return a session cookie.");
  return cookie;
}

async function importRows(cookie, rows) {
  const response = await fetch(`${baseUrl}/api/programs/import`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify({ rows }),
  });
  if (!response.ok) throw new Error(`Import failed with ${response.status}: ${await response.text()}`);
  return response.json();
}

const marker = crypto.randomUUID();
const title = `Concurrent import verification ${marker}`;
const rows = [{
  specialtyAr: "اختبار التزامن",
  specialtyEn: "Concurrency Testing",
  title,
  totalSeats: 12,
  seatsLeft: 12,
}];

const cookies = await Promise.all([signIn(), signIn()]);
let importedId;
try {
  const results = await Promise.all(cookies.map((cookie) => importRows(cookie, rows)));
  const programsResponse = await fetch(`${baseUrl}/api/programs`);
  if (!programsResponse.ok) throw new Error(`Program list failed with ${programsResponse.status}.`);
  const matchingPrograms = (await programsResponse.json()).filter((program) => program.titleEn === title && program.specialtyEn === "Concurrency Testing");
  if (matchingPrograms.length !== 1) {
    throw new Error(`Expected one concurrently imported row, found ${matchingPrograms.length}.`);
  }
  importedId = matchingPrograms[0].id;
  const insertedCount = results.reduce((total, result) => total + result.inserted.length, 0);
  if (insertedCount !== 1) throw new Error(`Expected exactly one insert across concurrent calls, got ${insertedCount}.`);
  console.log("Concurrent opportunity import passed: exactly one record was created.");
} finally {
  if (importedId) {
    await fetch(`${baseUrl}/api/programs/${importedId}`, {
      method: "DELETE",
      headers: { cookie: cookies[0] },
    });
  }
}