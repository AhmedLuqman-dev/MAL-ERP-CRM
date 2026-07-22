export function LoadingSpinner({ label = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-8 h-8 border-2 border-warm-200 border-t-charcoal-700 rounded-full animate-spin" />
      <p className="mt-3 text-sm text-charcoal-500">{label}</p>
    </div>
  );
}
