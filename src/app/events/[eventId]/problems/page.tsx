import type { Timestamp } from "firebase-admin/firestore";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { getAdminFirestore } from "@/lib/firebase/admin";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ eventId: string }>;
}

async function getEventIsActive(eventId: string): Promise<boolean> {
  const db = getAdminFirestore();
  const snap = await db.collection("events").doc(eventId).get();
  if (!snap.exists) return false;
  return Boolean(snap.data()?.isActive);
}

async function getProblems(eventId: string) {
  const db = getAdminFirestore();
  const query = db
    .collection("problems")
    .where("eventId", "==", eventId)
    .where("isPublished", "==", true);
  const snap = await query.orderBy("id", "asc").get();
  return snap.docs.map((doc) => {
    const d = doc.data();
    return {
      id: d.id as string,
      title: d.title as string,
      isPublished: d.isPublished as boolean,
      timeLimitMs: d.timeLimitMs as number,
      points: (d.points as number | undefined) ?? 100,
      updatedAt: (d.updatedAt as Timestamp).toDate().toISOString(),
    };
  });
}

async function getSolveCountByProblem(eventId: string) {
  try {
    const db = getAdminFirestore();
    const snap = await db.collection("solves").where("eventId", "==", eventId).get();
    const map = new Map<string, number>();
    for (const doc of snap.docs) {
      const pid = doc.data().problemId as string;
      map.set(pid, (map.get(pid) ?? 0) + 1);
    }
    return map;
  } catch (error) {
    console.error("Failed to get solve counts", error);
    return new Map<string, number>();
  }
}

export default async function ProblemsPage({ params }: PageProps) {
  const { eventId: _rawEventId } = await params;
  const eventId = decodeURIComponent(_rawEventId);

  const isActive = await getEventIsActive(eventId).catch(() => false);

  if (!isActive) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 pb-6 border-b border-rp-border">
          <p className="text-xs font-medium tracking-widest text-rp-muted uppercase mb-1">
            Problems
          </p>
          <h1 className="text-2xl font-extrabold tracking-tight text-rp-100">問題一覧</h1>
        </div>
        <div className="py-20 text-center">
          <p className="text-rp-muted text-sm">待機中</p>
        </div>
      </div>
    );
  }

  const [problems, solves] = await Promise.all([
    getProblems(eventId).catch((error: unknown) => {
      console.error("Failed to render problems page", error);
      return [];
    }),
    getSolveCountByProblem(eventId),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8 pb-6 border-b border-rp-border flex items-end justify-between">
        <div>
          <p className="text-xs font-medium tracking-widest text-rp-muted uppercase mb-1">
            Problems
          </p>
          <h1 className="text-2xl font-extrabold tracking-tight text-rp-100">問題一覧</h1>
        </div>
        <span className="text-sm text-rp-muted">{problems.length} 問</span>
      </div>

      {problems.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-rp-muted text-sm">問題はまだ公開されていません</p>
        </div>
      ) : (
        <>
          {/* Table header */}
          <div className="hidden sm:grid grid-cols-[48px_1fr_80px_80px_80px] gap-4 px-4 pb-2 text-[11px] font-medium text-rp-muted uppercase tracking-wider">
            <span>#</span>
            <span>問題名</span>
            <span>条件</span>
            <span className="text-right">Pt</span>
            <span className="text-right">AC</span>
          </div>
          <div className="divide-y divide-rp-border border-t border-rp-border">
            {problems.map((p) => (
              <Link
                key={p.id}
                href={`/events/${eventId}/problems/${p.id}`}
                className="flex items-center gap-4 py-4 -mx-4 px-4 group hover:bg-rp-800 transition-colors"
              >
                {/* ID */}
                <div className="flex-shrink-0 w-10 text-center font-mono text-sm font-bold text-rp-highlight">
                  {p.id}
                </div>
                {/* Name */}
                <div className="flex-1 min-w-0 flex items-center gap-2">
                  <h2 className="text-sm font-medium text-rp-100 truncate group-hover:text-rp-400 transition-colors">
                    {p.title}
                  </h2>
                  {!p.isPublished && (
                    <span className="flex-shrink-0 text-[10px] font-mono px-1.5 py-0.5 rounded bg-rp-800 border border-rp-border text-rp-muted">
                      DRAFT
                    </span>
                  )}
                </div>
                {/* Time limit */}
                <div className="hidden sm:block w-20 text-xs font-mono text-rp-muted flex-shrink-0">
                  {p.timeLimitMs}ms
                </div>
                {/* Points */}
                <div className="hidden sm:block w-16 text-right flex-shrink-0">
                  <span className="text-sm font-bold font-mono tabular-nums text-rp-highlight">
                    {p.points}
                  </span>
                  <span className="text-[10px] text-rp-muted ml-0.5">pt</span>
                </div>
                {/* AC count + arrow */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="w-10 text-right text-base font-bold text-rp-success font-mono tabular-nums">
                    {solves.get(p.id) ?? 0}
                  </span>
                  <ArrowRight
                    aria-hidden="true"
                    size={14}
                    className="text-rp-600 transition-colors group-hover:text-rp-400"
                  />
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
