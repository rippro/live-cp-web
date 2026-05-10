"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { GlobalNav } from "@/components/nav/GlobalNav";
import { MarkdownView } from "@/components/problems/MarkdownView";
import { useAuth } from "@/contexts/AuthContext";

interface Problem {
  eventId: string;
  id: string;
  title: string;
  statement: string;
  solutionCode: string;
  timeLimitMs: number;
  points: number;
  testcases: Testcase[];
  isPublished: boolean;
  creatorUid: string | null;
  updatedAt: string;
}

interface Testcase {
  id?: string;
  clientId: string;
  input: string;
  expectedOutput: string;
  orderIndex?: number;
}

interface Event {
  id: string;
  isActive: boolean;
}

function makeClientId() {
  return crypto.randomUUID();
}

function ProblemForm({
  eventId,
  initial,
  onSave,
  onCancel,
}: {
  eventId: string;
  initial?: Partial<Problem>;
  onSave: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    title: initial?.title ?? "",
    statement: initial?.statement ?? "",
    solutionCode: initial?.solutionCode ?? "",
    timeLimitMs: initial?.timeLimitMs ?? 2000,
    points: initial?.points ?? 100,
    isPublished: initial?.isPublished ?? false,
  });
  const [testcases, setTestcases] = useState<Testcase[]>(
    initial?.testcases?.length
      ? initial.testcases.map((tc) => ({ ...tc, clientId: tc.id ?? makeClientId() }))
      : [{ clientId: makeClientId(), input: "", expectedOutput: "" }],
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const isEdit = Boolean(initial?.id);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const url = isEdit
        ? `/api/events/${eventId}/problems/${initial?.id}`
        : `/api/events/${eventId}/problems`;
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, testcases }),
      });
      if (!res.ok) {
        const d = (await res.json()) as { error?: string };
        setError(d.error ?? "保存に失敗しました");
        return;
      }
      onSave();
    } catch {
      setError("エラーが発生しました");
    } finally {
      setSaving(false);
    }
  }

  function updateTestcase(index: number, updates: Partial<Testcase>) {
    setTestcases((cases) => cases.map((tc, i) => (i === index ? { ...tc, ...updates } : tc)));
  }

  function addTestcase() {
    setTestcases((cases) => [
      ...cases,
      { clientId: makeClientId(), input: "", expectedOutput: "" },
    ]);
  }

  function removeTestcase(index: number) {
    setTestcases((cases) => cases.filter((_, i) => i !== index));
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label htmlFor="problem-title" className="block text-xs text-rp-muted mb-1.5">
          タイトル
        </label>
        <input
          id="problem-title"
          className="input-field"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          placeholder="A + B 問題"
          required
        />
      </div>
      <div>
        <label htmlFor="problem-statement" className="block text-xs text-rp-muted mb-1.5">
          問題文 Markdown
          <span className="ml-2 text-rp-500">（サンプル入出力は問題文内に記述）</span>
        </label>
        <textarea
          id="problem-statement"
          className="input-field min-h-[220px] resize-y font-mono"
          value={form.statement}
          onChange={(e) => setForm((f) => ({ ...f, statement: e.target.value }))}
          placeholder={
            "# 問題文\n\n$1 \\le N \\le 10^5$\n\n## サンプル入力 1\n```\n1 2\n```\n\n## サンプル出力 1\n```\n3\n```"
          }
          required
        />
      </div>
      <div>
        <label htmlFor="solution-code" className="block text-xs text-rp-muted mb-1.5">
          模範解答コード
        </label>
        <textarea
          id="solution-code"
          className="input-field min-h-[180px] resize-y font-mono"
          value={form.solutionCode}
          onChange={(e) => setForm((f) => ({ ...f, solutionCode: e.target.value }))}
          placeholder={
            "#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n  return 0;\n}"
          }
        />
      </div>
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="block text-xs text-rp-muted">隠しテストケース</p>
            <p className="text-[10px] text-rp-500 mt-0.5">CLIジャッジ用。参加者には見えない。</p>
          </div>
          <button type="button" onClick={addTestcase} className="btn-ghost py-1.5 px-3 text-xs">
            + 追加
          </button>
        </div>
        <div className="space-y-4">
          {testcases.map((tc, index) => (
            <div key={tc.clientId} className="rounded-lg border border-rp-border bg-rp-800 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[10px] font-mono text-rp-muted">HIDDEN #{index + 1}</span>
                <button
                  type="button"
                  onClick={() => removeTestcase(index)}
                  className="btn-ghost py-1 px-2 text-xs"
                  disabled={testcases.length === 1}
                >
                  削除
                </button>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <p className="mb-1.5 block text-[10px] font-medium uppercase tracking-widest text-rp-muted">
                    Input
                  </p>
                  <textarea
                    aria-label={`Testcase ${index + 1} input`}
                    className="input-field min-h-[120px] resize-y font-mono"
                    value={tc.input}
                    onChange={(e) => updateTestcase(index, { input: e.target.value })}
                  />
                </div>
                <div>
                  <p className="mb-1.5 block text-[10px] font-medium uppercase tracking-widest text-rp-muted">
                    Expected Output
                  </p>
                  <textarea
                    aria-label={`Testcase ${index + 1} expected output`}
                    className="input-field min-h-[120px] resize-y font-mono"
                    value={tc.expectedOutput}
                    onChange={(e) => updateTestcase(index, { expectedOutput: e.target.value })}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="time-limit-ms" className="block text-xs text-rp-muted mb-1.5">
            制限時間 (ms)
          </label>
          <input
            id="time-limit-ms"
            type="number"
            className="input-field"
            value={form.timeLimitMs}
            onChange={(e) => setForm((f) => ({ ...f, timeLimitMs: Number(e.target.value) }))}
            min={100}
          />
        </div>
        <div>
          <label htmlFor="points" className="block text-xs text-rp-muted mb-1.5">
            ポイント
          </label>
          <input
            id="points"
            type="number"
            className="input-field"
            value={form.points}
            onChange={(e) => setForm((f) => ({ ...f, points: Number(e.target.value) }))}
            min={1}
            step={1}
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isPublished"
          checked={form.isPublished}
          onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))}
          className="accent-rp-400"
        />
        <label htmlFor="isPublished" className="text-sm text-rp-100">
          公開する
        </label>
      </div>
      {error && <p className="text-sm text-rp-accent">{error}</p>}
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? "保存中..." : "保存"}
        </button>
        <button type="button" onClick={onCancel} className="btn-ghost">
          キャンセル
        </button>
      </div>
    </form>
  );
}

function ProblemPreview({ problem, onClose }: { problem: Problem; onClose: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    setMounted(true);
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[1000] flex items-start justify-center bg-black/70 p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="problem-preview-title"
    >
      <button
        type="button"
        aria-label="プレビューを閉じる"
        className="absolute inset-0 h-full w-full cursor-default"
        onClick={onClose}
      />
      <div className="relative z-10 flex max-h-[calc(100vh-2rem)] w-full max-w-4xl flex-col overflow-hidden rounded-lg border border-rp-border bg-rp-900 shadow-2xl sm:max-h-[calc(100vh-3rem)]">
        {/* Header bar */}
        <div className="flex min-h-16 flex-shrink-0 items-center justify-between gap-4 border-b border-rp-border bg-rp-900 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <span className="font-mono text-sm font-bold text-rp-highlight bg-rp-highlight-tint border border-rp-highlight/25 px-2.5 py-1 rounded-md">
              {problem.id}
            </span>
            {!problem.isPublished && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-rp-border text-rp-muted bg-rp-800">
                DRAFT
              </span>
            )}
            <span className="text-[10px] font-mono text-rp-muted">PREVIEW</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost shrink-0 py-1.5 px-3 text-xs"
          >
            ✕ 閉じる
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6 sm:py-8">
          {/* Problem title */}
          <div className="mb-8 border-b border-rp-border pb-6">
            <h1
              id="problem-preview-title"
              className="mb-3 text-2xl font-extrabold tracking-tight text-rp-100 sm:text-3xl"
            >
              {problem.title}
            </h1>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-rp-muted font-mono">
              <span>
                制限時間: <span className="text-rp-300">{problem.timeLimitMs}ms</span>
              </span>
              <span>
                ポイント: <span className="text-rp-300">{problem.points}pt</span>
              </span>
            </div>
          </div>

          {/* Statement */}
          <section className="mb-10">
            <MarkdownView source={problem.statement} />
          </section>

          {/* Solution code */}
          {problem.solutionCode && (
            <section className="mb-10">
              <h2 className="text-xs font-medium tracking-widest text-rp-muted uppercase mb-4 pb-2 border-b border-rp-border">
                模範解答
              </h2>
              <MarkdownView source={`\`\`\`cpp\n${problem.solutionCode}\n\`\`\``} />
            </section>
          )}

          {/* Hidden testcases */}
          {problem.testcases.length > 0 && (
            <section>
              <h2 className="text-xs font-medium tracking-widest text-rp-muted uppercase mb-4 pb-2 border-b border-rp-border">
                隠しテストケース ({problem.testcases.length})
              </h2>
              <div className="space-y-4">
                {problem.testcases.map((tc, i) => (
                  <div
                    key={tc.id ?? tc.clientId}
                    className="rounded-lg border border-rp-border bg-rp-800 p-4"
                  >
                    <p className="text-[10px] font-mono text-rp-muted mb-3">HIDDEN #{i + 1}</p>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="min-w-0">
                        <p className="text-[10px] font-medium tracking-widest text-rp-muted uppercase mb-2">
                          Input
                        </p>
                        <pre className="min-h-[48px] overflow-x-auto whitespace-pre rounded border border-rp-border bg-rp-900 p-3 text-xs font-mono text-rp-300">
                          {tc.input}
                        </pre>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-medium tracking-widest text-rp-muted uppercase mb-2">
                          Expected Output
                        </p>
                        <pre className="min-h-[48px] overflow-x-auto whitespace-pre rounded border border-rp-border bg-rp-900 p-3 text-xs font-mono text-rp-success">
                          {tc.expectedOutput}
                        </pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

function BulkImportPanel({ eventId, onDone }: { eventId: string; onDone: () => void }) {
  const [json, setJson] = useState("");
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{
    created: string[];
    errors: { index: number; error: string }[];
  } | null>(null);
  const [parseError, setParseError] = useState("");

  async function doImport() {
    setParseError("");
    setResult(null);
    let parsed: unknown;
    try {
      parsed = JSON.parse(json);
    } catch {
      setParseError("JSON パースエラー。配列形式で貼り付けてください。");
      return;
    }
    if (!Array.isArray(parsed)) {
      setParseError("トップレベルは配列 [ ] にしてください。");
      return;
    }
    setImporting(true);
    try {
      const res = await fetch(`/api/events/${eventId}/problems/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });
      const data = (await res.json()) as {
        created: string[];
        errors: { index: number; error: string }[];
      };
      setResult(data);
      if (data.created.length > 0) onDone();
    } catch {
      setParseError("インポートに失敗しました");
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs text-rp-muted mb-1.5">AI生成JSONを貼り付け</p>
        <pre className="text-[10px] text-rp-500 bg-rp-900 border border-rp-border rounded p-3 mb-2 overflow-x-auto">{`[
  {
    "title": "A + B 問題",
    "statement": "## 問題\\n整数 A, B を受け取り、A+B を出力せよ。\\n## サンプル入力 1\\n\`\`\`\\n1 2\\n\`\`\`\\n## サンプル出力 1\\n\`\`\`\\n3\\n\`\`\`",
    "solutionCode": "#include<bits/stdc++.h>\\nusing namespace std;\\nint main(){int a,b;cin>>a>>b;cout<<a+b;}",
    "timeLimitMs": 2000,
    "points": 100,
    "testcases": [
      { "input": "1 2\\n", "expectedOutput": "3\\n" }
    ]
  }
]`}</pre>
        <textarea
          className="input-field min-h-[200px] resize-y font-mono text-xs"
          placeholder="[ { ... }, { ... } ]"
          value={json}
          onChange={(e) => setJson(e.target.value)}
        />
      </div>
      {parseError && <p className="text-xs text-rp-accent">{parseError}</p>}
      {result && (
        <div className="text-xs space-y-1">
          {result.created.length > 0 && (
            <p className="text-rp-success">作成完了: {result.created.join(", ")}</p>
          )}
          {result.errors.map((e) => (
            <p key={e.index} className="text-rp-accent">
              #{e.index + 1}: {e.error}
            </p>
          ))}
        </div>
      )}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={doImport}
          disabled={importing || !json.trim()}
          className="btn-primary"
        >
          {importing ? "インポート中..." : "一括インポート"}
        </button>
      </div>
    </div>
  );
}

type ActivePanel = "none" | "new" | "bulk";

export default function CreatorPage() {
  const { session, loading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [problems, setProblems] = useState<Problem[]>([]);
  const [activePanel, setActivePanel] = useState<ActivePanel>("none");
  const [editProblem, setEditProblem] = useState<Problem | null>(null);
  const [previewProblem, setPreviewProblem] = useState<Problem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !session) {
      router.push("/login");
      return;
    }
    if (!loading && session?.role !== "admin" && session?.role !== "creator") {
      router.push("/");
      return;
    }
  }, [session, loading, router]);

  useEffect(() => {
    fetch("/api/events")
      .then((r) => r.json() as Promise<{ events: Event[] }>)
      .then((d) => {
        setEvents(d.events ?? []);
        if (d.events?.[0]) setSelectedEvent(d.events[0].id);
      })
      .catch(() => {});
  }, []);

  function reloadProblems() {
    if (!selectedEvent) return;
    fetch(`/api/events/${selectedEvent}/problems`)
      .then((r) => r.json() as Promise<{ problems: Problem[] }>)
      .then((d) => setProblems(d.problems ?? []))
      .catch(() => {});
  }

  useEffect(() => {
    if (!selectedEvent) return;
    fetch(`/api/events/${selectedEvent}/problems`)
      .then(async (r) => {
        const d = (await r.json()) as { problems?: Problem[]; error?: string; detail?: string };
        if (!r.ok) throw new Error(d.detail ?? d.error ?? "問題の取得に失敗しました");
        return d;
      })
      .then((d) => setProblems(d.problems ?? []))
      .catch((error: unknown) => {
        console.error("Failed to load creator problems", error);
        setProblems([]);
      });
  }, [selectedEvent]);

  async function deleteProblem(problemId: string) {
    await fetch(`/api/events/${selectedEvent}/problems/${problemId}`, { method: "DELETE" });
    setProblems((ps) => ps.filter((p) => p.id !== problemId));
    setDeleteConfirm(null);
  }

  async function openEdit(problemId: string) {
    const res = await fetch(`/api/events/${selectedEvent}/problems/${problemId}`);
    if (!res.ok) return;
    const problem = (await res.json()) as Problem;
    setEditProblem(problem);
    setActivePanel("none");
  }

  async function openPreview(problemId: string) {
    const res = await fetch(`/api/events/${selectedEvent}/problems/${problemId}`);
    if (!res.ok) return;
    const problem = (await res.json()) as Problem;
    // clientId が必要なので付与
    const normalized: Problem = {
      ...problem,
      testcases: (problem.testcases ?? []).map((tc: Testcase) => ({
        ...tc,
        clientId: tc.id ?? makeClientId(),
      })),
    };
    setPreviewProblem(normalized);
  }

  const myProblems =
    session?.role === "admin"
      ? problems
      : problems.filter((p) => p.creatorUid === (session as { uid: string } | undefined)?.uid);

  if (loading) return null;

  const showingPanel = activePanel !== "none" || editProblem !== null;

  return (
    <>
      <GlobalNav />
      <main className="min-h-screen bg-rp-900 pt-14">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-rp-100">Creator</h1>
            <p className="text-sm text-rp-muted mt-1">問題の作成・編集・削除</p>
          </div>

          {/* Event selector */}
          <div className="mb-6 flex items-center gap-4">
            <label htmlFor="event-selector" className="text-sm text-rp-muted">
              イベント:
            </label>
            <select
              id="event-selector"
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="input-field w-auto max-w-xs"
            >
              {events.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.id}
                </option>
              ))}
            </select>
          </div>

          {/* New problem form */}
          {activePanel === "new" && selectedEvent && (
            <div className="card-surface p-6 mb-6">
              <h2 className="font-display text-lg font-bold text-rp-100 mb-4">新規問題作成</h2>
              <ProblemForm
                key="new"
                eventId={selectedEvent}
                onSave={() => {
                  setActivePanel("none");
                  reloadProblems();
                }}
                onCancel={() => setActivePanel("none")}
              />
            </div>
          )}

          {/* Bulk import panel */}
          {activePanel === "bulk" && selectedEvent && (
            <div className="card-surface p-6 mb-6">
              <h2 className="font-display text-lg font-bold text-rp-100 mb-4">一括インポート</h2>
              <BulkImportPanel
                eventId={selectedEvent}
                onDone={() => {
                  reloadProblems();
                }}
              />
              <button
                type="button"
                onClick={() => setActivePanel("none")}
                className="btn-ghost mt-4"
              >
                閉じる
              </button>
            </div>
          )}

          {/* Edit form */}
          {editProblem && (
            <div className="card-surface p-6 mb-6">
              <h2 className="font-display text-lg font-bold text-rp-100 mb-4">
                問題を編集: {editProblem.id}
              </h2>
              <ProblemForm
                key={editProblem.id}
                eventId={selectedEvent}
                initial={editProblem}
                onSave={() => {
                  setEditProblem(null);
                  reloadProblems();
                }}
                onCancel={() => setEditProblem(null)}
              />
            </div>
          )}

          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-display text-lg font-bold text-rp-100">
              {session?.role === "admin" ? "全問題" : "自分の問題"} ({myProblems.length})
            </h2>
            {!showingPanel && (
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => setActivePanel("bulk")} className="btn-ghost">
                  一括インポート
                </button>
                <button type="button" onClick={() => setActivePanel("new")} className="btn-primary">
                  + 新規問題
                </button>
              </div>
            )}
          </div>

          {myProblems.length === 0 ? (
            <div className="card-surface p-12 text-center">
              <p className="text-rp-muted mb-4">問題がありません</p>
              <div className="flex gap-2 justify-center">
                <button type="button" onClick={() => setActivePanel("bulk")} className="btn-ghost">
                  一括インポート
                </button>
                <button type="button" onClick={() => setActivePanel("new")} className="btn-primary">
                  最初の問題を作成
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {myProblems.map((p) => (
                <div
                  key={p.id}
                  className="card-surface flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:gap-4 sm:px-5"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-rp-700 flex items-center justify-center">
                    <span className="font-mono text-xs font-bold text-rp-300">{p.id}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="min-w-0 flex-1 truncate font-display text-sm font-semibold text-rp-100">
                        {p.title}
                      </span>
                      {!p.isPublished && (
                        <span className="shrink-0 text-[10px] font-mono px-1.5 py-0.5 rounded border border-rp-muted/30 text-rp-muted">
                          DRAFT
                        </span>
                      )}
                      {p.isPublished && (
                        <span className="shrink-0 text-[10px] font-mono px-1.5 py-0.5 rounded badge-live">
                          LIVE
                        </span>
                      )}
                    </div>
                    <p className="font-mono text-xs text-rp-muted mt-0.5">
                      更新: {new Date(p.updatedAt).toLocaleDateString("ja-JP")}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
                    <button
                      type="button"
                      onClick={() => void openPreview(p.id)}
                      className="btn-ghost py-1.5 px-3 text-xs"
                    >
                      表示
                    </button>
                    <button
                      type="button"
                      onClick={() => void openEdit(p.id)}
                      className="btn-ghost py-1.5 px-3 text-xs"
                    >
                      編集
                    </button>
                    {deleteConfirm === p.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => void deleteProblem(p.id)}
                          className="text-xs px-3 py-1.5 rounded bg-rp-accent text-white hover:opacity-90 transition-opacity"
                        >
                          削除確認
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirm(null)}
                          className="btn-ghost py-1.5 px-2 text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDeleteConfirm(p.id)}
                        className="btn-ghost py-1.5 px-3 text-xs text-rp-accent border-rp-accent/30 hover:bg-rp-accent/10"
                      >
                        削除
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      {previewProblem && (
        <ProblemPreview problem={previewProblem} onClose={() => setPreviewProblem(null)} />
      )}
    </>
  );
}
