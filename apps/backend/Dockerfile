FROM node:24-alpine

RUN npm install -g pnpm@10.34.5

WORKDIR /app

# Copy dependency metadata trước
COPY package.json ./
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY apps/backend/package.json ./apps/backend/package.json

# Install backend dependencies
RUN pnpm install --filter backend --frozen-lockfile

# Copy source
COPY apps/backend ./apps/backend

WORKDIR /app/apps/backend

# Prisma client
RUN pnpm exec prisma generate

EXPOSE 4000

CMD ["pnpm", "exec", "tsx", "src/index.ts"]