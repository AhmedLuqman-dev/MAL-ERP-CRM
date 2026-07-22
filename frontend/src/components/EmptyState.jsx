import { Inbox } from 'lucide-react';

export function EmptyState({ title = 'No data found', message, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-14 h-14 rounded-full bg-warm-100 flex items-center justify-center">
        <Inbox className="w-7 h-7 text-charcoal-400" />
      </div>
      <h3 className="mt-4 text-base font-medium text-charcoal-700">{title}</h3>
      {message && <p className="mt-1 text-sm text-charcoal-500 text-center max-w-sm">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
