import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { connectorApi, loadOptions } from '../api/connectmanager';
import { errorMessage } from '../api/errorMessage';
import { useAuth } from '../context/AuthContext';
import type { Client, Provider, Resource, Target } from '../types/connectmanager';

const PAGE_SIZE = 20;
const formatDate = (date: string) => new Date(date).toLocaleString();

export default function ListConnector({ resource }: { resource: Resource }) {
  const { user } = useAuth();
  const owner = user!.id;
  const [page, setPage] = useState(0);
  const query = useQuery<Array<Provider | Target | Client>>({
    queryKey: ['connectmanager', owner, resource, 'page', page],
    queryFn: async () => {
      const skip = page * PAGE_SIZE;
      if (resource === 'providers') return connectorApi.providers.list(skip, PAGE_SIZE);
      if (resource === 'targets') return connectorApi.targets.list(skip, PAGE_SIZE);
      return connectorApi.clients.list(skip, PAGE_SIZE);
    },
  });
  const providers = useQuery({
    queryKey: ['connectmanager', owner, 'providers', 'options'],
    queryFn: () => loadOptions(connectorApi.providers.list),
    enabled: resource === 'clients',
  });
  const targets = useQuery({
    queryKey: ['connectmanager', owner, 'targets', 'options'],
    queryFn: () => loadOptions(connectorApi.targets.list),
    enabled: resource === 'clients',
  });
  const list = query.data ?? [];
  const providerName = (id: string) => providers.data?.find((p) => p.id === id)?.name ?? id;
  const targetName = (id: string) => targets.data?.find((t) => t.id === id)?.name ?? id;

  return (
    <div className="space-y-4">
      <Link to={`/connectmanager/${resource}/add`} className="inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700">Add {resource.slice(0, -1)}</Link>
      {query.isPending && <p role="status">Loading…</p>}
      {query.isError && <p role="alert" className="text-red-700">{errorMessage(query.error)} <button className="underline" onClick={() => void query.refetch()}>Retry</button></p>}
      {resource === 'clients' && (providers.isError || targets.isError) && <p role="alert" className="text-amber-700">Names could not be loaded; showing IDs instead.</p>}
      {query.isSuccess && <>
        {list.length === 0 ? <p className="rounded-xl bg-white p-6 text-gray-600">{page ? 'No more records.' : `No ${resource} yet.`}</p> :
          <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600"><tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">{resource === 'providers' ? 'Base URL' : resource === 'targets' ? 'API URL' : 'Provider / Target'}</th>
                {resource === 'clients' && <th className="px-4 py-3">Status</th>}
                <th className="px-4 py-3">Created</th><th className="px-4 py-3">ID</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {list.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 font-medium">{item.name || '—'}</td>
                    <td className="px-4 py-3 break-all">{resource === 'providers' ? (item as Provider).base_link : resource === 'targets' ? (item as Target).api_link : <>{providerName((item as Client).provider_id)} / {targetName((item as Client).target_id)}</>}</td>
                    {resource === 'clients' && <td className="px-4 py-3">{(item as Client).status}</td>}
                    <td className="px-4 py-3 whitespace-nowrap">{formatDate(item.created_at)}</td>
                    <td className="px-4 py-3 text-gray-500">{item.id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>}
        <div className="flex items-center gap-4 text-sm">
          <button disabled={page === 0} className="rounded bg-white px-3 py-2 disabled:opacity-40" onClick={() => setPage(page - 1)}>Previous</button>
          <span>Page {page + 1}</span>
          <button disabled={list.length < PAGE_SIZE} className="rounded bg-white px-3 py-2 disabled:opacity-40" onClick={() => setPage(page + 1)}>Next</button>
        </div>
      </>}
    </div>
  );
}
