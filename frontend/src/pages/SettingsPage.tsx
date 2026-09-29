import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';

const SettingsPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your account preferences.</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 space-y-4">
          <h2 className="text-base font-semibold text-gray-700">Profile</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Name</p>
              <p className="font-medium text-gray-800">{user?.name}</p>
            </div>
            <div>
              <p className="text-gray-400">Email</p>
              <p className="font-medium text-gray-800">{user?.email}</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 italic">Profile editing coming soon.</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
