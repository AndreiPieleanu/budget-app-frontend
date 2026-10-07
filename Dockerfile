# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Build-time argument for the API URL.
# This MUST be passed during build (e.g., --build-arg NEXT_PUBLIC_API_URL=...)
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build the Next.js application
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV production

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
