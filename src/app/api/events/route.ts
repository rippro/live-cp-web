import { NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/firebase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const db = getAdminFirestore();
  const snap = await db.collection("events").get();
  const events = snap.docs.map((doc) => {
    const d = doc.data();
    return {
      id: doc.id,
      isActive: d.isActive as boolean,
    };
  });
  return NextResponse.json({ events });
}
