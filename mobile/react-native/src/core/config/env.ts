type AppEnv = {
  apiUrl: string;
};

export function getEnv(source?: Record<string, string | undefined>): AppEnv {
  const resolvedSource = source ?? ((globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {});
  const apiUrl = resolvedSource.API_URL?.trim() || 'http://localhost:5001/api';
  return { apiUrl };
}
