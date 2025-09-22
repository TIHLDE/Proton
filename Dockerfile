FROM node:current-alpine AS deps
RUN apk add openssl
WORKDIR /app
RUN npm install -g pnpm

# Copy dependency files and Prisma schema for production dependencies
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/
RUN pnpm i --frozen-lockfile --prod --ignore-scripts

FROM node:current-alpine AS build
RUN apk add openssl
WORKDIR /app
RUN npm install -g pnpm

# Copy dependency files and Prisma schema
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/
RUN pnpm i --frozen-lockfile

# Copy source code
COPY . .

ENV TZ="Europe/Oslo"
ENV SKIP_ENV_VALIDATION=1

RUN pnpm build

FROM node:current-alpine AS runner

WORKDIR /app

RUN apk add openssl
# Prisma is used in prod deployment
RUN npm install -g prisma

# Copy production dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/.next/standalone ./
RUN rm -f .env
COPY --from=build /app/.next/static ./.next/static/
COPY --from=build /app/prisma ./prisma/
COPY --from=build /app/public ./public/

EXPOSE 3000
ENV PORT=3000

ENV NEXT_TELEMETRY_DISABLED=1

CMD [ "node", "server.js" ]