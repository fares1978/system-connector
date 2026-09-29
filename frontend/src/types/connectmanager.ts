export type Resource = 'providers' | 'targets' | 'clients';
export type ClientStatus = 'active' | 'inactive' | 'pending';

interface RecordBase {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface Provider extends RecordBase {
  name: string;
  body_data: string;
  base_link: string;
  prompt_data: string;
}
export interface Target extends RecordBase {
  name: string;
  api_link: string;
  data: string;
  prompt_data: string;
  // The API intentionally never returns `key`.
}
export interface Client extends RecordBase {
  name: string | null;
  provider_id: string;
  target_id: string;
  status: ClientStatus;
}

export type ProviderInput = Pick<Provider, 'name' | 'body_data' | 'base_link' | 'prompt_data'>;
export type TargetInput = Pick<Target, 'name' | 'api_link' | 'data' | 'prompt_data'> & { key: string };
export type ClientInput = Pick<Client, 'provider_id' | 'target_id' | 'status'> & { name?: string | null };
