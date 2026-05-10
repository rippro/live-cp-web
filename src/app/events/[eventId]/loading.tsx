export default function EventLoading() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      {/* Header */}
      <div className="mb-12 pb-8 border-b border-rp-border">
        <div className="flex items-start justify-between flex-wrap gap-6">
          <div>
            <div className="h-5 w-16 rounded-full bg-rp-800 mb-3 animate-pulse" />
            <div className="h-10 w-64 rounded bg-rp-800 mb-3 animate-pulse" />
            <div className="h-3 w-48 rounded bg-rp-800 animate-pulse" />
          </div>
          <div className="h-9 w-28 rounded bg-rp-800 animate-pulse" />
        </div>
      </div>

      {/* Stats */}
      <div className="bg-rp-border grid grid-cols-2 sm:grid-cols-4 gap-px rounded-lg overflow-hidden mb-10">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-rp-900 px-6 py-6">
            <div className="h-10 w-12 rounded bg-rp-800 mb-2 animate-pulse" />
            <div className="h-3 w-16 rounded bg-rp-800 animate-pulse" />
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card-surface p-5">
            <div className="h-4 w-20 rounded bg-rp-800 mb-2 animate-pulse" />
            <div className="h-3 w-28 rounded bg-rp-800 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
