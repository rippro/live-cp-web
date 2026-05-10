import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifySession, sessionCookieOptions } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { token } = (await request.json()) as { token: string };
  if (!token) return NextResponse.json({ error: "token required" }, { status: 400 });

  const session = await verifySession(token);
  if (!session) return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });

  const cookieStore = await cookies();
  cookieStore.set(sessionCookieOptions(token));
  return NextResponse.json({ session });
}
