export function getApiBaseUrl(): string {
  const customEnv = process.env.CUSTOM_NODE_ENV ?? 'local';

  const baseURLs: Record<string, string> = {
    local: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4041',
    // local: process.env.NEXT_PUBLIC_API_URL || 'https://auyty5pd52.execute-api.us-east-1.amazonaws.com/dev',
    prod: process.env.NEXT_PUBLIC_API_URL || 'https://auyty5pd52.execute-api.us-east-1.amazonaws.com/dev',
  };

  return baseURLs[customEnv];
}