interface SkeletonProps {
  className?: string
  style?: React.CSSProperties
}

export default function Skeleton({ className = '', style }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      style={style}
      className={`animate-pulse rounded-md bg-ink-200 dark:bg-ink-800 ${className}`}
    />
  )
}
