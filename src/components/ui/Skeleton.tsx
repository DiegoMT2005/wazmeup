export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-gray-800 ${className}`}
    />
  )
}

export function CardSkeleton() {
  return (
    <div className="bg-secondary/10 border border-gray-800 rounded-xl p-6 space-y-4">
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-3 w-1/4" />
    </div>
  )
}
