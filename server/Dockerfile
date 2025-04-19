# Use an official Node.js runtime as a parent image (Choose LTS version)
# Check Node version compatibility with dependencies if needed
FROM node:20-alpine AS base

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (or yarn.lock or pnpm-lock.yaml)
COPY package*.json ./

# --- Dependencies ---
FROM base AS deps
# Install dependencies (use --frozen-lockfile for reproducible installs)
RUN npm ci --frozen-lockfile
# If you have native dependencies that need compiling, you might need build tools:
# RUN apk add --no-cache libc6-compat python3 make g++

# --- Build ---
FROM base AS builder
# Copy dependency node_modules
COPY --from=deps /usr/src/app/node_modules ./node_modules
# Copy the rest of the application code
COPY . .
# Build the TypeScript code
RUN npm run build
# Prune development dependencies
RUN npm prune --production

# --- Runner ---
FROM base AS runner
# Copy production node_modules and built code from the builder stage
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/package.json ./package.json
# Copy ABI json needed at runtime
COPY --from=builder /usr/src/app/src/config/VeltisIPNFT.abi.json ./dist/config/VeltisIPNFT.abi.json


# Expose the port the app runs on
EXPOSE 5001

# Define the command to run the application
# Node needs the .js extension here
CMD ["node", "dist/server.js"]
