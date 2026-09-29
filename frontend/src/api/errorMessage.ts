import axios from 'axios';

export function errorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const detail: unknown = error.response?.data?.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) return detail.map((item: { msg?: string; loc?: string[] }) => `${item.loc?.join('.') ?? 'Field'}: ${item.msg ?? 'Invalid'}`).join('; ');
    return error.response ? `Request failed (${error.response.status})` : 'Cannot reach the API. Check your connection.';
  }
  return error instanceof Error ? error.message : 'Something went wrong.';
}
