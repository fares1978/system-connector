import { Navigate, useParams } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import AddConnector from './AddConnector';
import ListConnector from './ListConnector';
import type { Resource } from '../types/connectmanager';

const labels: Record<Resource, string> = { providers: 'Providers', targets: 'Targets', clients: 'Clients' };

export default function ConnectorPage() {
  const { resource, view } = useParams();
  if (!resource || !(resource in labels) || (view !== 'add' && view !== 'all')) {
    return <Navigate to="/dashboard" replace />;
  }
  const kind = resource as Resource;
  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">{view === 'add' ? 'Add' : 'All'} {labels[kind]}</h1>
        {view === 'add' ? <AddConnector key={kind} resource={kind} /> : <ListConnector key={kind} resource={kind} />}
      </div>
    </DashboardLayout>
  );
}
