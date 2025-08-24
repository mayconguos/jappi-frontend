export function getApiBaseUrl(): string {
  // Leer dinámicamente las variables de entorno para evitar valores cacheados
  const customEnv = process.env.CUSTOM_NODE_ENV || 'local';

  // Definir las URLs base según el entorno
  const baseURLs: Record<string, string> = {
    local: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4041',
    prod: process.env.NEXT_PUBLIC_API_URL || 'https://auyty5pd52.execute-api.us-east-1.amazonaws.com/dev',
  };

  // Retornar la URL correspondiente al entorno actual
  return baseURLs[customEnv] || baseURLs['local'];
}