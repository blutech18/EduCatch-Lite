# EduCatch Lite

A simplified catch-up planner for students who miss classes due to competitions. Track missed lessons, generate study schedules, and monitor progress.

## Tech Stack

- **Frontend:** Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **Backend:** Convex (database + server functions)
- **State Management:** Zustand (with persistence)
- **Auth:** Email + password with bcrypt hashing

## Features

- **Authentication** — Register & login with email/password
- **Dashboard** — Progress overview with stat cards and recent lessons
- **Lessons** — Add, complete, and delete missed lessons
- **Catch-up Plan** — Auto-generated study timeline based on difficulty rules
- **Progress Tracking** — Real-time completion percentage

## Getting Started

### Prerequisites

- Node.js 18+
- A free [Convex](https://convex.dev) account

### 1. Install dependencies

```bash
cd educatch-lite
npm install
```

### 2. Set up Convex

```bash
npx convex dev
```

This will prompt you to log in and create a new Convex project. It will:
- Create/connect to your Convex deployment
- Generate types in `convex/_generated/`
- Push the schema to your database
- Set `NEXT_PUBLIC_CONVEX_URL` in `.env.local`

### 3. Run the development server

In a **separate terminal**:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Note:** Keep `npx convex dev` running in one terminal for hot-reloading backend changes, and `npm run dev` in another for the frontend.

## Project Structure

```
educatch-lite/
├── convex/                    # Convex backend
│   ├── _generated/            # Auto-generated types
│   ├── schema.ts              # Database schema (users, lessons)
│   ├── users.ts               # Auth mutations (register, login)
│   └── lessons.ts             # CRUD + stats + catch-up plan
├── src/
│   ├── app/                   # Next.js App Router pages
│   │   ├── page.tsx           # Landing page
│   │   ├── login/page.tsx     # Login
│   │   ├── register/page.tsx  # Registration
│   │   ├── dashboard/page.tsx # Dashboard with progress
│   │   ├── lessons/page.tsx   # Lesson management
│   │   └── plan/page.tsx      # Catch-up plan timeline
│   ├── components/
│   │   ├── forms/             # LessonForm
│   │   ├── layout/            # Navbar
│   │   ├── providers/         # ConvexClientProvider
│   │   └── ui/                # Button, Input, Select, StatCard, ProgressBar, etc.
│   └── store/
│       ├── authStore.ts       # Zustand auth state (persisted)
│       └── lessonStore.ts     # Zustand lesson loading state
├── .env.local                 # NEXT_PUBLIC_CONVEX_URL
└── package.json
```

## Catch-up Plan Logic

The plan generator uses rule-based duration allocation:

| Difficulty | Recommended Study Duration |
|------------|---------------------------|
| Easy       | 30 minutes                |
| Medium     | 60 minutes                |
| Hard       | 90 minutes                |

Lessons are ordered sequentially by lesson date (ascending).

## Database Schema

**users:** `name`, `email`, `password` (hashed), `createdAt`
**lessons:** `userId`, `title`, `subject`, `lessonDate`, `difficulty`, `estimatedMinutes`, `status`, `createdAt`
