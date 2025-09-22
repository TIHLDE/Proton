# Proton

En moderne web-applikasjon bygget med Next.js, Prisma, og PostgreSQL.

## 🚀 Teknologier

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: tRPC, Better Auth
- **Database**: PostgreSQL (via Docker), Prisma ORM
- **Styling**: TailwindCSS v4
- **Pakkebehandler**: pnpm
- **Code Quality**: Biome (linting og formatering)

## 📋 Forutsetninger

Før du starter, sørg for at du har følgende installert:

- [Node.js](https://nodejs.org/) (versjon 18 eller nyere)
- [pnpm](https://pnpm.io/) pakkebehandler
- [Docker](https://www.docker.com/) for databasen
- [Make](https://www.gnu.org/software/make/) (eller bruk kommandoene direkte)

## 🛠️ Kom i gang

Følg disse stegene for å sette opp prosjektet lokalt:

### 1. Installer avhengigheter

```bash
pnpm install
```

### 2. Opprett database

Opprett en PostgreSQL database i Docker:

```bash
make db-create
```

### 3. Start database

Start database-kontaineren:

```bash
make db-start
```

### 4. Kjør migreringer

Anvend database-migreringer:

```bash
make migrate
```

### 5. Generer Prisma Client

Generer TypeScript-typer for databasen:

```bash
make generate
```

### 6. Start utviklingsserver

Start Next.js utviklingsserver:

```bash
pnpm dev
```

Applikasjonen vil nå være tilgjengelig på [http://localhost:3000](http://localhost:3000).

## 📊 Database-kommandoer

Prosjektet inkluderer flere nyttige database-kommandoer via Makefile:

- `make db-create` - Opprett ny PostgreSQL database i Docker
- `make db-start` - Start eksisterende database-kontainer
- `make db-stop` - Stopp database-kontainer
- `make db-remove` - Fjern database-kontainer (data går tapt)
- `make db-logs` - Vis database-logger
- `make db-connect` - Koble til database med psql
- `make db-status` - Vis status for database-kontainer
- `make migrate` - Kjør Prisma migreringer
- `make migrate-reset` - Tilbakestill database og anvend alle migreringer
- `make generate` - Generer Prisma Client
- `make studio` - Åpne Prisma Studio (database GUI)

## 🧹 Code Quality

Prosjektet bruker Biome for linting og formatering:

```bash
# Sjekk kode-kvalitet
pnpm check

# Fiks automatisk rettbare problemer
pnpm check:write

# Fiks med usikre endringer
pnpm check:unsafe
```

## 🏗️ Bygg og produksjon

```bash
# Bygg for produksjon
pnpm build

# Start produksjonsserver
pnpm start

# Forhåndsvis produksjonsbygg
pnpm preview
```

## 📁 Prosjektstruktur

```
src/
├── app/                 # Next.js App Router
├── components/          # React komponenter
│   ├── ui/             # UI komponenter (shadcn/ui)
│   └── form/           # Skjema-komponenter
├── lib/                # Hjelpefunksjoner og konfigurasjon
├── schemas/            # Zod-skjemaer for validering
├── server/             # Server-side kode og tRPC API
├── services/           # Business logic
└── trpc/               # tRPC konfigurasjon
```

## Env

Kopier `.env.example` til `.env` og fyll inn nødvendige miljøvariabler:

```bash
cp .env.example .env
```

```bash
DATABASE_URL="postgresql://postgres:password@localhost:5452/proton"
BETTER_AUTH_SECRET="your-secret-key"
BETTER_AUTH_URL="http://localhost:3000"
```

## 🗄️ Database

Prosjektet bruker PostgreSQL som database med Prisma som ORM. Database-skjemaet finnes i `prisma/schema.prisma`.

## 🔐 Autentisering

Applikasjonen bruker Better Auth for autentisering med støtte for:
- E-post/passord pålogging med TIHLDE bruker
- Lag-basert tilgangskontroll