# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Install exact versions from the lockfile
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the Next.js application
RUN npm run build

# Drop dev dependencies so they don't ship in the runtime image
RUN npm prune --omit=dev

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
# BACKEND_URL (and optionally PROXY_SHARED_SECRET, TRUSTED_PROXY_HOPS) are read at runtime by proxy.ts.

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from build stage
COPY --from=build /app/public ./public
COPY --from=build /app/.next ./.next
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json

USER nextjs

EXPOSE 3000

CMD ["npm", "start"]
