interface RevealProps {
  delay?: number
  className?: string
  children: React.ReactNode
}

/** Fades + slides an element in once on mount, staggered by `delay` (ms). */
export default function Reveal({ delay = 0, className = '', children }: RevealProps) {
  return (
    <div className={`animate-fade-in ${className}`} style={{ animationDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}
