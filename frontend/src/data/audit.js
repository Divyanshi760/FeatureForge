// Action taxonomy. Each kind carries its own colour and copy so the log
// reads at a glance: red = automatic protection, amber = emergency access,
// green = governed approval, blue = ops, ink = ordinary config change.
export const ACTION_META = {
  config_change: {
    label: 'Config change',
    badge: 'bg-canvas text-ink border border-line-strong',
    dot: 'bg-ink',
  },
  approval: {
    label: 'Approval',
    badge: 'bg-[#e6f6ec] text-signal-green',
    dot: 'bg-signal-green',
  },
  ops_toggle: {
    label: 'Ops toggle',
    badge: 'bg-[#eaf0fb] text-signal-blue',
    dot: 'bg-signal-blue',
  },
  break_glass: {
    label: 'Break-glass',
    badge: 'bg-[#fdf0d9] text-[#b5811f]',
    dot: 'bg-[#b5811f]',
  },
  auto_rollback: {
    label: 'Auto-rollback',
    badge: 'bg-[#fbe6e5] text-[#c0392b]',
    dot: 'bg-[#c0392b]',
  },
}

// Order the action filter pills should appear in.
export const ACTION_ORDER = [
  'config_change',
  'approval',
  'ops_toggle',
  'break_glass',
  'auto_rollback',
]
