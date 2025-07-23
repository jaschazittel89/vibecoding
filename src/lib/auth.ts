import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { kv } from '@vercel/kv'

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
}

// Load user from KV storage
const getUser = async (email: string): Promise<User | null> => {
  try {
    const userData = await kv.get(`user:${email}`)
    return userData as User | null
  } catch (error) {
    console.error('Error loading user:', error)
    return null
  }
}

// Save user to KV storage
const saveUser = async (user: User): Promise<void> => {
  try {
    await kv.set(`user:${user.email}`, user)
  } catch (error) {
    console.error('Error saving user:', error)
    throw new Error('Failed to save user')
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

        // Find user by email
        const user = await getUser(String(credentials.email))
        
        if (!user) {
          return null
        }

        // Verify password - ensure both are strings
        const password = String(credentials.password)
        const isPasswordValid = await bcrypt.compare(password, user.hashedPassword)
        
        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
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
  // Add secret configuration
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-development-only",
  // Add debug mode for development
  debug: process.env.NODE_ENV === "development",
})

// Helper function to create a new user
export async function createUser(email: string, password: string) {
  // Check if user already exists
  const existingUser = await getUser(email)
  if (existingUser) {
    throw new Error("User already exists")
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10)

  // Create new user
  const newUser: User = {
    id: Date.now().toString(),
    email,
    hashedPassword
  }

  await saveUser(newUser)
  return newUser
} 