import { NextRequest, NextResponse } from "next/server"
import { createUser } from "../../../lib/auth"
import { kv } from '@vercel/kv'

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5 // 5 signup attempts per minute

// Rate limiting function
const checkRateLimit = async (ip: string): Promise<boolean> => {
  const key = `rate_limit:signup:${ip}`
  const now = Date.now()
  
  try {
    const requests = await kv.get(key) as number[] || []
    const validRequests = requests.filter(time => now - time < RATE_LIMIT_WINDOW)
    
    if (validRequests.length >= MAX_REQUESTS_PER_WINDOW) {
      return false // Rate limited
    }
    
    validRequests.push(now)
    await kv.set(key, validRequests, { ex: 60 }) // Expire in 60 seconds
    
    return true
  } catch (error) {
    console.error('Rate limiting error:', error)
    return true // Allow request if rate limiting fails
  }
}

// Get client IP
const getClientIP = (request: NextRequest): string => {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  
  return forwarded?.split(',')[0] || 
         realIP || 
         cfConnectingIP || 
         'unknown'
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting check
    const clientIP = getClientIP(request)
    const isAllowed = await checkRateLimit(clientIP)
    
    if (!isAllowed) {
      return NextResponse.json(
        { error: "Too many signup attempts. Please try again later." },
        { status: 429 }
      )
    }

    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      )
    }

    // Validate password strength (enhanced)
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      )
    }
    
    if (!/\d/.test(password)) {
      return NextResponse.json(
        { error: "Password must contain at least one number" },
        { status: 400 }
      )
    }
    
    if (!/[a-z]/.test(password)) {
      return NextResponse.json(
        { error: "Password must contain at least one lowercase letter" },
        { status: 400 }
      )
    }
    
    if (!/[A-Z]/.test(password)) {
      return NextResponse.json(
        { error: "Password must contain at least one uppercase letter" },
        { status: 400 }
      )
    }

    // Create user
    const user = await createUser(email, password)

    return NextResponse.json(
      { 
        message: "User created successfully",
        user: {
          id: user.id,
          email: user.email
        }
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof Error && error.message === "User already exists") {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      )
    }
    
    if (error instanceof Error && error.message.includes("Password must be")) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    console.error("Signup error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 