import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

// Extend the User type to include username
declare module "next-auth" {
  interface User {
    username?: string
  }
  interface Session {
    user: {
      id: string
      username: string
      email: string
    }
  }
}

// Simple in-memory storage for demo purposes
// In production, you'd use a database like Vercel Postgres
const users: Array<{
  id: string
  username: string
  email: string
  hashedPassword: string
}> = []

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Find user by email
        const user = users.find(user => user.email === credentials.email)
        
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
          username: user.username,
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
        token.username = user.username
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.username = token.username as string
      }
      return session
    }
  }
})

// Helper function to create a new user
export async function createUser(username: string, email: string, password: string) {
  // Check if user already exists
  const existingUser = users.find(user => user.email === email)
  if (existingUser) {
    throw new Error("User already exists")
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10)

  // Create new user
  const newUser = {
    id: Date.now().toString(),
    username,
    email,
    hashedPassword
  }

  users.push(newUser)
  return newUser
} 