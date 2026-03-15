import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { phone_number_id, access_token } = await request.json()

    if (!phone_number_id || !access_token) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 })
    }

    const response = await fetch(
      `https://graph.facebook.com/v19.0/${phone_number_id}?fields=display_phone_number,verified_name,quality_rating&access_token=${access_token}`
    )

    const data = await response.json()

    if (data.error) {
      return NextResponse.json(
        { valid: false, error: data.error.message, code: data.error.code },
        { status: 400 }
      )
    }

    return NextResponse.json({
      valid: true,
      phone: data.display_phone_number,
      name: data.verified_name,
      quality: data.quality_rating
    })
  } catch (error: any) {
    console.error('Validation error:', error)
    return NextResponse.json(
      { valid: false, error: error.message || 'Validation failed' },
      { status: 500 }
    )
  }
}
