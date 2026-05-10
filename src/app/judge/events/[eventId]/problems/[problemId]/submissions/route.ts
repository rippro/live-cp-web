import { type JudgeRouteParams, withJudgeAuthCreated } from "@/lib/judge/http";
import { createAcceptedSubmission } from "@/lib/judge/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request, context: { params: Promise<JudgeRouteParams> }) {
  const { eventId: _rawEventId, problemId: _rawProblemId } = await context.params;
  const eventId = decodeURIComponent(_rawEventId);
  const problemId = decodeURIComponent(_rawProblemId);

  return withJudgeAuthCreated(request, async ({ repository, auth }) => {
    const body: unknown = await request.json();
    return createAcceptedSubmission(repository, auth, eventId, problemId, body);
  });
}
