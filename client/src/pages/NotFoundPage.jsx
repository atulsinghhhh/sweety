import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Logo from '@/components/Logo'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-svh flex-col px-5 py-6 sm:px-12">
      <Link to="/" aria-label="Sweety home" className="self-start hover:no-underline">
        <Logo />
      </Link>
      <div className="animate-rise flex flex-1 flex-col items-start justify-center gap-5">
        <p className="eyebrow text-seal-ink">Error 404</p>
        <h1 className="font-display text-[56px] leading-none sm:text-display">
          Page <em>not found</em>.
        </h1>
        <p className="text-muted-foreground">The page you're looking for doesn't exist or has moved.</p>
        <Button asChild size="lg" className="group/cta mt-2">
          <Link to="/dashboard">
            Go to dashboard <ArrowRight strokeWidth={2} className="transition-transform group-hover/cta:translate-x-0.5" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
