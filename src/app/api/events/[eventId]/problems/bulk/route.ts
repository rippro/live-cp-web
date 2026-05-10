import { Timestamp } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { generateProblemId, newId } from "@/lib/judge/crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface BulkProblemInput {
  id?: string;
  title: string;
  statement: string;
  solutionCode?: string;
  timeLimitMs?: number;
  points?: number;
  isPublished?: boolean;
  testcases?: { input: string; expectedOutput: string }[];
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const { eventId: _rawEventId } = await params;
  const eventId = decodeURIComponent(_rawEventId);
  const session = await getSession();
  if (!session || (session.role !== "admin" && session.role !== "creator")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as unknown;
  if (!Array.isArray(body)) {
    return NextResponse.json({ error: "Body must be a JSON array of problems" }, { status: 400 });
  }

  const db = getAdminFirestore();
  const now = new Date();
  const creatorUid = session.role === "admin" || session.role === "creator" ? session.uid : null;
  const created: string[] = [];
  const errors: { index: number; error: string }[] = [];

  for (let i = 0; i < body.length; i++) {
    const item = body[i] as BulkProblemInput;
    if (!item.title || !item.statement) {
      errors.push({ index: i, error: "title and statement are required" });
      continue;
    }

    const requestedId = String(item.id ?? "").trim().toUpperCase();
    let problemId = requestedId || generateProblemId();
    if (requestedId && !/^[23456789ABCDEFGHJKMNPQRSTVWXYZ]{4}$/.test(problemId)) {
      errors.push({ index: i, error: `id "${requestedId}" must be 4 unambiguous characters` });
      continue;
    }

    let docId = `${eventId}_${problemId}`;
    if (!requestedId) {
      for (let attempt = 0; attempt < 8; attempt++) {
        const existing = await db.collection("problems").doc(docId).get();
        if (!existing.exists) break;
        problemId = generateProblemId();
        docId = `${eventId}_${problemId}`;
      }
    } else {
      const existing = await db.collection("problems").doc(docId).get();
      if (existing.exists) {
        errors.push({ index: i, error: `problem "${problemId}" already exists` });
        continue;
      }
    }

    const testcases = (item.testcases ?? [])
      .filter((tc) => tc.input || tc.expectedOutput)
      .map((tc, idx) => ({ input: String(tc.input ?? ""), expectedOutput: String(tc.expectedOutput ?? ""), orderIndex: idx }));

    const data = {
      eventId,
      id: problemId,
      title: String(item.title),
      statement: String(item.statement),
      solutionCode: String(item.solutionCode ?? ""),
      timeLimitMs: Number(item.timeLimitMs ?? 2000),
      points: Number(item.points ?? 100),
      compareMode: "trimmed-exact",
      isPublished: Boolean(item.isPublished ?? false),
      creatorUid,
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
    };

    const batch = db.batch();
    batch.create(db.collection("problems").doc(docId), data);
    for (const tc of testcases) {
      const testcaseId = newId();
      batch.create(db.collection("testcases").doc(testcaseId), {
        id: testcaseId,
        eventId,
        problemId,
        type: "hidden",
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        showOnFailure: false,
        orderIndex: tc.orderIndex,
        createdAt: Timestamp.fromDate(now),
      });
    }
    await batch.commit();
    created.push(problemId);
  }

  return NextResponse.json({ created, errors }, { status: errors.length > 0 && created.length === 0 ? 400 : 201 });
}
