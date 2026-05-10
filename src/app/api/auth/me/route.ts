import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifySession } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COOKIE_NAME = "rj_session";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ session: null, token: null });
  const session = await verifySession(token);
  if (!session) return NextResponse.json({ session: null, token: null });
  return NextResponse.json({ session, token });
}
