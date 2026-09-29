import { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Settings,
  LogOut,
  Menu,
  ChevronRight,
  ChevronDown,
  Building2,
  Target,
  Users,
} from 'lucide-react';

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', to: '/dashboard', icon: <LayoutDashboard size={20} /> },
  { label: 'Settings',  to: '/settings',  icon: <Settings size={20} /> },
];

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const groups = [
    { label: 'Providers', key: 'providers', icon: <Building2 size={20} /> },
    { label: 'Targets', key: 'targets', icon: <Target size={20} /> },
    { label: 'Clients', key: 'clients', icon: <Users size={20} /> },
  ];
  useEffect(() => {
    const match = location.pathname.match(/^\/connectmanager\/(providers|targets|clients)\//);
    if (match) setOpenGroup(match[1]);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside
      className={`
        flex flex-col h-screen bg-gray-900 text-white transition-all duration-300 ease-in-out
        ${collapsed ? 'w-16' : 'w-64'}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-gray-700">
        {!collapsed && (
          <span className="text-xl font-bold tracking-tight text-indigo-400">
            Connector
          </span>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="p-1.5 rounded-lg hover:bg-gray-700 transition-colors ml-auto"
          aria-label="Toggle sidebar"
        >
          {collapsed ? <ChevronRight size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium
               ${isActive
                 ? 'bg-indigo-600 text-white'
                 : 'text-gray-300 hover:bg-gray-700 hover:text-white'
               }
               ${collapsed ? 'justify-center' : ''}
              `
            }
            title={collapsed ? item.label : undefined}
          >
            {item.icon}
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
        {groups.map((group) => {
          const expanded = openGroup === group.key;
          return (
            <div key={group.key}>
              <button type="button" aria-expanded={expanded} aria-label={group.label}
                onClick={() => { if (collapsed) setCollapsed(false); setOpenGroup(expanded ? null : group.key); }}
                className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white">
                {group.icon}
                {!collapsed && <><span className="flex-1 text-left">{group.label}</span><ChevronDown size={16} className={expanded ? 'rotate-180' : ''} /></>}
              </button>
              {expanded && !collapsed && (
                <div className="ml-8 space-y-1">
                  {(['add', 'all'] as const).map((view) => (
                    <NavLink key={view} to={`/connectmanager/${group.key}/${view}`}
                      className={({ isActive }) => `block rounded-lg px-3 py-2 text-sm ${isActive ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>
                      {view === 'add' ? 'Add' : 'All'}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="border-t border-gray-700 px-3 py-4 space-y-2">
        {!collapsed && user && (
          <div className="px-2 py-1">
            <p className="text-sm font-semibold text-white truncate">{user.name}</p>
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`
            flex items-center gap-3 w-full px-3 py-2.5 rounded-lg
            text-sm font-medium text-gray-300 hover:bg-red-600 hover:text-white transition-colors
            ${collapsed ? 'justify-center' : ''}
          `}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut size={20} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
