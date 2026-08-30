interface SkeletonProps {
  className?: string
  style?: React.CSSProperties
}

export default function Skeleton({ className = '', style }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      style={style}
      className={`relative overflow-hidden rounded-md bg-ink-200 dark:bg-ink-800 ${className}`}
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent dark:via-white/10" />
    </div>
  )
}
