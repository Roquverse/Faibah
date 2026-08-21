FROM node:20-alpine AS builder

WORKDIR /app

# Install OpenSSL for Prisma to generate the correct query engine
RUN apk add --no-cache openssl

COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Build NestJS app
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

# Install OpenSSL for Prisma runtime
RUN apk add --no-cache openssl

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 3005

# Run migrations then start the app
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start:prod"]
