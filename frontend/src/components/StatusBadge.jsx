import { capitalize } from '../utils/format';

const statusConfig = {
  lead: 'badge-lead',
  active: 'badge-active',
  inactive: 'badge-inactive',
  draft: 'badge-draft',
  confirmed: 'badge-confirmed',
  cancelled: 'badge-cancelled',
  retail: 'badge-retail',
  wholesale: 'badge-wholesale',
  distributor: 'badge-distributor',
};

export function StatusBadge({ status }) {
  const className = statusConfig[status] || 'badge bg-warm-100 text-warm-600 border border-warm-200';
  return <span className={className}>{capitalize(status)}</span>;
}
