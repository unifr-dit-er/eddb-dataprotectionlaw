const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

export const apiFetch = (path: string, init?: RequestInit) =>
  fetch(`${basePath}${path}`, init)
