# Build Stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build for production
RUN npm run build

# Production Stage
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV production

# We only need the public folder, the built .next folder, and node_modules (or standalone)
# For simplicity in this demo, we'll use a basic next start setup
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["npm", "start"]
