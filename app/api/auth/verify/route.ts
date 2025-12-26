import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("admin_token")?.value || request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    // In a production app, you'd verify the token properly
    // For now, we just check if it exists and starts with "admin_token_"
    if (token.startsWith("admin_token_")) {
      return NextResponse.json({ authenticated: true })
    }

    return NextResponse.json({ authenticated: false }, { status: 401 })
  } catch (error) {
    console.error("Auth verification error:", error)
    return NextResponse.json({ authenticated: false }, { status: 500 })
  }
}

