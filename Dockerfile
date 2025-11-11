# Use Node.js
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# 1️⃣ Generate Prisma client
RUN npx prisma generate

# 2️⃣ Build NestJS app
RUN npm run build

# Start command (Render will run this)
CMD ["npm", "run", "start:prod"]
