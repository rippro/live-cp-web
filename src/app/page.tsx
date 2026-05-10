import Link from "next/link";
import { GlobalNav } from "@/components/nav/GlobalNav";

export default function Home() {
  return (
    <>
      <GlobalNav />
      <main className="min-h-screen bg-rp-900 pt-14">

        {/* Hero */}
        <section className="border-b border-rp-border">
          <div className="mx-auto max-w-7xl px-6">
            {/* top bar */}
            <div className="py-3 flex items-center justify-between border-b border-rp-border">
              <span className="text-[11px] font-mono text-rp-muted tracking-[0.15em] uppercase">
                Competitive Programming Judge System
              </span>
              <span className="text-[11px] font-mono text-rp-muted">2025</span>
            </div>

            {/* two-column hero */}
            <div className="grid lg:grid-cols-[1fr_400px] gap-12 items-center py-16 lg:py-24">
              <div>
                <h1
                  className="font-extrabold text-rp-100 leading-[0.88] tracking-[-0.04em] mb-8"
                  style={{ fontSize: "clamp(56px, 8vw, 92px)" }}
                >
                  RipPro<br />
                  <span className="text-rp-300">Judge.</span>
                </h1>
                <p className="text-base text-rp-muted leading-relaxed mb-10 max-w-[380px]">
                  ローカル実行型ジャッジシステム。コードはサーバーに送らない。
                  テストケース配布と AC 記録だけをサーバーが担当。
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/events" className="btn-primary inline-flex items-center gap-2">
                    イベントに参加する
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                  <a
                    href="https://www.npmjs.com/package/@rippro/judge"
                    target="_blank"
                    rel="noreferrer"
                    className="btn-ghost inline-flex items-center gap-2"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M0 7.334v8h6.666v1.332H12v-1.332h12v-8H0zm6.666 6.664H5.334v-4H3.999v4H1.335V8.667h5.331v5.331zm4 0v1.336H8.001V8.667h5.334v5.332h-2.669v-.001zm12.001 0h-1.33v-4h-1.336v4h-1.335v-4h-1.33v4h-2.671V8.667h8.002v5.331zM10.665 10H12v2.667h-1.335V10z"/>
                    </svg>
                    npm install
                  </a>
                </div>
              </div>

              {/* Terminal mock */}
              <div className="hidden lg:block">
                <div className="rounded-xl overflow-hidden shadow-lg" style={{ background: "#111111" }}>
                  {/* Title bar */}
                  <div className="flex items-center gap-1.5 px-4 py-3" style={{ background: "#1c1c1c" }}>
                    <div className="w-3 h-3 rounded-full" style={{ background: "#FF5F57" }} />
                    <div className="w-3 h-3 rounded-full" style={{ background: "#FFBD2E" }} />
                    <div className="w-3 h-3 rounded-full" style={{ background: "#28C840" }} />
                    <span className="ml-3 text-[11px] font-mono" style={{ color: "rgba(255,255,255,0.25)" }}>
                      rippro-judge — zsh
                    </span>
                  </div>
                  {/* Content */}
                  <div className="p-5 font-mono text-[13px] leading-relaxed space-y-1">
                    <p>
                      <span style={{ color: "rgba(255,255,255,0.25)" }}>~ $</span>{" "}
                      <span style={{ color: "#fff" }}>npx @rippro/judge@latest init</span>
                    </p>
                    <p style={{ color: "#34D399" }}>✓ Authenticated: alice</p>
                    <p style={{ color: "rgba(255,255,255,0.45)" }}>  Event: Shinkan Contest 2025</p>
                    <p style={{ color: "rgba(255,255,255,0.45)" }}>  3 problems available</p>
                    <p className="pt-2">
                      <span style={{ color: "rgba(255,255,255,0.25)" }}>~ $</span>{" "}
                      <span style={{ color: "#fff" }}>rj submit 001 solution.cpp</span>
                    </p>
                    <p style={{ color: "rgba(255,255,255,0.45)" }}>  Compiling...</p>
                    <p style={{ color: "rgba(255,255,255,0.45)" }}>  Running 42 test cases...</p>
                    <p style={{ color: "#34D399", fontWeight: 600 }}>✓ AC — 001 solved! (42/42)</p>
                    <p className="pt-1" style={{ color: "rgba(255,255,255,0.2)", fontSize: "11px" }}>
                      Score +100pt  ·  Rank #3  ↑2
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features - gap-px trick: grid lines as borders */}
        <section className="border-b border-rp-border bg-rp-border">
          <div className="grid md:grid-cols-3 gap-px">
            {[
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <rect x="3" y="3" width="14" height="14" rx="2" />
                    <path d="M3 8h14M8 8v9" />
                  </svg>
                ),
                title: "ローカル実行",
                desc: "提出コードはサーバーに送信されない。すべてあなたの PC 上で動作する。",
              },
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <circle cx="10" cy="10" r="7" />
                    <path d="M10 6.5v3.5l2.5 2.5" />
                  </svg>
                ),
                title: "リアルタイム AC",
                desc: "全テストケース AC 時のみサーバーへ報告。ランキングに即座に反映。",
              },
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <rect x="2" y="4" width="16" height="12" rx="2" />
                    <path d="M6 9l3 3-3 3M11 15h4" />
                  </svg>
                ),
                title: "CLI ツール",
                desc: "npx @rippro/judge@latest で即実行。C++ / Python 両対応。",
              },
            ].map((f) => (
              <div key={f.title} className="bg-rp-900 px-8 py-10">
                <div className="mb-5 text-rp-400">{f.icon}</div>
                <h3 className="text-base font-semibold text-rp-100 mb-2 tracking-tight">{f.title}</h3>
                <p className="text-sm text-rp-muted leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Quick start */}
        <section className="border-b border-rp-border">
          <div className="mx-auto max-w-7xl px-6 py-16">
            <p className="text-[11px] font-mono text-rp-muted tracking-[0.15em] uppercase mb-8">Quick Start</p>
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <p className="text-xs text-rp-500 mb-3 font-medium">1 — CLI をインストール</p>
                <pre className="rounded-lg bg-rp-800 border border-rp-border p-4 text-sm font-mono text-rp-400 overflow-x-auto">
                  <code>npx @rippro/judge@latest</code>
                </pre>
              </div>
              <div>
                <p className="text-xs text-rp-500 mb-3 font-medium">2 — 問題を解いて提出</p>
                <pre className="rounded-lg bg-rp-800 border border-rp-border p-4 text-sm font-mono text-rp-400 overflow-x-auto">
                  <code>{`rj init            # イベント初期化
rj submit 001 sol.cpp`}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-rp-border">
          <div className="mx-auto max-w-7xl px-6 py-8 flex items-center justify-between">
            <span className="text-sm font-bold text-rp-100 tracking-tight">RipPro</span>
            <p className="text-xs text-rp-muted">競技プログラミング新歓向けジャッジシステム</p>
          </div>
        </footer>
      </main>
    </>
  );
}
