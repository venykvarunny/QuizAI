/**
 * Base URL for the Express auth API. Prefer EXPO_PUBLIC_API_URL in Expo (.env).
 * Also supports common web bundler env names for shared config across repos.
 */
export function getApiBaseUrl(): string {
  const fromEnv =
    process.env.EXPO_PUBLIC_API_URL ??
    process.env.VITE_API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    process.env.REACT_APP_API_URL;

  const trimmed = fromEnv?.trim();
  if (trimmed) {
    return trimmed.replace(/\/$/, '');
  }

  return 'http://localhost:3000';
}
