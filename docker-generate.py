import os

os.makedirs("web", exist_ok=True)
os.makedirs("server", exist_ok=True)

files = {
"./docker-compose.yaml": 
"""services:
  server:
    build: 
      context: ./server
      dockerfile: Dockerfile
    container_name: server
    restart: always
    ports:
      - "4000:4000"
    env_file:
      - ./server/.env

  web:
    build:
      context: ./web
      dockerfile: Dockerfile
    container_name: web
    restart: always
    ports:
      - "5173:5173"
    depends_on:
      - server""",

"web/Dockerfile": 
"""FROM node:20-alpine AS builder

RUN apk add --no-cache git
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/vite.config.js ./
RUN npm install 
EXPOSE 5173
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "5173"]""",

"server/Dockerfile": 
"""FROM node:22-trixie-slim

RUN apt-get update && apt-get install -y git cmake ninja-build build-essential && rm -rf /var/lib/apt/lists/*
RUN corepack enable
WORKDIR /app
COPY package*.json pnpm-lock.yaml* ./
RUN pnpm install
COPY . .
EXPOSE 4000
CMD ["pnpm", "run", "dev"]""",

"server/.env":
"""PORT=4000

SUPABASE_URL=https://hcbbnhlyzqlkmywhawwr.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<API_KEY> # Insert the Supabase API key.

# Where the FitSolver service lives (unused while the npm package is in play).
SOLVER_URL=http://localhost:5000
SOLVER_TIMEOUT_MS=15000

# Set true to use the built-in fake solver instead of calling FitSolver.
USE_MOCK_SOLVER=false

# Where the React app runs, for CORS.
WEB_ORIGIN=http://localhost:5173"""
}

for filepath, content in files.items():
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Generated: {filepath}")

print("\nDocker file generation complete.")
