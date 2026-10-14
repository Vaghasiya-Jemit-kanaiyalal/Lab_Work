# Use official Node.js Alpine LTS image
FROM node:18-alpine

# Set working directory inside container
WORKDIR /app

# Copy package manifests
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy backend source code
COPY . .

# Expose backend port
EXPOSE 5000

# Start Express server
CMD ["npm", "start"]
