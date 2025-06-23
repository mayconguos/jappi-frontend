export function getApiBaseUrl(): string {
  const customEnv = process.env.CUSTOM_NODE_ENV ?? 'local';

  const baseURLs: Record<string, string> = {
    local: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4041',
    prod: process.env.NEXT_PUBLIC_API_URL || 'https://api.midominio.com',
  };

  return baseURLs[customEnv];
}