/**
 * NocoDB API client.
 * À utiliser UNIQUEMENT dans les route handlers (src/app/api/).
 * Ne jamais importer ce fichier dans des composants ou des hooks.
 */
export const fetchNocoDB = async (
  path: string,
  params?: Record<string, string>
): Promise<unknown> => {
  const baseUrl = process.env.NEXT_PUBLIC_NOCODB_API_URL
  const token = process.env.NOCODB_API_TOKEN

  const url = new URL(`${baseUrl?.replace(/\/$/, '')}${path}`)
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value)
    })
  }

  const response = await fetch(url.toString(), {
    headers: {
      'xc-token': token ?? '',
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new Error(`NocoDB error: ${response.status} — ${body}`)
  }

  return response.json()
}
