const BASE_URL = '/api/proxy'

async function request<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...opts,
    headers: { ...opts?.headers },
  })

  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.message || `Erro ${res.status}`)
  }

  return res.json()
}

export const api = {
  get: <T>(path: string) => request<T>(path),

  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'POST',
      headers:
        body instanceof FormData ? {} : { 'Content-Type': 'application/json' },
      body:
        body instanceof FormData
          ? body
          : body
            ? JSON.stringify(body)
            : undefined,
    }),

  upload: <T>(path: string, file: File, documentosComplementares?: File | File[]) => {
    const form = new FormData()
    const documentos = Array.isArray(documentosComplementares)
      ? documentosComplementares
      : documentosComplementares
        ? [documentosComplementares]
        : []

    form.append('EF', file)
    documentos.forEach((documento) => {
      form.append('documentosComplementares', documento)
    })
    return request<T>(path, { method: 'POST', body: form })
  },
}
