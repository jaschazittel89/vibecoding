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

// KV client with error handling
let kvClient: any = null

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

// Load user from KV storage
const getUser = async (email: string): Promise<User | null> => {
  try {
    const kv = await getKVClient()
    const userData = await kv.get(`user:${email}`)
    return userData as User | null
  } catch (error) {
    console.error('Error loading user:', error)
    if (error instanceof Error && error.message.includes("Database connection failed")) {
      throw error
    }
    return null
  }
}

// Save user to KV storage
const saveUser = async (user: User): Promise<void> => {
  try {
    const kv = await getKVClient()
    await kv.set(`user:${user.email}`, user)
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
  console.log('createUser called with email:', email)
  
  // Validate environment in production
  if (process.env.NODE_ENV === 'production') {
    console.log('Validating environment variables...')
    validateEnv()
    console.log('Environment validation passed')
  }

  // Sanitize and validate input
  const sanitizedEmail = sanitizeEmail(email)
  console.log('Sanitized email:', sanitizedEmail)
  
  if (!validatePassword(password)) {
    console.log('Password validation failed')
    throw new Error("Password must be at least 8 characters and contain uppercase, lowercase, and number")
  }
  console.log('Password validation passed')

  try {
    console.log('Checking if user already exists...')
    // Check if user already exists
    const existingUser = await getUser(sanitizedEmail)
    if (existingUser) {
      console.log('User already exists:', sanitizedEmail)
      throw new Error("User already exists")
    }
    console.log('User does not exist, proceeding with creation')

    console.log('Hashing password...')
    // Hash password with appropriate salt rounds
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)
    console.log('Password hashed successfully')

    // Create new user
    const newUser: User = {
      id: Date.now().toString(),
      email: sanitizedEmail,
      hashedPassword,
      createdAt: new Date().toISOString()
    }
    console.log('User object created:', { id: newUser.id, email: newUser.email })

    console.log('Saving user to database...')
    await saveUser(newUser)
    console.log('User saved successfully')
    
    return newUser
  } catch (error) {
    console.error('Create user error details:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    })
    throw error
  }
} 