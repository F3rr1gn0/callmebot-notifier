FROM node:26.5.1-alpine AS base
WORKDIR /app
RUN apk update && apk upgrade --no-cache libcrypto3 libssl3

FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci

FROM deps AS build
COPY . .
RUN npm run build

FROM base AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist
COPY .env.example ./

EXPOSE 3000
CMD ["node", "dist/server.js"]