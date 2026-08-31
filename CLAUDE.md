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
- `src/components/ui/` - Designsystemet, kopiert ordrett fra Photon (se under)
- `src/lib/` - Configuration (auth, email, utilities)
- `prisma/schema.prisma` - Database schema

### Designsystem — kopiert fra Photon

`src/components/ui/*` er **ordrette kopier** av `packages/ui/src/components/ui/*`
i [TIHLDE/Photon](https://github.com/TIHLDE/Photon) (`@tihlde/ui`), og
`src/styles/globals.css` speiler `packages/ui/src/styles.css`. Poenget er at
Proton skal se ut som resten av TIHLDE-plattformen uten å vedlikeholde et eget
designsystem.

Komponentene er **dumme**: de eier utseende og tilgjengelighet, ingenting annet.
All tilstand, datahenting og forretningslogikk bor i kallstedet.

- Bygget på **Base UI**, ikke Radix. Det betyr `render={<Child />}` i stedet for
  `asChild`, `data-checked` i stedet for `data-[state=checked]`, og
  `Positioner`/`Popup` i stedet for `Portal`/`Content`.
- `<Select>` må få `items={[{ value, label }]}`. Base UIs `SelectValue` viser
  ellers den rå verdien, ikke etiketten til valget.
- `<DropdownMenuTrigger>` er en ekte `<button>`. Send noe annet inn via `render`
  bare med `nativeButton={false}`. `<DropdownMenuItem>` er motsatt — den er
  *ikke* en knapp, så en `<button>` i `render` gir advarsel; bruk `onClick`.

**Ikke rediger filene i `src/components/ui/` her.** Endringer hører hjemme i
Photon, og hentes hit med en ren `cp`. Katalogen er derfor holdt utenfor biome
(både formatering og linting) i `biome.jsonc`, slik at filene blir byte-like med
kilden og diffen viser reelle endringer i stedet for formateringsstøy:

```bash
cp ~/tihlde-repos/Photon/packages/ui/src/components/ui/<navn>.tsx src/components/ui/
# bytt så `#/`-aliaset til Protons `~/`, og legg på "use client" om komponenten
# bruker hooks eller Base UI
```

Unntakene — filer som er Protons egne og *skal* redigeres her:

- `form.tsx` — bro mot react-hook-form. Kvark bruker @tanstack/react-form og
  har sin egen bro mot de samme Field-primitivene.
- `typography.tsx` og `password-input.tsx` — finnes ikke i @tihlde/ui.
- `popover.tsx` — Photons versjon portalerer til `<body>`. Ligger popoveren
  inne i en modal dialog, havner den utenfor dialogen: den vises, men klikk i
  den lukker dialogen eller når ikke fram i det hele tatt. Derfor finner denne
  versjonen dialogen den står i og portalerer dit. Utenfor en dialog blir
  målet null, og Base UI faller tilbake til body — altså Photons oppførsel.

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
