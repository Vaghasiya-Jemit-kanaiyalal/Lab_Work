# Multi-stage Dockerfile for React (Vite)
# Stage 1: Build the React application
FROM node:18-alpine AS builder

WORKDIR /app

# Copy dependency specifications
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application source code
COPY . .

# Build production bundle (outputs to dist/)
RUN npm run build

# Stage 2: Serve built assets using Nginx
FROM nginx:alpine

# Copy built static files from build stage to Nginx html directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration to listen on port 5173 and proxy /api
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 5173
EXPOSE 5173

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
