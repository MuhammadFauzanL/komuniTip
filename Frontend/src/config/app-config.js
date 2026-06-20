function trimTrailingSlash(value) {
  return value.endsWith('/') ? value.slice(0, -1) : value
}

function resolveApiBaseUrl() {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL

  if (configuredBaseUrl) {
    return trimTrailingSlash(configuredBaseUrl)
  }

  return '/api'
}

export const appConfig = {
  apiBaseUrl: resolveApiBaseUrl(),
}
