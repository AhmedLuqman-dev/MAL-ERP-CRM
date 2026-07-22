import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { PageHeader } from '../components/PageHeader';
import { customerService } from '../services/customerService';
import { productService } from '../services/productService';
import { challanService } from '../services/challanService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { formatNumber, formatDateTime } from '../utils/format';
import { useAuth } from '../hooks/useAuth';
import { Users, Package, FileText, Boxes, TrendingUp, ArrowUpRight, Clock, UserCheck, Calendar } from 'lucide-react';

export function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const role = user?.role;
        const newStats = {};

        if (role === 'admin') {
          const [customers, products, challans, movements, lowStock] = await Promise.all([
            customerService.list({ pageSize: 1 }),
            productService.list({ pageSize: 1 }),
            challanService.list({ pageSize: 5 }),
            productService.getMovements({ pageSize: 5 }),
            productService.list({ pageSize: 1, lowStock: 'true' }),
          ]);
          newStats.totalCustomers = customers.data.meta?.total || 0;
          newStats.totalProducts = products.data.meta?.total || 0;
          newStats.totalChallans = challans.data.meta?.total || 0;
          newStats.lowStockCount = lowStock.data.meta?.total || lowStock.data.data?.length || 0;
          newStats.recentChallans = challans.data.data || [];
          newStats.recentMovements = movements.data.data || [];
        } else if (role === 'warehouse') {
          const [products, movements, lowStock] = await Promise.all([
            productService.list({ pageSize: 1 }),
            productService.getMovements({ pageSize: 5 }),
            productService.list({ pageSize: 1, lowStock: 'true' }),
          ]);
          newStats.totalProducts = products.data.meta?.total || 0;
          newStats.currentInventory = products.data.meta?.totalStock || products.data.meta?.total || 0;
          newStats.lowStockCount = lowStock.data.meta?.total || lowStock.data.data?.length || 0;
          newStats.recentMovements = movements.data.data || [];
        } else if (role === 'sales') {
          const [challans, draftChallans, confirmedChallans, customers] = await Promise.all([
            challanService.list({ pageSize: 5 }),
            challanService.list({ pageSize: 1, status: 'draft' }),
            challanService.list({ pageSize: 1, status: 'confirmed' }),
            customerService.list({ pageSize: 1 }),
          ]);
          newStats.totalChallans = challans.data.meta?.total || 0;
          newStats.draftChallans = draftChallans.data.meta?.total || 0;
          newStats.confirmedChallans = confirmedChallans.data.meta?.total || 0;
          newStats.recentChallans = challans.data.data || [];
          newStats.totalCustomers = customers.data.meta?.total || 0;
        } else if (role === 'accounts') {
          const [customers, activeCustomers, recentCustomers] = await Promise.all([
            customerService.list({ pageSize: 1 }),
            customerService.list({ pageSize: 1, status: 'active' }),
            customerService.list({ pageSize: 5 }),
          ]);
          newStats.totalCustomers = customers.data.meta?.total || 0;
          newStats.activeCustomers = activeCustomers.data.meta?.total || 0;
          newStats.recentCustomers = recentCustomers.data.data || [];
        }

        setStats(newStats);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    if (user?.role) fetchStats();
  }, [user]);

  if (loading) return <Layout><LoadingSpinner /></Layout>;
  if (error) return <Layout><div className="p-4 text-red-600">{error}</div></Layout>;

  const role = user?.role;
  
  let statCards = [];
  if (role === 'admin') {
    statCards = [
      { label: 'Total Customers', value: stats.totalCustomers, icon: Users, path: '/customers', color: 'text-charcoal-600', bg: 'bg-warm-100' },
      { label: 'Total Products', value: stats.totalProducts, icon: Package, path: '/products', color: 'text-emerald-600', bg: 'bg-emerald-50' },
      { label: 'Sales Challans', value: stats.totalChallans, icon: FileText, path: '/challans', color: 'text-charcoal-600', bg: 'bg-warm-100' },
      { label: 'Low Stock Alerts', value: stats.lowStockCount, icon: Boxes, path: '/inventory', color: 'text-amber-600', bg: 'bg-amber-50' },
    ];
  } else if (role === 'warehouse') {
    statCards = [
      { label: 'Total Products', value: stats.totalProducts, icon: Package, path: '/products', color: 'text-emerald-600', bg: 'bg-emerald-50' },
      { label: 'Current Inventory', value: stats.currentInventory, icon: Boxes, path: '/inventory', color: 'text-charcoal-600', bg: 'bg-warm-100' },
      { label: 'Low Stock Alerts', value: stats.lowStockCount, icon: Boxes, path: '/inventory', color: 'text-amber-600', bg: 'bg-amber-50' },
    ];
  } else if (role === 'sales') {
    statCards = [
      { label: 'Total Customers', value: stats.totalCustomers, icon: Users, path: null, color: 'text-charcoal-600', bg: 'bg-warm-100' },
      { label: 'Total Sales Challans', value: stats.totalChallans, icon: FileText, path: '/challans', color: 'text-charcoal-600', bg: 'bg-warm-100' },
      { label: 'Draft Challans', value: stats.draftChallans, icon: Clock, path: '/challans', color: 'text-amber-600', bg: 'bg-amber-50' },
      { label: 'Confirmed Challans', value: stats.confirmedChallans, icon: TrendingUp, path: '/challans', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    ];
  } else if (role === 'accounts') {
    statCards = [
      { label: 'Total Customers', value: stats.totalCustomers, icon: Users, path: '/customers', color: 'text-charcoal-600', bg: 'bg-warm-100' },
      { label: 'Active Customers', value: stats.activeCustomers, icon: UserCheck, path: '/customers', color: 'text-emerald-600', bg: 'bg-emerald-50' },
      { label: 'Upcoming Follow-ups', value: stats.recentCustomers?.filter(c => c.follow_up_date)?.length || 0, icon: Calendar, path: '/customers', color: 'text-amber-600', bg: 'bg-amber-50' },
    ];
  }

  return (
    <Layout>
      <PageHeader title={`${role ? role.charAt(0).toUpperCase() + role.slice(1) : ''} Dashboard`} description="Overview of your ERP operations" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          const content = (
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-charcoal-500">{stat.label}</p>
                <p className="mt-2 text-3xl font-semibold text-charcoal-900 tracking-tight">{formatNumber(stat.value)}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
          );

          if (stat.path) {
            return (
              <Link key={stat.label} to={stat.path} className="card p-5 hover:shadow-elevated transition-shadow group">
                {content}
              </Link>
            );
          }

          return (
            <div key={stat.label} className="card p-5 group">
              {content}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {(role === 'admin' || role === 'sales') && (
          <div className="card">
            <div className="flex items-center justify-between px-5 py-4 border-b border-warm-200">
              <h3 className="text-base font-semibold text-charcoal-800">Recent Challans</h3>
              <Link to="/challans" className="text-sm text-charcoal-500 hover:text-charcoal-800 flex items-center gap-1">
                View all <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="divide-y divide-warm-200">
              {!stats.recentChallans || stats.recentChallans.length === 0 ? (
                <p className="px-5 py-8 text-sm text-charcoal-400 text-center">No challans yet</p>
              ) : (
                stats.recentChallans.map((challan) => (
                  <Link key={challan.id} to={`/challans/${challan.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-warm-50 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-charcoal-800">{challan.challan_number}</p>
                      <p className="text-xs text-charcoal-500">{challan.customers?.name || '—'}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-charcoal-500">{challan.total_quantity} units</span>
                      <StatusBadgeLite status={challan.status} />
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        )}

        {(role === 'admin' || role === 'warehouse') && (
          <div className="card">
            <div className="flex items-center justify-between px-5 py-4 border-b border-warm-200">
              <h3 className="text-base font-semibold text-charcoal-800">Recent Stock Movements</h3>
              <Link to="/inventory" className="text-sm text-charcoal-500 hover:text-charcoal-800 flex items-center gap-1">
                View all <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="divide-y divide-warm-200">
              {!stats.recentMovements || stats.recentMovements.length === 0 ? (
                <p className="px-5 py-8 text-sm text-charcoal-400 text-center">No movements yet</p>
              ) : (
                stats.recentMovements.map((movement) => (
                  <div key={movement.id} className="flex items-center justify-between px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${movement.movement_type === 'IN' ? 'bg-emerald-50' : 'bg-warm-100'}`}>
                        {movement.movement_type === 'IN' ? <TrendingUp className="w-4 h-4 text-emerald-600" /> : <Clock className="w-4 h-4 text-charcoal-500" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-charcoal-800">
                          {movement.products?.name || '—'} 
                          <span className="text-charcoal-500 font-normal ml-1">
                            ({movement.reason === 'Initial stock' ? 'Added' : 'Updated'})
                          </span>
                        </p>
                        <p className="text-xs text-charcoal-500">{formatDateTime(movement.created_at)}</p>
                      </div>
                    </div>
                    <span className={`text-sm font-medium ${movement.movement_type === 'IN' ? 'text-emerald-600' : 'text-charcoal-600'}`}>
                      {movement.movement_type === 'IN' ? '+' : '-'}{movement.quantity_changed}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {role === 'accounts' && (
          <div className="card">
            <div className="flex items-center justify-between px-5 py-4 border-b border-warm-200">
              <h3 className="text-base font-semibold text-charcoal-800">Recent Customer Activity</h3>
              <Link to="/customers" className="text-sm text-charcoal-500 hover:text-charcoal-800 flex items-center gap-1">
                View all <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="divide-y divide-warm-200">
              {!stats.recentCustomers || stats.recentCustomers.length === 0 ? (
                <p className="px-5 py-8 text-sm text-charcoal-400 text-center">No customers yet</p>
              ) : (
                stats.recentCustomers.map((customer) => (
                  <Link key={customer.id} to={`/customers/${customer.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-warm-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-warm-100 flex items-center justify-center">
                        <Users className="w-4 h-4 text-charcoal-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-charcoal-800">{customer.name}</p>
                        <p className="text-xs text-charcoal-500">{customer.customer_type}</p>
                      </div>
                    </div>
                    <StatusBadgeLite status={customer.status} />
                  </Link>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

function StatusBadgeLite({ status }) {
  const config = {
    draft: 'badge-draft',
    confirmed: 'badge-confirmed',
    cancelled: 'badge-cancelled',
    active: 'badge-active',
    inactive: 'badge-inactive',
    lead: 'badge-lead'
  };
  return <span className={config[status] || 'badge bg-warm-100 text-warm-600 border border-warm-200'}>{status}</span>;
}
