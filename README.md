# VibeCoding

A modern authentication system built with Next.js, NextAuth.js, and Redis Cache.

## Features

- 🔐 **Secure Authentication**: Email/password authentication with bcrypt hashing
- 🚀 **Redis Cache**: Fast, persistent user data storage
- 🛡️ **Security First**: Rate limiting, input validation, and CORS protection
- 📱 **Modern UI**: Built with Tailwind CSS and Next.js App Router
- 🔄 **Fallback Support**: Redis Cache with Vercel KV fallback

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd vibecoding
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Required for authentication
   NEXTAUTH_SECRET=your-strong-secret-key
   NEXTAUTH_URL=http://localhost:3000
   
   # Database (choose one)
   REDIS_URL=your-redis-connection-string
   # OR Vercel KV variables
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Deployment

See [VERCEL_SETUP.md](./VERCEL_SETUP.md) for detailed deployment instructions.

## Security

See [SECURITY.md](./SECURITY.md) for security implementation details.

---

**Last updated**: December 2024 