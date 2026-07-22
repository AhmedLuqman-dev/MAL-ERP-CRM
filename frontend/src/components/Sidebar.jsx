import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROUTES, ROLE_LABELS } from '../constants';
import { ROLE_PERMISSIONS } from '../utils/permissions';
import { getInitials } from '../utils/format';
import {
  LayoutDashboard,
  Users,
  Package,
  Boxes,
  FileText,
  LogOut,
  Settings,
} from 'lucide-react';

const navItems = [
  { path: ROUTES.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
  { path: ROUTES.CUSTOMERS, label: 'Customers', icon: Users },
  { path: ROUTES.PRODUCTS, label: 'Products', icon: Package },
  { path: ROUTES.INVENTORY, label: 'Inventory', icon: Boxes },
  { path: ROUTES.CHALLANS, label: 'Sales Challans', icon: FileText },
];

export function Sidebar({ open, onClose }) {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-charcoal-900/30 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-40 h-full w-64 bg-charcoal-900 text-charcoal-100 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-2.5 px-5 h-16 border-b border-charcoal-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-base font-semibold text-white tracking-tight">MAL ERP/CRM</span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
          <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-charcoal-500">
            Main
          </p>
          {navItems.filter(item => {
            const role = user?.role;
            if (!role || !ROLE_PERMISSIONS[role]) return false;
            return ROLE_PERMISSIONS[role].includes(item.path);
          }).map((item) => {
            const isActive = location.pathname === item.path ||
              (item.path !== ROUTES.DASHBOARD && location.pathname.startsWith(item.path));
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-charcoal-700 text-white'
                    : 'text-charcoal-400 hover:bg-charcoal-800 hover:text-charcoal-200'
                }`}
              >
                <Icon className="w-[18px] h-[18px]" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-charcoal-800">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-9 h-9 rounded-full bg-charcoal-600 flex items-center justify-center text-sm font-semibold text-white">
              {getInitials(user?.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-charcoal-500">{ROLE_LABELS[user?.role] || user?.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="mt-2 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-charcoal-400 hover:bg-charcoal-800 hover:text-red-400 transition-colors w-full"
          >
            <LogOut className="w-[18px] h-[18px]" />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
