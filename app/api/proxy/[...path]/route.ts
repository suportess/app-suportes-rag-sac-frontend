import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.API_URL || 'http://localhost:8080'

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params
  const target = `${BACKEND_URL}/${path.join('/')}${req.nextUrl.search}`

  const res = await fetch(target, { headers: forwardHeaders(req) })
  return pipe(res)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params
  const target = `${BACKEND_URL}/${path.join('/')}${req.nextUrl.search}`

  const contentType = req.headers.get('content-type') || ''
  const body = contentType.includes('multipart') ? await req.arrayBuffer() : await req.text()

  const headers: Record<string, string> = {}
  if (!contentType.includes('multipart')) {
    headers['Content-Type'] = contentType
  } else {
    headers['Content-Type'] = contentType
  }

  const res = await fetch(target, {
    method: 'POST',
    headers,
    body,
  })
  return pipe(res)
}

function forwardHeaders(req: NextRequest): Record<string, string> {
  const h: Record<string, string> = {}
  const accept = req.headers.get('accept')
  if (accept) h['Accept'] = accept
  return h
}

async function pipe(res: Response): Promise<NextResponse> {
  const contentType = res.headers.get('content-type') || 'application/json'
  const body = await res.arrayBuffer()
  return new NextResponse(body, {
    status: res.status,
    headers: { 'Content-Type': contentType },
  })
}
