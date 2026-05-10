export default function ProblemsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8 pb-6 border-b border-rp-border flex items-end justify-between">
        <div>
          <div className="h-3 w-16 rounded bg-rp-800 mb-2 animate-pulse" />
          <div className="h-7 w-32 rounded bg-rp-800 animate-pulse" />
        </div>
        <div className="h-4 w-10 rounded bg-rp-800 animate-pulse" />
      </div>
      <div className="divide-y divide-rp-border border-t border-rp-border">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4 py-4">
            <div className="w-10 h-5 rounded bg-rp-800 animate-pulse flex-shrink-0" />
            <div className="flex-1 h-4 rounded bg-rp-800 animate-pulse" />
            <div className="hidden sm:block w-16 h-3 rounded bg-rp-800 animate-pulse" />
            <div className="hidden sm:block w-12 h-4 rounded bg-rp-800 animate-pulse" />
            <div className="w-8 h-5 rounded bg-rp-800 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
