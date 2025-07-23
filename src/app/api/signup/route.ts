import { NextRequest, NextResponse } from "next/server"
import { createUser } from "../../../lib/auth"

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const MAX_REQUESTS_PER_WINDOW = 3 // 3 signup attempts per minute (more restrictive)
const MAX_EMAIL_LENGTH = 254
const MAX_PASSWORD_LENGTH = 128

// In-memory rate limiting for local development
const rateLimitStore = new Map<string, number[]>()

// Rate limiting function with fallback
const checkRateLimit = async (ip: string): Promise<boolean> => {
  const key = `rate_limit:signup:${ip}`
  const now = Date.now()
  
  try {
    // Try to use Vercel KV if available (production)
    if (process.env.KV_REST_API_URL) {
      console.log('Using Vercel KV for rate limiting')
      const { kv } = await import('@vercel/kv')
      const requests = await kv.get(key) as number[] || []
      const validRequests = requests.filter(time => now - time < RATE_LIMIT_WINDOW)
      
      if (validRequests.length >= MAX_REQUESTS_PER_WINDOW) {
        return false // Rate limited
      }
      
      validRequests.push(now)
      await kv.set(key, validRequests, { ex: 60 }) // Expire in 60 seconds
      
      return true
    } else {
      console.log('Using in-memory rate limiting (local development)')
      // Fallback to in-memory rate limiting for local development
      const requests = rateLimitStore.get(ip) || []
      const validRequests = requests.filter(time => now - time < RATE_LIMIT_WINDOW)
      
      if (validRequests.length >= MAX_REQUESTS_PER_WINDOW) {
        return false // Rate limited
      }
      
      validRequests.push(now)
      rateLimitStore.set(ip, validRequests)
      
      // Clean up old entries
      setTimeout(() => {
        const currentRequests = rateLimitStore.get(ip) || []
        const updatedRequests = currentRequests.filter(time => Date.now() - time < RATE_LIMIT_WINDOW)
        if (updatedRequests.length === 0) {
          rateLimitStore.delete(ip)
        } else {
          rateLimitStore.set(ip, updatedRequests)
        }
      }, RATE_LIMIT_WINDOW)
      
      return true
    }
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

// Validate request headers
const validateRequest = (request: NextRequest): boolean => {
  const contentType = request.headers.get('content-type')
  const userAgent = request.headers.get('user-agent')
  
  // Require proper content type
  if (!contentType || !contentType.includes('application/json')) {
    return false
  }
  
  // Require user agent (basic bot protection)
  if (!userAgent || userAgent.length < 10) {
    return false
  }
  
  return true
}

// Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  })
}

export async function POST(request: NextRequest) {
  console.log('Signup API called')
  
  // Add CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
  
  try {
    // Validate request headers
    if (!validateRequest(request)) {
      console.log('Invalid request headers')
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400, headers: corsHeaders }
      )
    }

    // Rate limiting check
    const clientIP = getClientIP(request)
    console.log('Client IP:', clientIP)
    
    const isAllowed = await checkRateLimit(clientIP)
    
    if (!isAllowed) {
      console.log('Rate limited for IP:', clientIP)
      return NextResponse.json(
        { error: "Too many signup attempts. Please try again later." },
        { status: 429, headers: corsHeaders }
      )
    }

    const body = await request.json()
    console.log('Request body received:', { email: body.email, passwordLength: body.password?.length })

    const { email, password } = body

    // Validate input
    if (!email || !password) {
      console.log('Missing email or password')
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400, headers: corsHeaders }
      )
    }

    // Validate input lengths
    if (typeof email !== 'string' || email.length > MAX_EMAIL_LENGTH) {
      console.log('Invalid email length')
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400, headers: corsHeaders }
      )
    }

    if (typeof password !== 'string' || password.length > MAX_PASSWORD_LENGTH) {
      console.log('Invalid password length')
      return NextResponse.json(
        { error: "Invalid password format" },
        { status: 400, headers: corsHeaders }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.log('Invalid email format:', email)
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400, headers: corsHeaders }
      )
    }

    // Validate password strength (enhanced)
    if (password.length < 8) {
      console.log('Password too short')
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400, headers: corsHeaders }
      )
    }
    
    if (!/\d/.test(password)) {
      console.log('Password missing number')
      return NextResponse.json(
        { error: "Password must contain at least one number" },
        { status: 400, headers: corsHeaders }
      )
    }
    
    if (!/[a-z]/.test(password)) {
      console.log('Password missing lowercase')
      return NextResponse.json(
        { error: "Password must contain at least one lowercase letter" },
        { status: 400, headers: corsHeaders }
      )
    }
    
    if (!/[A-Z]/.test(password)) {
      console.log('Password missing uppercase')
      return NextResponse.json(
        { error: "Password must contain at least one uppercase letter" },
        { status: 400, headers: corsHeaders }
      )
    }

    console.log('Validation passed, creating user...')

    // Create user
    const user = await createUser(email, password)

    console.log('User created successfully:', { id: user.id, email: user.email })

    return NextResponse.json(
      { 
        message: "User created successfully",
        user: {
          id: user.id,
          email: user.email
        }
      },
      { status: 201, headers: corsHeaders }
    )
  } catch (error) {
    console.error("Signup error details:", {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    })
    
    if (error instanceof Error && error.message === "User already exists") {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409, headers: corsHeaders }
      )
    }
    
    if (error instanceof Error && error.message.includes("Password must be")) {
      return NextResponse.json(
        { error: error.message },
        { status: 400, headers: corsHeaders }
      )
    }

    // Return more specific error information in development
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json(
        { 
          error: "Internal server error",
          details: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        },
        { status: 500, headers: corsHeaders }
      )
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders }
    )
  }
} 