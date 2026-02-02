# Backend Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy root package files (backend is at root of src)
COPY src/package*.json ./
RUN npm install

# Copy source code
COPY src/ ./

EXPOSE 3001

CMD ["node", "backend/src/server.js"]
