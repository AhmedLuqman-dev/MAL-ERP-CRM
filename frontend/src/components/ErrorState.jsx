import { AlertCircle } from 'lucide-react';

export function ErrorState({ message = 'Something went wrong', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
        <AlertCircle className="w-7 h-7 text-red-500" />
      </div>
      <h3 className="mt-4 text-base font-medium text-charcoal-700">Error</h3>
      <p className="mt-1 text-sm text-charcoal-500 text-center max-w-sm">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary mt-4">
          Try again
        </button>
      )}
    </div>
  );
}
