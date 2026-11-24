import { Label } from '@/components/ui/label'

// Label + control + error message, wired together for screen readers.
// `children` is a render function receiving the aria props for the control.
export default function FormField({ id, label, error, hint, children }) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} className="pl-1">
        {label}
      </Label>
      {children({ id, 'aria-invalid': Boolean(error) || undefined, 'aria-describedby': describedBy })}
      {error ? (
        <p id={`${id}-error`} role="alert" className="pl-1 text-[13px] text-destructive">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="pl-1 text-[13px] text-muted-foreground">
            {hint}
          </p>
        )
      )}
    </div>
  )
}
