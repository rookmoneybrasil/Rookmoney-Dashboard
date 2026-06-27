import { CATEGORY_LABELS, CATEGORY_COLORS, type BlogCategory } from '@/lib/blog'

export function CategoryBadge({ category, className = '' }: { category: BlogCategory; className?: string }) {
  const colors = CATEGORY_COLORS[category]
  const label = CATEGORY_LABELS[category]

  return (
    <span className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${colors.bg} ${colors.text} ${colors.border} ${className}`}>
      {label}
    </span>
  )
}
