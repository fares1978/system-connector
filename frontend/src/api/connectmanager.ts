import api from './axiosClient';
import type { Client, ClientInput, Provider, ProviderInput, Target, TargetInput } from '../types/connectmanager';

const root = '/connectmanager';
export const connectorApi = {
  providers: {
    list: async (skip = 0, limit = 50) => (await api.get<Provider[]>(`${root}/providers`, { params: { skip, limit } })).data,
    add: async (data: ProviderInput) => (await api.post<Provider>(`${root}/providers`, data)).data,
  },
  targets: {
    list: async (skip = 0, limit = 50) => (await api.get<Target[]>(`${root}/targets`, { params: { skip, limit } })).data,
    add: async (data: TargetInput) => (await api.post<Target>(`${root}/targets`, data)).data,
  },
  clients: {
    list: async (skip = 0, limit = 50) => (await api.get<Client[]>(`${root}/clients`, { params: { skip, limit } })).data,
    add: async (data: ClientInput) => (await api.post<Client>(`${root}/clients`, data)).data,
  },
};

// Client forms need the full set of IDs, not just the first page.
export async function loadOptions<T>(list: (skip: number, limit: number) => Promise<T[]>): Promise<T[]> {
  const items: T[] = [];
  let page: T[];
  do {
    page = await list(items.length, 100);
    items.push(...page);
  } while (page.length === 100);
  return items;
}
