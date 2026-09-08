const BASE_URL = '/api/proxy'

type UploadOptions = {
  documentosComplementares?: File | File[]
  complementaryDocumentIds?: number[]
  projectCode?: string
}

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

  upload: <T>(path: string, efFile: File, payload?: File | File[] | UploadOptions) => {
    const form = new FormData()

    const normalized: UploadOptions =
      payload instanceof File || Array.isArray(payload)
        ? { documentosComplementares: payload as File | File[] }
        : (payload ?? {})

    const documentos = Array.isArray(normalized.documentosComplementares)
      ? normalized.documentosComplementares
      : normalized.documentosComplementares
        ? [normalized.documentosComplementares]
        : []

    form.append('EF', efFile)

    if (normalized.projectCode?.trim()) {
      form.append('projectCode', normalized.projectCode.trim())
    }

    normalized.complementaryDocumentIds?.forEach((id) => {
      form.append('complementaryDocumentIds', String(id))
    })

    documentos.forEach((documento) => {
      form.append('documentosComplementares', documento)
    })
    return request<T>(path, { method: 'POST', body: form })
  },
}
