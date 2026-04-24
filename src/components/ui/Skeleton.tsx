import { clsx } from "clsx";

interface SkeletonProps {
  className?: string;
  lines?: number;
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        "animate-pulse bg-bg-hover rounded-lg",
        className
      )}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-bg-card rounded-2xl border border-border p-5 space-y-3">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-20 w-full" />
    </div>
  );
}
