export const TYPE_BADGE = {
  Release: 'bg-canvas text-ink border border-line-strong',
  Experiment: 'bg-accent-soft text-accent-strong',
  Ops: 'bg-[#e6f6ec] text-signal-green',
  Permission: 'bg-[#eaf0fb] text-signal-blue',
}

// Governed types need four-eyes approval to change in prod; ops flags do not.
export const GOVERNED = { Release: true, Experiment: true, Permission: true, Ops: false }
