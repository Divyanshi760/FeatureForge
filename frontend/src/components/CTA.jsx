import { ArrowIcon } from './icons'

export default function CTA() {
  return (
    <section id="cta" className="container-ff py-24 md:py-32">
      <div className="relative overflow-hidden rounded-[2rem] border border-line bg-ink px-8 py-20 text-center md:px-16">
        {/* warm glow */}
        <div
          className="pointer-events-none absolute -bottom-40 left-1/2 h-[30rem] w-[46rem] -translate-x-1/2 rounded-full opacity-30 blur-3xl"
          style={{
            background:
              'radial-gradient(50% 50% at 50% 50%, #ff8933 0%, transparent 70%)',
          }}
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-2xl">
          <h2 className="display text-4xl text-surface md:text-6xl">
            Ship the code.
            <br />
            Control the release.
          </h2>
          <p className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-[#c9c5bd]">
            Bring exposure, review, impact, and rollback together in one
            governed workflow.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href="#top" className="btn-accent px-6 py-3">
              Request a demo
              <ArrowIcon className="h-4 w-4" />
            </a>
            <a
              href="#capabilities"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-[0.95rem] font-medium text-surface transition-colors hover:bg-white/10"
            >
              Explore the platform
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
