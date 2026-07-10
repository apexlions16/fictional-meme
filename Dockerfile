# syntax=docker/dockerfile:1.7

FROM node:24-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY index.html vite.config.ts tsconfig*.json ./
COPY public ./public
COPY src ./src

RUN npm run build

FROM nginx:1.30-alpine AS runtime

ARG VERSION=dev
ARG REVISION=unknown
ARG SOURCE=https://github.com/unknown/fictional-meme

LABEL org.opencontainers.image.title="Fictional Meme Studio" \
      org.opencontainers.image.description="Tarayıcı tabanlı gelişmiş kurgu meme üretim stüdyosu" \
      org.opencontainers.image.version="${VERSION}" \
      org.opencontainers.image.revision="${REVISION}" \
      org.opencontainers.image.source="${SOURCE}" \
      org.opencontainers.image.licenses="MIT"

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
