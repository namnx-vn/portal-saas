# ==============================
# Stage 1: Build frontend
# ==============================
FROM node:24-alpine AS build

RUN npm install -g pnpm@10.34.5

WORKDIR /app
    
# Workspace metadata / lockfile
COPY package.json ./
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./

# Frontend package metadata
COPY apps/frontend/package.json ./apps/frontend/package.json

# Install dependency theo lockfile
RUN pnpm install --filter frontend --frozen-lockfile

# Copy frontend source
COPY apps/frontend ./apps/frontend

# Build Vite SPA
RUN pnpm --filter frontend build


# ==============================
# Stage 2: Runtime
# ==============================
FROM nginx:alpine AS runtime

ARG GIT_COMMIT

LABEL org.opencontainers.image.revision="${GIT_COMMIT}"
LABEL org.opencontainers.image.source="https://github.com/namnx-vn/portal-saas"

COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build \
    /app/apps/frontend/dist \
    /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]