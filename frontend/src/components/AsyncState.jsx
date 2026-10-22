export function Loading({ label = 'Loading…' }) {
  return (
    <div className="card px-6 py-12 text-center text-ink-faint text-sm">{label}</div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="card px-6 py-12 text-center space-y-3">
      <p className="text-sm text-red-600">{message || 'Something went wrong.'}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-xs font-semibold text-ink-soft underline underline-offset-2"
        >
          Try again
        </button>
      )}
    </div>
  );
}
