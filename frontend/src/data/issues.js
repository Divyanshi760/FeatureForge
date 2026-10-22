/**
 * Presentation constants shared across the three portals.
 *
 * Priority is auto-computed from reportCount (number of distinct users who
 * reported the same problem). The backend owns the authoritative computation;
 * this mirror is used only for optimistic/display logic.
 *   1 report   → low
 *   2-4        → medium
 *   5-9        → high
 *   10+        → critical
 */

export function computePriority(count) {
  if (count >= 10) return 'critical'
  if (count >= 5) return 'high'
  if (count >= 2) return 'medium'
  return 'low'
}

export const PRIORITY_META = {
  critical: { label: 'Critical', color: 'bg-red-100 text-red-700 border-red-200', threshold: '10+ reports' },
  high:     { label: 'High',     color: 'bg-orange-100 text-orange-700 border-orange-200', threshold: '5-9 reports' },
  medium:   { label: 'Medium',   color: 'bg-yellow-100 text-yellow-700 border-yellow-200', threshold: '2-4 reports' },
  low:      { label: 'Low',      color: 'bg-green-100 text-green-700 border-green-200', threshold: '1 report' },
}

export const STATUS_META = {
  open:        { label: 'Open',        color: 'bg-blue-100 text-blue-700 border-blue-200' },
  assigned:    { label: 'Assigned',    color: 'bg-purple-100 text-purple-700 border-purple-200' },
  in_progress: { label: 'In Progress', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  resolved:    { label: 'Resolved',    color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  closed:      { label: 'Closed',      color: 'bg-gray-100 text-gray-600 border-gray-200' },
}
