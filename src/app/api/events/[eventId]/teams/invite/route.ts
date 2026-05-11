import { Timestamp } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { generateInviteCode, sha256Hex } from "@/lib/judge/crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function createUniqueInviteCode(existingInviteCodeHashes: Set<string>): {
  inviteCode: string;
  inviteCodeHash: string;
} | null {
  for (let attempt = 0; attempt < 16; attempt += 1) {
    const inviteCode = generateInviteCode();
    const inviteCodeHash = sha256Hex(inviteCode);
    if (!existingInviteCodeHashes.has(inviteCodeHash)) {
      return { inviteCode, inviteCodeHash };
    }
  }
  return null;
}

export async function GET(_req: Request, { params }: { params: Promise<{ eventId: string }> }) {
  const { eventId: _rawEventId } = await params;
  const eventId = decodeURIComponent(_rawEventId);
  const session = await getSession();
  if (!session || session.role !== "solver") {
    return NextResponse.json({ error: "Solver session required" }, { status: 401 });
  }

  const db = getAdminFirestore();
  const membershipsSnap = await db
    .collection("teamMembers")
    .where("userId", "==", session.userId)
    .get();

  for (const membershipDoc of membershipsSnap.docs) {
    const teamId = String(membershipDoc.data().teamId ?? "");
    if (!teamId) continue;

    const teamSnap = await db.collection("teams").doc(teamId).get();
    if (!teamSnap.exists || teamSnap.data()?.eventId !== eventId) continue;

    const inviteCodeRef = db.collection("_teamInviteCodes").doc(teamId);
    const inviteCodeSnap = await inviteCodeRef.get();
    const inviteCode = inviteCodeSnap.data()?.inviteCode;
    if (typeof inviteCode === "string") {
      return NextResponse.json({
        teamId,
        teamName: String(teamSnap.data()?.name ?? teamId),
        inviteCode,
      });
    }

    const teamsSnap = await db.collection("teams").where("eventId", "==", eventId).get();
    const existingInviteCodeHashes = new Set(
      teamsSnap.docs
        .filter((doc) => doc.id !== teamId)
        .map((doc) => String(doc.data().inviteCodeHash ?? "")),
    );
    const generated = createUniqueInviteCode(existingInviteCodeHashes);
    if (!generated) {
      return NextResponse.json({ error: "Invite code generation failed" }, { status: 500 });
    }
    const createdAt = new Date();

    const savedInviteCode = await db.runTransaction(async (tx) => {
      const [latestTeamSnap, latestInviteCodeSnap] = await Promise.all([
        tx.get(db.collection("teams").doc(teamId)),
        tx.get(inviteCodeRef),
      ]);
      if (!latestTeamSnap.exists || latestTeamSnap.data()?.eventId !== eventId) return null;

      const latestInviteCode = latestInviteCodeSnap.data()?.inviteCode;
      if (typeof latestInviteCode === "string") return latestInviteCode;

      tx.update(latestTeamSnap.ref, { inviteCodeHash: generated.inviteCodeHash });
      tx.create(inviteCodeRef, {
        teamId,
        inviteCode: generated.inviteCode,
        createdAt: Timestamp.fromDate(createdAt),
      });
      return generated.inviteCode;
    });

    return NextResponse.json({
      teamId,
      teamName: String(teamSnap.data()?.name ?? teamId),
      inviteCode: savedInviteCode,
    });
  }

  return NextResponse.json({ teamId: null, teamName: null, inviteCode: null });
}
