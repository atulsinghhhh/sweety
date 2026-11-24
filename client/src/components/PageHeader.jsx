// Page title block: eyebrow, editorial serif title (wrap the accent word in
// <em> for the light italic), supporting line, and actions on the right.
export default function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="mb-10 flex flex-col gap-6 lg:mb-12 lg:flex-row lg:items-end lg:justify-between">
      <div className="animate-rise max-w-2xl">
        {eyebrow && <p className="eyebrow text-brand-ink">{eyebrow}</p>}
        <h1 className="mt-3 font-display text-[40px] leading-[1.05] sm:text-heading-lg">{title}</h1>
        {description && <p className="mt-3 text-[16px] text-muted-foreground">{description}</p>}
      </div>
      {actions && (
        <div className="animate-rise flex flex-wrap items-end gap-3" style={{ '--delay': '80ms' }}>
          {actions}
        </div>
      )}
    </div>
  )
}
