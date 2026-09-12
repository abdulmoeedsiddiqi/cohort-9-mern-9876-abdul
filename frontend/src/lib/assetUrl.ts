const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export function resolveAssetUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//.test(path)) return path;
  return `${API_BASE_URL}${path}`;
}
