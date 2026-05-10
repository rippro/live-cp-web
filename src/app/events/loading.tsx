import { GlobalNav } from "@/components/nav/GlobalNav";

export default function EventsLoading() {
  return (
    <>
      <GlobalNav />
      <main className="min-h-screen bg-rp-900 pt-14">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="mb-12 border-b border-rp-border pb-8">
            <div className="h-3 w-16 rounded bg-rp-800 mb-3 animate-pulse" />
            <div className="h-8 w-48 rounded bg-rp-800 animate-pulse" />
          </div>
          <div className="divide-y divide-rp-border">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between py-6">
                <div className="flex items-center gap-5">
                  <div className="w-2 h-2 rounded-full bg-rp-800 flex-shrink-0" />
                  <div>
                    <div className="h-4 w-36 rounded bg-rp-800 mb-2 animate-pulse" />
                    <div className="h-3 w-24 rounded bg-rp-800 animate-pulse" />
                  </div>
                </div>
                <div className="h-5 w-14 rounded-full bg-rp-800 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
