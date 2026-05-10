#!/usr/bin/env node
/**
 * Write an AI-generated problem to Firestore.
 *
 * Usage:
 *   node scripts/create-problem.js <eventId> '<json>'
 *   node scripts/create-problem.js <eventId> --dry-run '<json>'
 *
 * JSON schema:
 *   {
 *     "title": string,
 *     "statement": string,          // Markdown
 *     "solutionCode": string,       // Python 3
 *     "timeLimitMs": number,        // e.g. 2000
 *     "points": number,             // e.g. 100
 *     "isPublished": boolean,       // default false
 *     "testcases": [
 *       { "type": "sample"|"hidden", "input": string, "expectedOutput": string }
 *     ]
 *   }
 *
 * Env:
 *   FIREBASE_SERVICE_ACCOUNT_BASE64 or serviceAccountKey.json
 *   FIRESTORE_DATABASE_ID (optional)
 */

const { readFileSync } = require("node:fs");
const { resolve } = require("node:path");
const { randomBytes } = require("node:crypto");

// ---- ID helpers ----

const UNAMBIGUOUS = "23456789ABCDEFGHJKMNPQRSTVWXYZ";

function generateProblemId() {
  const bytes = randomBytes(4);
  return Array.from(bytes, (b) => UNAMBIGUOUS[b % UNAMBIGUOUS.length]).join("");
}

const CROCKFORD = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

function newId() {
  let ts = Date.now();
  let tsStr = "";
  for (let i = 0; i < 10; i++) {
    tsStr = CROCKFORD[ts % 32] + tsStr;
    ts = Math.floor(ts / 32);
  }
  const rb = randomBytes(10);
  let bits = 0, val = 0, randStr = "";
  for (const byte of rb) {
    val = (val << 8) | byte;
    bits += 8;
    while (bits >= 5 && randStr.length < 16) {
      randStr += CROCKFORD[(val >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  while (randStr.length < 16) randStr += CROCKFORD[0];
  return tsStr + randStr;
}

// ---- Firebase ----

function loadServiceAccount() {
  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (b64) return JSON.parse(Buffer.from(b64, "base64").toString("utf-8"));
  const path = process.env.FIREBASE_SERVICE_ACCOUNT_PATH ?? "serviceAccountKey.json";
  return JSON.parse(readFileSync(resolve(process.cwd(), path), "utf-8"));
}

function getDb() {
  const { cert, getApps, initializeApp } = require("firebase-admin/app");
  const { getFirestore } = require("firebase-admin/firestore");
  const sa = loadServiceAccount();
  const app =
    getApps()[0] ??
    initializeApp({
      credential: cert(sa),
      ...(sa.project_id ? { projectId: sa.project_id } : {}),
    });
  const databaseId = process.env.FIRESTORE_DATABASE_ID;
  return databaseId ? getFirestore(app, databaseId) : getFirestore(app);
}

// ---- Validate ----

function validate(p) {
  const errors = [];
  if (!p.title) errors.push("title is required");
  if (!p.statement) errors.push("statement is required");
  if (!p.solutionCode) errors.push("solutionCode is required");
  if (!p.timeLimitMs || typeof p.timeLimitMs !== "number") errors.push("timeLimitMs must be a number");
  if (!Array.isArray(p.testcases) || p.testcases.length === 0) errors.push("testcases is required");
  const samples = (p.testcases ?? []).filter((t) => t.type === "sample");
  const hidden = (p.testcases ?? []).filter((t) => t.type === "hidden");
  if (samples.length < 1) errors.push(`need at least 1 sample testcase (got ${samples.length})`);
  if (hidden.length < 1) errors.push(`need at least 1 hidden testcase (got ${hidden.length})`);
  return errors;
}

// ---- Write ----

async function writeProblem(eventId, problem, dryRun) {
  const { Timestamp } = require("firebase-admin/firestore");
  const db = getDb();
  const now = new Date();

  let problemId = generateProblemId();
  let docId = `${eventId}_${problemId}`;

  if (!dryRun) {
    for (let i = 0; i < 8; i++) {
      const existing = await db.collection("problems").doc(docId).get();
      if (!existing.exists) break;
      problemId = generateProblemId();
      docId = `${eventId}_${problemId}`;
    }
  }

  const problemData = {
    eventId,
    id: problemId,
    title: problem.title,
    statement: problem.statement,
    solutionCode: problem.solutionCode,
    timeLimitMs: problem.timeLimitMs,
    points: problem.points ?? 100,
    compareMode: "trimmed-exact",
    isPublished: problem.isPublished ?? false,
    creatorUid: null,
    createdAt: Timestamp.fromDate(now),
    updatedAt: Timestamp.fromDate(now),
  };

  const testcases = problem.testcases.map((tc, i) => ({
    id: newId(),
    eventId,
    problemId,
    type: tc.type,
    input: tc.input,
    expectedOutput: tc.expectedOutput,
    showOnFailure: tc.type === "sample",
    orderIndex: i,
    createdAt: Timestamp.fromDate(now),
  }));

  if (dryRun) {
    console.log(JSON.stringify(
      { problem: { ...problemData, createdAt: now.toISOString(), updatedAt: now.toISOString() }, testcases: testcases.map(t => ({ ...t, createdAt: now.toISOString() })) },
      null, 2
    ));
    return problemId;
  }

  const batch = db.batch();
  batch.create(db.collection("problems").doc(docId), problemData);
  for (const tc of testcases) {
    batch.create(db.collection("testcases").doc(tc.id), tc);
  }
  await batch.commit();

  return problemId;
}

// ---- Main ----

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const positional = args.filter((a) => !a.startsWith("--"));

  const eventId = positional[0];
  const jsonStr = positional[1];

  if (!eventId || !jsonStr) {
    console.error("Usage: node scripts/create-problem.js <eventId> [--dry-run] '<json>'");
    process.exit(1);
  }

  let problem;
  try {
    problem = JSON.parse(jsonStr);
  } catch {
    console.error("Invalid JSON:", jsonStr.slice(0, 80));
    process.exit(1);
  }

  const errors = validate(problem);
  if (errors.length > 0) {
    console.error("Validation errors:");
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }

  const problemId = await writeProblem(eventId, problem, dryRun);

  if (!dryRun) {
    console.log(`created: ${problemId} (event: ${eventId}, isPublished: ${problem.isPublished ?? false})`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
