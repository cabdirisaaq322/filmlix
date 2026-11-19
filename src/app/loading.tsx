export default function Loading() {
  return (
    <div className="min-h-[85vh] bg-[#08080c] text-white px-4 pb-20 sm:px-6 lg:px-8">
      <div className="nf-row-pad w-full pt-10 space-y-8">
        {/* Billboard Hero Skeleton */}
        <div className="relative h-[55vh] min-h-[400px] w-full overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.03] animate-shimmer" />

        {/* Tab pills skeleton */}
        <div className="flex gap-2.5 overflow-hidden">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-10 w-28 shrink-0 rounded-full border border-white/[0.06] bg-white/[0.03] animate-pulse"
            />
          ))}
        </div>

        {/* Media Rows Skeleton */}
        <div className="space-y-8">
          {Array.from({ length: 3 }).map((_, rowIndex) => (
            <div key={rowIndex} className="space-y-4">
              <div className="h-6 w-44 rounded-md bg-white/[0.05] animate-pulse" />
              <div className="flex gap-3.5 overflow-hidden">
                {Array.from({ length: 6 }).map((__, cardIndex) => (
                  <div
                    key={`${rowIndex}-${cardIndex}`}
                    className="aspect-[2/3] w-[38vw] min-w-[130px] max-w-[220px] shrink-0 rounded-xl border border-white/[0.06] bg-white/[0.03] animate-pulse"
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
