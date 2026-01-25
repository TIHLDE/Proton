# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Proton is a sports team management web app for TIHLDE (Norwegian student organization). It manages teams, events, and attendance registrations.

## Development Commands

```bash
# Install dependencies
pnpm install

# Start development server (with Turbo)
pnpm dev

# Linting and formatting (Biome)
pnpm check            # Check for issues
pnpm check:write      # Auto-fix issues
pnpm typecheck        # TypeScript type checking

# Build
pnpm build
pnpm start

# Database (PostgreSQL via Docker)
make db-create        # Create database container
make db-start         # Start database
make db-stop          # Stop database
make migrate          # Run Prisma migrations
make generate         # Generate Prisma client
make studio           # Open Prisma Studio GUI
pnpm db:seed          # Seed with test data
```

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TailwindCSS v4, Shadcn/ui
- **Backend**: tRPC for type-safe API, Better Auth for authentication
- **Database**: PostgreSQL with Prisma ORM
- **Package manager**: pnpm

## Architecture

### Path Alias
Use `~/` to import from `src/` (e.g., `import { db } from "~/server/db"`)

### Directory Structure
- `src/app/` - Next.js App Router pages
- `src/server/api/` - tRPC routers and procedures
- `src/services/` - Business logic layer (called by tRPC procedures)
- `src/schemas/` - Zod validation schemas
- `src/components/ui/` - Shadcn/ui components
- `src/lib/` - Configuration (auth, email, utilities)
- `prisma/schema.prisma` - Database schema

### tRPC API Pattern
Routers are in `src/server/api/` with this structure:
- `root.ts` - Main router combining: team, me, event, user, registration
- Each router has its own directory with `router.ts` and controllers

Three procedure types:
- `publicProcedure` - No auth required
- `authorizedProcedure` - Requires logged-in user
- `adminProcedure` - Requires admin user

### Key Entities (Prisma)
- **User** - Has `isAdmin` flag for admin access
- **Team** - Sports teams with unique name/slug
- **TeamMember** - User-team relationship with role (ADMIN, SUBADMIN, USER)
- **TeamEvent** - Events (TRAINING, MATCH, SOCIAL, OTHER)
- **Registration** - User attendance (ATTENDING, NOT_ATTENDING)

### Route Groups
- `(main)/` - Authenticated user pages (calendar, team views)
- `admin/` - Admin-only pages (user and team management)

## Norwegian Language

The app uses Norwegian (no-NO) for UI text and date formatting.
