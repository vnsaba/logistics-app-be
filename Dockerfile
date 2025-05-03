# Base stage
FROM node:22-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install

# Testing stage
FROM base AS test
COPY . .
RUN npm run build && npx prisma generate
RUN npm test

# Production stage
FROM base AS prod
COPY . .
RUN npm run build && npx prisma generate

EXPOSE 3000
CMD ["npm", "start"]
