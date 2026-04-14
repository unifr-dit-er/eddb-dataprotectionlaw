import { fetchNocoDB } from '@/lib/nocodb'
import { NextRequest, NextResponse } from 'next/server'

export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) => {
  const { path } = await params
  const nocdbPath = '/' + path.join('/')

  const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries())

  try {
    const data = await fetchNocoDB(nocdbPath, searchParams)
    return NextResponse.json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
