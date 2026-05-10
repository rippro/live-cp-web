import { createAdminTeamMember, withAdmin } from "@/lib/judge/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return withAdmin(request, async ({ repository }) => {
    const body: unknown = await request.json();
    return createAdminTeamMember(repository, body);
  });
}
