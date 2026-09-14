import type { DocumentUploadResponse } from './types'

const BASE_URL = '/api/proxy'

type UploadOptions = {
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

  upload: <T>(path: string, efFile: File, options?: UploadOptions) => {
    const form = new FormData()
    form.append('EF', efFile)

    if (options?.projectCode?.trim()) {
      form.append('projectCode', options.projectCode.trim())
    }

    options?.complementaryDocumentIds?.forEach((id) => {
      form.append('complementaryDocumentIds', String(id))
    })

    return request<T>(path, { method: 'POST', body: form })
  },

  uploadComplementary: (file: File, projectCode?: string) => {
    const form = new FormData()
    form.append('file', file)
    if (projectCode?.trim()) {
      form.append('projectCode', projectCode.trim())
    }
    return request<DocumentUploadResponse>('/api/v1/documents/complementary-documents', {
      method: 'POST',
      body: form,
    })
  },
}
