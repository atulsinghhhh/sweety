export default function PageHeader({ title, description, actions }) {
  return (
    <div className="mb-33 flex flex-col gap-15 border-b border-ink pb-22 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-heading-lg">{title}</h1>
        {description && <p className="mt-2 text-body text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-end gap-15">{actions}</div>}
    </div>
  )
}
