import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Logo from './Logo'
import { ArrowIcon } from './icons'

const LINKS = [
  { label: 'Product', href: '#capabilities' },
  { label: 'Governance', href: '#governance' },
  { label: 'Experiments', href: '#experiments' },
  { label: 'Rollouts', href: '#rollouts' },
  { label: 'Security', href: '#security' },
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        scrolled
          ? 'border-b border-line bg-canvas/80 backdrop-blur-md'
          : 'border-b border-transparent'
      }`}
    >
      <nav className="container-ff relative flex h-16 items-center justify-between">
        <Logo />

        <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-full px-3.5 py-2 text-sm font-medium text-ink-soft transition-colors hover:text-ink"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            to="/login"
            className="text-sm font-medium text-ink-soft transition-colors hover:text-ink"
          >
            Sign in
          </Link>
          <a href="#cta" className="btn-primary">
            Request a demo
            <ArrowIcon className="h-4 w-4" />
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="grid h-10 w-10 place-items-center rounded-full border border-line-strong md:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <span className="flex flex-col gap-1.5">
            <span className="block h-0.5 w-5 rounded-full bg-ink" />
            <span className="block h-0.5 w-5 rounded-full bg-ink" />
          </span>
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="container-ff pb-5 md:hidden">
          <div className="card flex flex-col p-2">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 text-sm font-medium text-ink-soft hover:bg-canvas"
              >
                {l.label}
              </a>
            ))}
            <a href="#cta" onClick={() => setOpen(false)} className="btn-primary mt-2 justify-center">
              Request a demo
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
