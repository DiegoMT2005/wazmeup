import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { phoneNumberId, accessToken } = body

    if (!phoneNumberId || !accessToken) {
      return NextResponse.json(
        { error: 'Missing Phone Number ID or Access Token' },
        { status: 400 }
      )
    }

    // Simulate connection testing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // For demonstration, success if token is 'valid'
    if (accessToken === 'error') {
      return NextResponse.json(
        { error: 'Invalid Meta Access Token. Please check your credentials.' },
        { status: 401 }
      )
    }

    return NextResponse.json({ success: true, message: 'Connected successfully' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to test connection' },
      { status: 500 }
    )
  }
}
