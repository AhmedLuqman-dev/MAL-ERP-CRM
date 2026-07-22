import { useLocation, Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const routeLabels = {
  '/': 'Dashboard',
  '/customers': 'Customers',
  '/products': 'Products',
  '/inventory': 'Inventory',
  '/challans': 'Sales Challans',
  '/challans/new': 'Create Challan',
};

export function Navbar({ onMenuClick }) {
  const location = useLocation();
  const { user } = useAuth();

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const getBreadcrumbs = () => {
    const path = location.pathname;
    const parts = path.split('/').filter(Boolean);
    const crumbs = [{ label: 'Home', path: '/' }];
    let acc = '';
    parts.forEach((part) => {
      acc += '/' + part;
      const label = routeLabels[acc] || part;
      crumbs.push({ label, path: acc });
    });
    return crumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/80 backdrop-blur border-b border-warm-200/60 flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-warm-100 text-charcoal-600"
        >
          <Menu className="w-5 h-5" />
        </button>

        <nav className="hidden md:flex items-center gap-2 text-sm">
          {breadcrumbs.map((crumb, idx) => (
            <span key={crumb.path} className="flex items-center gap-2">
              {idx > 0 && <span className="text-charcoal-300">/</span>}
              {idx === breadcrumbs.length - 1 ? (
                <span className="font-medium text-charcoal-800">{crumb.label}</span>
              ) : (
                <Link to={crumb.path} className="text-charcoal-500 hover:text-charcoal-800 transition-colors">
                  {crumb.label}
                </Link>
              )}
            </span>
          ))}
        </nav>
      </div>

      <div className="hidden md:flex flex-1 justify-center">
        <span className="text-sm font-medium text-charcoal-500">{today}</span>
      </div>

      <div className="flex-1 flex justify-end">
        <div className="flex items-center gap-2 text-sm">
          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 font-medium capitalize">
            {user?.role}
          </span>
        </div>
      </div>
    </header>
  );
}
