import { type JudgeRouteParams, withJudgeAuth } from "@/lib/judge/http";
import { getProblemConfig } from "@/lib/judge/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request, context: { params: Promise<JudgeRouteParams> }) {
  const { eventId: _rawEventId, problemId: _rawProblemId } = await context.params;
  const eventId = decodeURIComponent(_rawEventId);
  const problemId = decodeURIComponent(_rawProblemId);

  return withJudgeAuth(request, ({ repository, auth }) =>
    getProblemConfig(repository, auth, eventId, problemId),
  );
}
