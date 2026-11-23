import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-svh flex-col items-start justify-center gap-15 px-6 sm:px-66">
      <p className="text-caption text-muted-foreground">404</p>
      <h1 className="text-heading-lg">Page not found.</h1>
      <Link to="/dashboard" className="text-body">
        Go to dashboard
      </Link>
    </div>
  )
}
