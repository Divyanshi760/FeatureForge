const STATS = [
  { value: 'Minutes', label: 'to catch and reverse a bad rollout, not hours' },
  { value: '100%', label: 'Production changes captured in an immutable audit trail' },
  { value: '4-eyes', label: 'Review enforced before any release flag reaches users' },
]

export default function Metrics() {
  return (
    <section className="border-y border-line bg-surface">
      <div className="container-ff py-14">
        <p className="eyebrow text-center">Built for teams that can’t afford a bad launch</p>
        <div className="mt-10 grid gap-10 sm:grid-cols-3">
          {STATS.map((s) => (
            <div key={s.value} className="text-center">
              <div className="display text-5xl text-ink md:text-6xl">{s.value}</div>
              <p className="mx-auto mt-3 max-w-[16rem] text-sm leading-relaxed text-ink-soft">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
