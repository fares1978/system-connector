import type { ReactNode } from 'react';
import Sidebar from './Sidebar';

const DashboardLayout: React.FC<{ children: ReactNode }> = ({ children }) => (
  <div className="flex h-screen bg-gray-100 overflow-hidden">
    <Sidebar />
    <main className="flex-1 overflow-y-auto p-8">
      {children}
    </main>
  </div>
);

export default DashboardLayout;
