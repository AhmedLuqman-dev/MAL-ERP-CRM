import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { useState } from 'react';

export function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-warm-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 lg:p-6 w-full max-w-7xl mx-auto animate-fade-in">{children}</main>
        <footer className="py-4 border-t border-warm-200 text-center mt-auto">
          <p className="text-xs text-charcoal-400 font-medium">© 2026 MAL ERP/CRM. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
