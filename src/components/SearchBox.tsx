import { useEffect, useRef, useState } from 'react'
import { SearchIcon, XMarkIcon } from './icons'

interface SearchBoxProps {
  value: string
  onChange: (value: string) => void
}

/**
 * A plain magnifier icon that expands into an underlined, typable field on
 * click — the icon itself swaps to a cross for closing/clearing. Collapses
 * back to just the icon on blur once the field is empty.
 */
export default function SearchBox({ value, onChange }: SearchBoxProps) {
  const [expanded, setExpanded] = useState(() => Boolean(value))
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (expanded) inputRef.current?.focus()
  }, [expanded])

  function handleIconClick() {
    if (expanded) {
      onChange('')
      setExpanded(false)
    } else {
      setExpanded(true)
    }
  }

  function handleBlur() {
    if (!value) setExpanded(false)
  }

  return (
    <div className="flex items-center">
      <button
        type="button"
        onClick={handleIconClick}
        aria-label={expanded ? 'Clear search' : 'Search by name'}
        className="cursor-pointer rounded p-1 text-ink-400 transition-colors hover:text-ink-700 dark:text-ink-500 dark:hover:text-white"
      >
        {expanded ? <XMarkIcon className="h-4 w-4" /> : <SearchIcon className="h-4 w-4" />}
      </button>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            onChange('')
            setExpanded(false)
            inputRef.current?.blur()
          }
        }}
        placeholder="Search by name…"
        aria-label="Search by name"
        className={`border-0 border-b border-ink-300 bg-transparent text-sm text-ink-900 placeholder:text-ink-400 transition-all duration-200 focus:outline-none dark:border-white/20 dark:text-ink-100 dark:placeholder:text-ink-500 ${
          expanded ? 'ml-1 w-40 px-0.5 py-0.5 opacity-100' : 'w-0 border-transparent p-0 opacity-0'
        }`}
      />
    </div>
  )
}
