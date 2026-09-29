
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Welcome back, {user?.name} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Here's what's happening with your system today.
          </p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { label: 'Total Connections', value: '—', color: 'bg-indigo-50 text-indigo-600' },
            { label: 'Active Sessions',   value: '—', color: 'bg-green-50 text-green-600'  },
            { label: 'Pending Tasks',     value: '—', color: 'bg-amber-50 text-amber-600'  },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <p className={`mt-2 text-3xl font-bold ${stat.color.split(' ')[1]}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Placeholder content */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-base font-semibold text-gray-700 mb-3">Recent Activity</h2>
          <p className="text-sm text-gray-400 italic">No activity yet — more features coming soon.</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
