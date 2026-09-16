# ==============================
# Stage 1: Build frontend
# ==============================
FROM node:24-alpine@sha256:50c8e8ca1d27439048670df5883f32d57cf81cff6233222c893fd0d9884cbd81 AS build

RUN npm install -g pnpm@10.34.5

WORKDIR /app

COPY package.json ./
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./

COPY apps/frontend/package.json ./apps/frontend/package.json

RUN pnpm install --filter frontend --frozen-lockfile

COPY apps/frontend ./apps/frontend

RUN pnpm --filter frontend build


# ==============================
# Stage 2: Runtime
# ==============================
FROM nginx:alpine@sha256:17ad11d84df6c69e327c0894125f712ec1f1de627b5e5ed7e12ca2ed8cd5daf8 AS runtime

ARG GIT_COMMIT

LABEL org.opencontainers.image.revision="${GIT_COMMIT}"
LABEL org.opencontainers.image.source="https://github.com/namnx-vn/portal-saas"

COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build \
    /app/apps/frontend/dist \
    /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]