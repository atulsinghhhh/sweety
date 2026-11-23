export default function EmptyState({ title, description, action }) {
  return (
    <div className="flex flex-col items-start gap-15 border-y border-steel py-33">
      <div>
        <p className="text-subheading">{title}</p>
        {description && <p className="mt-2 text-body text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  )
}
