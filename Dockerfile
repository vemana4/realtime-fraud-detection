FROM node:18-alpine AS base

# Install pnpm globally
RUN npm install -g pnpm

WORKDIR /app

# Copy monorepo configuration files
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json tsconfig.json tsconfig.base.json ./

# Copy package descriptors
COPY artifacts/api-server/package.json ./artifacts/api-server/
COPY artifacts/fraud-detection/package.json ./artifacts/fraud-detection/
COPY lib/api-client-react/package.json ./lib/api-client-react/
COPY lib/api-spec/package.json ./lib/api-spec/
COPY lib/api-zod/package.json ./lib/api-zod/
COPY lib/db/package.json ./lib/db/
COPY scripts/package.json ./scripts/

# Install all workspace dependencies (ignoring Darwin platform exclusions under linux docker environment)
RUN pnpm install --frozen-lockfile --ignore-scripts

# Copy source tree
COPY . .

# Build the project
RUN pnpm run build

# Expose server port
EXPOSE 3000

ENV NODE_ENV=production

# Run Express ingestion api server
CMD ["pnpm", "--filter", "@workspace/api-server", "start"]
