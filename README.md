# VibeCoding - Ingredient to Recipe App

A modern, responsive web application that allows users to upload photos of their fridge and pantry to get recipe suggestions.

## Features

- **Sign Up/Login Pages**: Clean, modern authentication UI
- **Responsive Design**: Works on desktop and mobile devices
- **Dark Mode Support**: Automatic dark/light theme switching
- **Form Validation**: Client-side validation with error messages
- **Persistent Authentication**: User data stored in Vercel KV (Redis)
- **Vercel Ready**: Optimized for deployment on Vercel

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth v5
- **Storage**: Vercel KV (Redis)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. **Set up environment variables** (Required for authentication):
   
   Create a `.env.local` file in the root directory:
   ```bash
   # NextAuth Configuration
   NEXTAUTH_SECRET=your-secret-key-here-change-in-production
   NEXTAUTH_URL=http://localhost:3000
   
   # Vercel KV Configuration (for production)
   KV_URL=your-kv-url
   KV_REST_API_URL=your-kv-rest-api-url
   KV_REST_API_TOKEN=your-kv-rest-api-token
   KV_REST_API_READ_ONLY_TOKEN=your-kv-read-only-token
   ```
   
   **Generate a secure secret key:**
   ```bash
   # Option 1: Using OpenSSL
   openssl rand -base64 32
   
   # Option 2: Using Node.js
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run test` - Run tests
- `npm run test:ci` - Run tests in CI mode

## Deployment

This project is optimized for deployment on Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. **Set up Vercel KV (Redis):**
   - In your Vercel dashboard, go to **Storage** → **KV**
   - Create a new KV database
   - Copy the connection details
4. **Configure environment variables in Vercel:**
   - Go to your Vercel project dashboard
   - Navigate to Settings > Environment Variables
   - Add these variables:
     - `NEXTAUTH_SECRET`: Your production secret key
     - `NEXTAUTH_URL`: Your production URL (e.g., `https://your-domain.vercel.app`)
     - `KV_URL`: Your KV database URL
     - `KV_REST_API_URL`: Your KV REST API URL
     - `KV_REST_API_TOKEN`: Your KV REST API token
     - `KV_REST_API_READ_ONLY_TOKEN`: Your KV read-only token
5. Deploy automatically on every push

The app will be available at your Vercel URL with the following pages:
- `/` - Landing page
- `/signup` - Sign up form
- `/login` - Login form
- `/home` - Recipe generator and past recipes

## Project Structure

```
src/
├── app/
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   ├── signup/
│   │   └── page.tsx         # Sign up page
│   ├── login/
│   │   └── page.tsx         # Login page
│   ├── home/
│   │   └── page.tsx         # Home screen for users
│   └── api/
│       ├── auth/[...nextauth]/route.ts  # NextAuth endpoints
│       └── signup/route.ts              # Signup API
├── components/
│   ├── Providers.tsx        # NextAuth provider
│   └── RecipeList.tsx       # Recipe display component
└── lib/
    └── auth.ts              # Auth configuration with Vercel KV
```

## Troubleshooting

### "There is a problem with the server configuration" Error

This error occurs when NextAuth environment variables are not properly configured:

1. **For local development**: Ensure `.env.local` file exists with `NEXTAUTH_SECRET` and `NEXTAUTH_URL`
2. **For Vercel deployment**: Add environment variables in Vercel dashboard
3. **Generate a new secret**: Use the commands above to generate a secure secret key

### User Login Not Working

If users can sign up but can't log in:

1. **Check Vercel KV setup**: Ensure KV environment variables are configured
2. **Verify KV connection**: Check that the KV database is accessible
3. **Check logs**: Look for KV connection errors in Vercel function logs

## Future Enhancements

Based on the specifications in `agents.md` and `specs.md`, future features will include:
- Photo upload functionality
- AI-powered ingredient detection
- Recipe generation
- User authentication backend
- Database integration

## License

This project is part of the VibeCoding application suite. 