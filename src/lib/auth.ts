import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

// Extend the User type
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
    }
  }
}

// User type definition
type User = {
  id: string
  email: string
  hashedPassword: string
  createdAt: string
  lastLogin?: string
}

// Security configuration
const SALT_ROUNDS = process.env.NODE_ENV === 'production' ? 12 : 10
const SESSION_MAX_AGE = 30 * 24 * 60 * 60 // 30 days

// Validate environment variables
const validateEnv = () => {
  if (!process.env.NEXTAUTH_SECRET || process.env.NEXTAUTH_SECRET === "fallback-secret-for-development-only") {
    throw new Error("NEXTAUTH_SECRET must be set in production")
  }
}

// Sanitize email input
const sanitizeEmail = (email: string): string => {
  return email.toLowerCase().trim()
}

// Validate password strength
const validatePassword = (password: string): boolean => {
  return password.length >= 8 && 
         /\d/.test(password) && 
         /[a-z]/.test(password) && 
         /[A-Z]/.test(password)
}

// Redis client with error handling
let redisClient: any = null
let kvClient: any = null

const getRedisClient = async () => {
  if (redisClient) return redisClient
  
  try {
    if (process.env.REDIS_URL) {
      const { createClient } = await import('redis')
      redisClient = createClient({
        url: process.env.REDIS_URL
      })
      
      await redisClient.connect()
      console.log('Connected to Redis Cache')
      return redisClient
    } else {
      throw new Error("Redis URL not configured")
    }
  } catch (error) {
    console.error('Redis connection error:', error)
    throw new Error("Database connection failed. Please check your Redis configuration.")
  }
}

const getKVClient = async () => {
  if (kvClient) return kvClient
  
  try {
    if (process.env.KV_REST_API_URL) {
      const { kv } = await import('@vercel/kv')
      kvClient = kv
      return kv
    } else {
      throw new Error("Vercel KV not configured")
    }
  } catch (error) {
    console.error('KV connection error:', error)
    throw new Error("Database connection failed. Please check your Vercel KV configuration.")
  }
}

// Get the appropriate database client
const getDBClient = async () => {
  // Try Redis first, then fallback to Vercel KV
  try {
    return await getRedisClient()
  } catch (error) {
    console.log('Redis not available, trying Vercel KV...')
    return await getKVClient()
  }
}

// Load user from database
const getUser = async (email: string): Promise<User | null> => {
  try {
    const client = await getDBClient()
    const key = `user:${email}`
    
    if (process.env.REDIS_URL) {
      // Redis client
      const userData = await client.get(key)
      return userData ? JSON.parse(userData) : null
    } else {
      // Vercel KV client
      const userData = await client.get(key)
      return userData as User | null
    }
  } catch (error) {
    console.error('Error loading user:', error)
    if (error instanceof Error && error.message.includes("Database connection failed")) {
      throw error
    }
    return null
  }
}

// Save user to database
const saveUser = async (user: User): Promise<void> => {
  try {
    const client = await getDBClient()
    const key = `user:${user.email}`
    
    if (process.env.REDIS_URL) {
      // Redis client
      await client.set(key, JSON.stringify(user))
    } else {
      // Vercel KV client
      await client.set(key, user)
    }
  } catch (error) {
    console.error('Error saving user:', error)
    if (error instanceof Error && error.message.includes("Database connection failed")) {
      throw error
    }
    throw new Error('Failed to save user')
  }
}

// Update user last login
const updateLastLogin = async (email: string): Promise<void> => {
  try {
    const user = await getUser(email)
    if (user) {
      user.lastLogin = new Date().toISOString()
      await saveUser(user)
    }
  } catch (error) {
    console.error('Error updating last login:', error)
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials: any) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Sanitize email
          const email = sanitizeEmail(credentials.email)
          
          // Find user by email
          const user = await getUser(email)
          
          if (!user) {
            // Use consistent timing to prevent timing attacks
            await bcrypt.compare("dummy", "$2a$10$dummy")
            return null
          }

          // Verify password
          const password = String(credentials.password)
          const isPasswordValid = await bcrypt.compare(password, user.hashedPassword)
          
          if (!isPasswordValid) {
            return null
          }

          // Update last login
          await updateLastLogin(email)

          return {
            id: user.id,
            email: user.email,
          }
        } catch (error) {
          console.error('Authorization error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: SESSION_MAX_AGE,
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.email = token.email as string
      }
      return session
    }
  },
  // Security configuration
  secret: process.env.NEXTAUTH_SECRET,
  // Add debug mode for development only
  debug: process.env.NODE_ENV === "development",
})

// Helper function to create a new user
export async function createUser(email: string, password: string) {
  // Validate environment in production
  if (process.env.NODE_ENV === 'production') {
    validateEnv()
  }

  // Sanitize and validate input
  const sanitizedEmail = sanitizeEmail(email)
  
  if (!validatePassword(password)) {
    throw new Error("Password must be at least 8 characters and contain uppercase, lowercase, and number")
  }

  try {
    // Check if user already exists
    const existingUser = await getUser(sanitizedEmail)
    if (existingUser) {
      throw new Error("User already exists")
    }

    // Hash password with appropriate salt rounds
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

    // Create new user
    const newUser: User = {
      id: Date.now().toString(),
      email: sanitizedEmail,
      hashedPassword,
      createdAt: new Date().toISOString()
    }

    await saveUser(newUser)
    return newUser
  } catch (error) {
    console.error('Create user error:', error)
    throw error
  }
} 