import { Loader2, AlertCircle, Inbox } from 'lucide-react';

export function Loader({ text = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-muted gap-3">
      <Loader2 size={28} className="animate-spin text-accent-500" />
      <p className="text-sm">{text}</p>
    </div>
  );
}

export function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-muted gap-3">
      <AlertCircle size={28} className="text-danger" />
      <p className="text-sm">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-outline px-4 py-2 text-sm">
          Retry
        </button>
      )}
    </div>
  );
}

export function EmptyState({ message = 'Nothing here yet.', action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-muted gap-3">
      <Inbox size={28} />
      <p className="text-sm">{message}</p>
      {action}
    </div>
  );
}
