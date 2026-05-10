import { type JudgeRouteParams, withJudgeAuth } from "@/lib/judge/http";
import { getTestcases } from "@/lib/judge/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request, context: { params: Promise<JudgeRouteParams> }) {
  const { eventId: _rawEventId, problemId: _rawProblemId } = await context.params;
  const eventId = decodeURIComponent(_rawEventId);
  const problemId = decodeURIComponent(_rawProblemId);
  const url = new URL(request.url);

  return withJudgeAuth(request, ({ repository, auth }) =>
    getTestcases(repository, auth, eventId, problemId, url.searchParams.get("version")),
  );
}
