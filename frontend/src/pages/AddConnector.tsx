import { useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { connectorApi, loadOptions } from '../api/connectmanager';
import { errorMessage } from '../api/errorMessage';
import { useAuth } from '../context/AuthContext';
import type { Client, ClientInput, ClientStatus, Provider, ProviderInput, Resource, Target, TargetInput } from '../types/connectmanager';

const inputClass = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none';
const fields = {
  providers: [
    ['name', 'Name'], ['base_link', 'Base URL'], ['body_data', 'Body data'], ['prompt_data', 'Prompt data'],
  ],
  targets: [
    ['name', 'Name'], ['api_link', 'API URL'], ['key', 'API key'], ['data', 'Data'], ['prompt_data', 'Prompt data'],
  ],
} as const;

export default function AddConnector({ resource }: { resource: Resource }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const owner = user!.id;
  const [values, setValues] = useState<Record<string, string>>({ status: 'pending' });
  const set = (name: string, value: string) => setValues((prev) => ({ ...prev, [name]: value }));
  const providerOptions = useQuery({
    queryKey: ['connectmanager', owner, 'providers', 'options'],
    queryFn: () => loadOptions(connectorApi.providers.list),
    enabled: resource === 'clients',
  });
  const targetOptions = useQuery({
    queryKey: ['connectmanager', owner, 'targets', 'options'],
    queryFn: () => loadOptions(connectorApi.targets.list),
    enabled: resource === 'clients',
  });
  const mutation = useMutation<Provider | Target | Client, Error, void>({
    mutationFn: async () => {
      if (resource === 'providers') {
        const payload: ProviderInput = { name: values.name, base_link: values.base_link || '', body_data: values.body_data || '', prompt_data: values.prompt_data || '' };
        return connectorApi.providers.add(payload);
      }
      if (resource === 'targets') {
        const payload: TargetInput = { name: values.name, key: values.key, api_link: values.api_link || '', data: values.data || '', prompt_data: values.prompt_data || '' };
        return connectorApi.targets.add(payload);
      }
      const payload: ClientInput = {
        name: values.name || null,
        provider_id: values.provider_id,
        target_id: values.target_id,
        status: values.status as ClientStatus,
      };
      return connectorApi.clients.add(payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['connectmanager', owner, resource] });
      navigate(`/connectmanager/${resource}/all`);
    },
  });
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    mutation.mutate();
  };
  const optionsLoading = resource === 'clients' && (providerOptions.isPending || targetOptions.isPending);
  return (
    <form onSubmit={submit} className="max-w-2xl space-y-5 rounded-xl bg-white p-6 shadow-sm">
      {resource !== 'clients' ? fields[resource].map(([name, label]) => (
        <label key={name} className="block space-y-1 text-sm font-medium text-gray-700">
          <span>{label}</span>
          {name === 'body_data' || name === 'prompt_data' || name === 'data' ?
            <textarea className={inputClass} value={values[name] ?? ''} onChange={(e) => set(name, e.target.value)} rows={4} /> :
            <input className={inputClass} type={name === 'key' ? 'password' : 'text'}
              autoComplete={name === 'key' ? 'off' : undefined}
              required={name === 'name' || name === 'key'} minLength={name === 'name' || name === 'key' ? 3 : undefined}
              value={values[name] ?? ''} onChange={(e) => set(name, e.target.value)} />}
        </label>
      )) : <>
        <label className="block space-y-1 text-sm font-medium text-gray-700">Name (optional)
          <input className={inputClass} value={values.name ?? ''} onChange={(e) => set('name', e.target.value)} />
        </label>
        {([['provider_id', 'Provider', providerOptions], ['target_id', 'Target', targetOptions]] as const).map(([field, label, query]) => (
          <label key={field} className="block space-y-1 text-sm font-medium text-gray-700">{label}
            <select required className={inputClass} value={values[field] ?? ''} onChange={(e) => set(field, e.target.value)} disabled={!query.data?.length}>
              <option value="">Select {label.toLowerCase()}</option>
              {query.data?.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.id})</option>)}
            </select>
          </label>
        ))}
        <label className="block space-y-1 text-sm font-medium text-gray-700">Status
          <select className={inputClass} value={values.status} onChange={(e) => set('status', e.target.value)}>
            <option value="pending">Pending</option><option value="active">Active</option><option value="inactive">Inactive</option>
          </select>
        </label>
        {!optionsLoading && !providerOptions.isError && !targetOptions.isError && (!providerOptions.data?.length || !targetOptions.data?.length) &&
          <p className="text-sm text-amber-700">Create a <Link className="underline" to="/connectmanager/providers/add">provider</Link> and a <Link className="underline" to="/connectmanager/targets/add">target</Link> before adding a client.</p>}
      </>}
      {optionsLoading && <p role="status" className="text-sm text-gray-500">Loading options…</p>}
      {(providerOptions.isError || targetOptions.isError) && <div role="alert" className="text-sm text-red-700">Failed to load options: {errorMessage(providerOptions.error ?? targetOptions.error)} <button type="button" className="underline" onClick={() => { void providerOptions.refetch(); void targetOptions.refetch(); }}>Retry</button></div>}
      {mutation.isError && <p role="alert" className="text-sm text-red-700">{errorMessage(mutation.error)}</p>}
      <button type="submit" disabled={mutation.isPending || (resource === 'clients' && (!providerOptions.data?.length || !targetOptions.data?.length))}
        className="rounded-lg bg-indigo-600 px-5 py-2 text-white hover:bg-indigo-700 disabled:opacity-50">
        {mutation.isPending ? 'Saving…' : 'Add'}
      </button>
    </form>
  );
}
