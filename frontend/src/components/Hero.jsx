import { ArrowIcon, CheckIcon } from './icons'
import FlagCard from './FlagCard'

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="container-ff relative pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="max-w-3xl">
          <a
            href="#experiments"
            className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-surface/70 px-3.5 py-1.5 text-sm text-ink-soft backdrop-blur transition-colors hover:text-ink"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-signal-green" />
            Self-hosted · Governed · Deterministic
          </a>

          <h1 className="display mt-7 text-[2.6rem] leading-[1.02] text-ink xs:text-[3.1rem] sm:text-[4.25rem] sm:leading-[0.98] md:text-[5rem]">
            Ship the code.
            <br />
            Control the release.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
            FeatureForge splits deploying your code from releasing it to users.
            It reviews every production change, measures what each feature
            actually does, and rolls a launch back on its own when it goes wrong.
          </p>

          <div className="mt-9 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <a href="#cta" className="btn-accent">
              See it in action
              <ArrowIcon className="h-4 w-4" />
            </a>
            <a href="#capabilities" className="btn-ghost">
              Explore the platform
            </a>
          </div>

          <ul className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-faint">
            {['No credit card', 'Docker Compose deploy', 'Open SDK'].map((t) => (
              <li key={t} className="inline-flex items-center gap-1.5">
                <CheckIcon className="h-4 w-4 text-signal-green" />
                {t}
              </li>
            ))}
          </ul>
        </div>

        {/* Product mock: FeatureForge's own flag panel */}
        <div className="relative mx-auto mt-16 max-w-4xl">
          <div className="animate-float">
            <FlagCard />
          </div>
        </div>
      </div>
    </section>
  )
}
