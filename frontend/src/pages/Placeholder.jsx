import { Link } from 'react-router-dom'
import { ArrowIcon } from '../components/icons'

/** Stand-in for dashboard pages that are on the roadmap but not built yet. */
export default function Placeholder({ title, icon: Icon, blurb }) {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="card flex flex-col items-center px-8 py-20 text-center">
        {Icon ? (
          <span className="grid h-14 w-14 place-items-center rounded-2xl border border-line bg-canvas text-ink">
            <Icon className="h-6 w-6" />
          </span>
        ) : null}
        <p className="eyebrow mt-6">Coming soon</p>
        <h1 className="display mt-3 text-3xl text-ink md:text-4xl">{title}</h1>
        <p className="mt-3 max-w-md text-ink-soft">
          {blurb || `The ${title} page is next up in the build. The design and data model are ready, the screen just is not wired in yet.`}
        </p>
        <Link to="/dashboard" className="btn-ghost mt-8">
          <ArrowIcon className="h-4 w-4 rotate-180" />
          Back to overview
        </Link>
      </div>
    </div>
  )
}
