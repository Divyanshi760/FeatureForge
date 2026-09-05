/** The FeatureForge wordmark: a squared line-mark + tight-tracked name. */
export default function Logo({ className = '' }) {
  return (
    <a href="#top" className={`flex items-center gap-2.5 ${className}`}>
      <span
        className="grid h-7 w-7 place-items-center rounded-md border border-ink"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 20 20 4M4 4h6M4 4v6" />
        </svg>
      </span>
      <span className="text-[1.05rem] font-semibold tracking-[-0.02em] text-ink">
        FeatureForge
      </span>
    </a>
  )
}
