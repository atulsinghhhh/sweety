import { Coffee, Moon, Sun, Sunrise } from 'lucide-react'

// Presentation details for each time slot (labels stay in lib/readings.js)
export const SLOT_META = {
  MORNING: { icon: Sunrise, short: 'Fasting', hint: 'On waking, before food' },
  AFTER_BREAKFAST: { icon: Coffee, short: 'Breakfast', hint: 'After your first meal' },
  AFTER_LUNCH: { icon: Sun, short: 'Lunch', hint: 'After your midday meal' },
  AFTER_DINNER: { icon: Moon, short: 'Dinner', hint: 'After your evening meal' },
}
