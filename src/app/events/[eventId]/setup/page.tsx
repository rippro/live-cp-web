"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { useAuth } from "@/contexts/AuthContext";

interface SetupTokenSectionProps {
  eventId: string;
  isSolver: boolean;
}

function SetupTokenSection({ eventId, isSolver }: SetupTokenSectionProps) {
  const [token, setToken] = useState<string | null>(null);
  const [, setFetched] = useState(false);

  useEffect(() => {
    if (!isSolver) {
      setFetched(true);
      return;
    }
    fetch(`/api/events/${encodeURIComponent(eventId)}/token`)
      .then((r) => r.json() as Promise<{ token: string | null; teamName: string | null }>)
      .then((d) => {
        setToken(d.token);
      })
      .catch(() => {})
      .finally(() => setFetched(true));
  }, [eventId, isSolver]);

  const configJson = JSON.stringify({ eventId, token: token ?? "rj_live_XXXX..." }, null, 2);

  return (
    <section>
      <h2 className="text-sm font-semibold text-rp-100 mb-2">
        4. 設定ファイル (.rippro-judge.json)
      </h2>
      <p className="text-sm text-rp-muted mb-2">提出作業ディレクトリに配置。</p>
      <CodeBlock code={configJson} />
    </section>
  );
}

export default function SetupPage() {
  const { eventId: rawEventId } = useParams<{ eventId: string }>();
  const eventId = decodeURIComponent(rawEventId);
  const { session } = useAuth();
  const isSolver = session?.role === "solver";

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="font-display text-2xl font-bold text-rp-100 mb-2">Setup</h1>
      <p className="text-sm text-rp-muted mb-8">CLI セットアップガイド</p>

      <div className="space-y-8">
        <section>
          <h2 className="text-sm font-semibold text-rp-100 mb-2">1. インストール</h2>
          <CodeBlock code="npm install -g @rippro/judge@latest" />
        </section>

        <section>
          <h2 className="text-sm font-semibold text-rp-100 mb-2">2. ログイン</h2>
          <CodeBlock code="Teamsタブでチームを作成、または既存のチームに、招待コードを入力することで参加" />
        </section>

        <section>
          <h2 className="text-sm font-semibold text-rp-100 mb-2">3. 初期化</h2>
          <CodeBlock code="rj init" />
        </section>

        <SetupTokenSection eventId={eventId} isSolver={isSolver} />

        <section>
          <h2 className="text-sm font-semibold text-rp-100 mb-2">5. 提出</h2>
          <CodeBlock code={`rj submit H7CA solution.cpp\nrj submit H7CA solution.py`} />
        </section>

        {(session?.role === "admin" || session?.role === "creator") && (
          <section className="border-t border-rp-border pt-8">
            <h2 className="text-sm font-semibold text-rp-100 mb-4">管理者向け</h2>
            <div className="space-y-3 text-sm text-rp-muted">
              <p>トークン発行: Admin ページ → 対象チームの CLI Tokens</p>
              <p>問題管理: Creator ページ</p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
