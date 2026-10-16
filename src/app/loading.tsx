export default function Loading() {
  return (
    <div className="min-h-[70vh] bg-black text-white px-4 pb-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl pt-8">
        <div className="mb-8 h-10 w-3/4 animate-pulse rounded-xl bg-slate-800/80" />

        <div className="mb-8 h-[320px] w-full animate-pulse rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900" />

        <div className="mb-6 flex gap-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-9 w-28 animate-pulse rounded-full bg-slate-800/80"
            />
          ))}
        </div>

        <div className="space-y-6">
          {Array.from({ length: 4 }).map((_, rowIndex) => (
            <div key={rowIndex} className="space-y-4">
              <div className="h-6 w-40 animate-pulse rounded-lg bg-slate-800/80" />
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                {Array.from({ length: 6 }).map((__, cardIndex) => (
                  <div
                    key={`${rowIndex}-${cardIndex}`}
                    className="h-56 animate-pulse rounded-2xl bg-slate-800/80"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
