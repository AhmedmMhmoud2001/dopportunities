const DEFAULT_BASE_URL = 'http://localhost:5000/api'

export function getApiBaseUrl() {
  const fromEnv = import.meta?.env?.VITE_API_BASE_URL
  return (fromEnv && String(fromEnv)) || DEFAULT_BASE_URL
}

/** Backend serves files at /uploads; Vite :5173 has no /uploads — rewrite to API origin. */
export function resolvePublicUploadUrl(url) {
  if (url == null || typeof url !== 'string') return url
  const u = url.trim()
  if (!u) return u
  const apiBase = getApiBaseUrl().replace(/\/api\/?$/i, '')
  try {
    if (u.startsWith('http://') || u.startsWith('https://')) {
      const parsed = new URL(u)
      const local = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1'
      if (local && parsed.pathname.startsWith('/uploads/')) {
        return `${apiBase}${parsed.pathname}${parsed.search}`
      }
      return u
    }
  } catch {
    return u
  }
  const path = u.startsWith('/') ? u : `/${u}`
  return `${apiBase}${path}`
}

/** Save /uploads/... or full URL; strip API origin for our uploads so DB stays portable. */
export function normalizeImageUrlForStorage(url) {
  if (url == null || typeof url !== 'string') return null
  const s = url.trim()
  if (!s) return null
  try {
    const u = new URL(s)
    if ((u.hostname === 'localhost' || u.hostname === '127.0.0.1') && u.pathname.startsWith('/uploads/')) {
      return u.pathname + u.search
    }
  } catch {
    /* relative or invalid */
  }
  const apiBase = getApiBaseUrl().replace(/\/api\/?$/i, '')
  if (apiBase && s.startsWith(apiBase)) {
    const rest = s.slice(apiBase.length)
    return rest.startsWith('/') ? rest : `/${rest}`
  }
  if (s.startsWith('/uploads/')) return s
  try {
    const u = new URL(s)
    const baseUrl = new URL(apiBase.includes('://') ? apiBase : `http://${apiBase}`)
    if (u.origin === baseUrl.origin && u.pathname.startsWith('/uploads/')) {
      return u.pathname + u.search
    }
  } catch {
    /* keep s */
  }
  return s
}

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

async function safeReadJson(res) {
  try {
    return await res.json()
  } catch {
    return null
  }
}

export async function apiRequest(path, { method = 'GET', token, body } = {}) {
  const url = `${getApiBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`

  const headers = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    /* يمنع 304 من التخزين المؤقت — لوحة التحتاج بيانات حديثة و res.ok يكون false عند 304 */
    cache: 'no-store',
  })

  if (res.status === 204) return null

  const data = await safeReadJson(res)
  if (!res.ok) {
    const message = data?.message || data?.error || `Request failed (${res.status})`
    throw new ApiError(message, res.status, data)
  }
  return data
}

