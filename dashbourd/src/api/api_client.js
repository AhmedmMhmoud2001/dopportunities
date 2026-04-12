import { config } from '../config'

function buildUrl(path, query) {
  const url = new URL(path, config.apiBaseUrl)
  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (v === undefined || v === null || v === '') return
      url.searchParams.set(k, String(v))
    })
  }
  return url.toString()
}

export class ApiError extends Error {
  constructor(message, { status, body } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

export function createApiClient({ getToken, onUnauthorized } = {}) {
  async function request(method, path, { body, query } = {}) {
    const headers = { 'Content-Type': 'application/json' }
    const token = getToken?.()
    if (token) headers.Authorization = `Bearer ${token}`

    const res = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })

    const isJson = (res.headers.get('content-type') || '').includes('application/json')
    const data = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null)

    if (res.status === 401) {
      onUnauthorized?.()
    }

    if (!res.ok) {
      const msg =
        (data && typeof data === 'object' && data.message) ||
        (data && typeof data === 'object' && data.error && data.message) ||
        res.statusText ||
        'Request failed'
      throw new ApiError(msg, { status: res.status, body: data })
    }

    return data
  }

  return {
    get: (path, opts) => request('GET', path, opts),
    post: (path, opts) => request('POST', path, opts),
    put: (path, opts) => request('PUT', path, opts),
    del: (path, opts) => request('DELETE', path, opts),
  }
}

