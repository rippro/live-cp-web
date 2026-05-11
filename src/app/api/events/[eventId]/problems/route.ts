import { Timestamp } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { generateProblemId, newId } from "@/lib/judge/crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ eventId: string }> }) {
  const { eventId: _rawEventId } = await params;
  const eventId = decodeURIComponent(_rawEventId);
  const session = await getSession();
  if (!session || (session.role !== "admin" && session.role !== "creator")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as Record<string, unknown>;
  const now = new Date();
  const db = getAdminFirestore();

  const requestedId = String(body.id ?? "")
    .trim()
    .toUpperCase();
  let problemId = requestedId || generateProblemId();
  if (!/^[23456789ABCDEFGHJKMNPQRSTVWXYZ]{4}$/.test(problemId)) {
    return NextResponse.json({ error: "id must be 4 unambiguous characters" }, { status: 400 });
  }

  let docId = `${eventId}_${problemId}`;
  if (!requestedId) {
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const existing = await db.collection("problems").doc(docId).get();
      if (!existing.exists) break;
      problemId = generateProblemId();
      docId = `${eventId}_${problemId}`;
    }
  }

  const testcases = readTestcases(body.testcases);
  const data: Record<string, unknown> = {
    eventId,
    id: problemId,
    title: String(body.title ?? ""),
    statement: String(body.statement ?? ""),
    solutionCode: String(body.solutionCode ?? ""),
    timeLimitMs: Number(body.timeLimitMs ?? 2000),
    points: Number(body.points ?? 100),
    compareMode: "trimmed-exact",
    isPublished: Boolean(body.isPublished ?? false),
    creatorUid:
      session.role === "creator" ? session.uid : session.role === "admin" ? session.uid : null,
    createdAt: Timestamp.fromDate(now),
    updatedAt: Timestamp.fromDate(now),
  };

  const batch = db.batch();
  batch.create(db.collection("problems").doc(docId), data);
  for (const testcase of testcases) {
    const testcaseId = newId();
    batch.create(db.collection("testcases").doc(testcaseId), {
      id: testcaseId,
      eventId,
      problemId,
      type: "hidden",
      input: testcase.input,
      expectedOutput: testcase.expectedOutput,
      showOnFailure: false,
      orderIndex: testcase.orderIndex,
      createdAt: Timestamp.fromDate(now),
    });
  }
  await batch.commit();

  return NextResponse.json(
    { ...data, testcases, createdAt: now.toISOString(), updatedAt: now.toISOString() },
    { status: 201 },
  );
}

function readTestcases(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item, index) => {
      if (typeof item !== "object" || item === null) return null;
      const record = item as Record<string, unknown>;
      const input = String(record.input ?? "");
      const expectedOutput = String(record.expectedOutput ?? "");
      if (!input && !expectedOutput) return null;
      return { input, expectedOutput, orderIndex: index };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
}
