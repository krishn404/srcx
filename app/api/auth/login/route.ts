import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 })
    }

    const adminUsername = process.env.ADMIN_USERNAME
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminUsername || !adminPassword) {
      console.error("Admin credentials not configured in environment variables")
      return NextResponse.json({ 
        error: "Server configuration error: ADMIN_USERNAME and ADMIN_PASSWORD environment variables are not set. Please create a .env.local file with these variables." 
      }, { status: 500 })
    }

    if (username !== adminUsername || password !== adminPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Generate a simple token (in production, use a proper JWT or session)
    const token = `admin_token_${Date.now()}_${Math.random().toString(36).substring(7)}`

    const response = NextResponse.json({ success: true, token, username })
    
    // Set HTTP-only cookie for additional security
    response.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

