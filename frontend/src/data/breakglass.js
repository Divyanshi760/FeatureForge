// Sessions may not be requested for longer than this.
export const MAX_DURATION_MIN = 120

// Durations offered in the request form, all within the cap.
export const DURATION_OPTIONS = [
  { label: '15 minutes', min: 15 },
  { label: '30 minutes', min: 30 },
  { label: '1 hour', min: 60 },
  { label: '2 hours', min: 120 },
]
