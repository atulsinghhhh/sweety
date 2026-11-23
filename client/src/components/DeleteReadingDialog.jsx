import { useState } from 'react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import api, { getErrorMessage } from '@/lib/api'
import { formatDate } from '@/lib/dates'

export default function DeleteReadingDialog({ reading, onOpenChange, onDeleted }) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async (event) => {
    event.preventDefault()
    setDeleting(true)
    try {
      await api.delete(`/readings/${reading.id}`)
      toast.success('Reading deleted.')
      onOpenChange(false)
      onDeleted?.(reading)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <AlertDialog open={Boolean(reading)} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-subheading">Delete this reading?</AlertDialogTitle>
          <AlertDialogDescription>
            {reading &&
              `${reading.slotLabel} · ${reading.value} mg/dL on ${formatDate(reading.readingDate)}. This can't be undone.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Deleting…' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
