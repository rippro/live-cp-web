import { Timestamp } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getAdminFirestore } from "@/lib/firebase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json()) as Record<string, unknown>;
  const eventId = String(body.eventId ?? "").trim();
  if (!eventId) return NextResponse.json({ error: "eventId required" }, { status: 400 });
  if (!body.startsAt) return NextResponse.json({ error: "startsAt required" }, { status: 400 });
  const startsAt = new Date(body.startsAt as string);
  if (Number.isNaN(startsAt.getTime()))
    return NextResponse.json({ error: "startsAt invalid" }, { status: 400 });

  const db = getAdminFirestore();
  const ref = db.collection("events").doc(eventId);
  if ((await ref.get()).exists)
    return NextResponse.json({ error: "Event already exists" }, { status: 409 });

  const data = {
    isActive: Boolean(body.isActive ?? false),
    startsAt: Timestamp.fromDate(startsAt),
  };
  await ref.set(data);
  return NextResponse.json(
    {
      id: eventId,
      isActive: data.isActive,
      startsAt: data.startsAt.toDate().toISOString(),
    },
    { status: 201 },
  );
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json()) as Record<string, unknown>;
  const eventId = String(body.eventId ?? "").trim();
  if (!eventId) return NextResponse.json({ error: "eventId required" }, { status: 400 });

  const db = getAdminFirestore();
  await db.collection("events").doc(eventId).delete();
  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json()) as Record<string, unknown>;
  const eventId = String(body.eventId ?? "");
  if (!eventId) return NextResponse.json({ error: "eventId required" }, { status: 400 });

  const db = getAdminFirestore();
  const ref = db.collection("events").doc(eventId);
  const snap = await ref.get();
  if (!snap.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updates: Record<string, unknown> = {};
  if (body.isActive !== undefined) updates.isActive = Boolean(body.isActive);
  if (body.startsAt !== undefined) {
    const startsAt = new Date(body.startsAt as string);
    if (Number.isNaN(startsAt.getTime()))
      return NextResponse.json({ error: "startsAt invalid" }, { status: 400 });
    updates.startsAt = Timestamp.fromDate(startsAt);
  }

  await ref.update(updates);
  const updated = await ref.get();
  const d = updated.data();
  if (!d) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({
    id: eventId,
    isActive: d.isActive,
    startsAt: (d.startsAt as Timestamp).toDate().toISOString(),
  });
}
