import { Activity, ArrowDownRight, ArrowUpRight, Hash } from 'lucide-react'

// Average leads: it is the number people check first
export const STATS = [
  { key: 'average', label: 'Average', unit: 'mg/dL', icon: Activity, featured: true },
  { key: 'highest', label: 'Highest', unit: 'mg/dL', icon: ArrowUpRight },
  { key: 'lowest', label: 'Lowest', unit: 'mg/dL', icon: ArrowDownRight },
  { key: 'count', label: 'Total readings', unit: null, icon: Hash },
]

export const GRID = 'grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4'
