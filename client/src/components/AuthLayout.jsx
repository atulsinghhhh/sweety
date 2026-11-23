import { Link } from 'react-router-dom'

export default function AuthLayout({ title, description, children }) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <section className="flex flex-col justify-between gap-33 bg-carbon px-6 py-33 text-canvas sm:px-66 sm:py-66">
        <Link to="/" className="self-start text-heading-sm lowercase text-canvas hover:no-underline">
          sweety
        </Link>
        <div className="max-w-md">
          <p className="text-heading-lg">Know your numbers.</p>
          <p className="mt-15 text-body text-graphite">
            Record up to four blood glucose readings a day and review daily, month-to-date and monthly reports.
          </p>
        </div>
        <span className="hidden text-caption text-graphite lg:block">blood glucose tracker</span>
      </section>

      <section className="flex items-center px-6 py-33 sm:px-66">
        <div className="w-full max-w-sm animate-in fade-in duration-300">
          <h1 className="text-heading">{title}</h1>
          {description && <p className="mt-2 text-body text-muted-foreground">{description}</p>}
          <div className="mt-33">{children}</div>
        </div>
      </section>
    </div>
  )
}
