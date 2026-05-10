import { createAdminTestcaseVersion, withAdmin } from "@/lib/judge/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return withAdmin(request, async ({ repository }) => {
    const body: unknown = await request.json();
    return createAdminTestcaseVersion(repository, body);
  });
}
