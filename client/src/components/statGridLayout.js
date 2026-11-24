export const STATS = [
  { key: 'count', label: 'total readings', unit: null },
  { key: 'highest', label: 'highest', unit: 'mg/dL' },
  { key: 'lowest', label: 'lowest', unit: 'mg/dL' },
  { key: 'average', label: 'average', unit: 'mg/dL' },
]

// A 1px gap over a hairline background draws the rules between cells at every breakpoint
export const GRID = 'grid grid-cols-2 gap-px border-t border-b border-t-ink border-b-steel bg-steel lg:grid-cols-4'
export const CELL = 'bg-background px-15 py-22 sm:px-22'
