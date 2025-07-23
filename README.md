# VibeCoding - Ingredient to Recipe App

A modern, responsive web application that allows users to upload photos of their fridge and pantry to get recipe suggestions.

## Features

- **Sign Up/Login Pages**: Clean, modern authentication UI
- **Responsive Design**: Works on desktop and mobile devices
- **Dark Mode Support**: Automatic dark/light theme switching
- **Form Validation**: Client-side validation with error messages
- **Vercel Ready**: Optimized for deployment on Vercel

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
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

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Deployment

This project is optimized for deployment on Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically on every push

The app will be available at your Vercel URL with the following pages:
- `/` - Landing page
- `/signup` - Sign up form
- `/login` - Login form

## Project Structure

```
src/
├── app/
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   ├── signup/
│   │   └── page.tsx         # Sign up page
│   └── login/
│       └── page.tsx         # Login page
```

## Future Enhancements

Based on the specifications in `agents.md` and `specs.md`, future features will include:
- Photo upload functionality
- AI-powered ingredient detection
- Recipe generation
- User authentication backend
- Database integration

## License

This project is part of the VibeCoding application suite. 