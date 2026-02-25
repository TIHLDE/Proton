FROM node:24-alpine AS base
RUN apk add --no-cache openssl
WORKDIR /app

# pnpm via Corepack (unngår npm install -g pnpm)
RUN corepack enable

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/
RUN pnpm i --frozen-lockfile --prod --ignore-scripts

FROM base AS build
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/
RUN pnpm i --frozen-lockfile

COPY . .

# Build-time vars (NEXT_PUBLIC_* blir inlinet av Next.js under build)
ARG NEXT_PUBLIC_URL
ARG NEXT_PUBLIC_VAPID_PUBLIC_KEY

ENV TZ="Europe/Oslo"
ENV SKIP_ENV_VALIDATION=1
ENV NODE_ENV=production
ENV NEXT_PUBLIC_URL=https://sporty.tihlde.org/
ENV NEXT_PUBLIC_VAPID_PUBLIC_KEY=BA2uyd3XH6L0owvEMUYMjqEcadUuZCvnbHHzMVC1zW4nr-UXcBXRhZBPitVCZ-5eO-VQC24xOfWI2oBeozFyiRU

RUN pnpm build

FROM node:24-alpine AS runner
RUN apk add --no-cache openssl
WORKDIR /app

# Prod deps (smalere node_modules)
COPY --from=deps /app/node_modules ./node_modules

# Kopier Prisma CLI + engines fra build-stage (slipper global npm install)
COPY --from=build /app/node_modules/.bin/prisma ./node_modules/.bin/prisma
COPY --from=build /app/node_modules/prisma ./node_modules/prisma
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma

# Next standalone app
COPY --from=build /app/.next/standalone ./
RUN rm -f .env
COPY --from=build /app/.next/static ./.next/static/
COPY --from=build /app/prisma ./prisma/
COPY --from=build /app/public ./public/

EXPOSE 3000
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1

CMD ["node", "server.js"]

# Kjør migreringer før app starter (idempotent / pending only) - Dette legger vi til senere. 
# CMD ["sh", "-c", "./node_modules/.bin/prisma migrate deploy --schema=./prisma/schema.prisma && node server.js"]