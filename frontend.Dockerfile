# Frontend Dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY src/frontend/package*.json ./
RUN npm install

COPY src/frontend/ ./
# Set the API URL for the build
ENV VITE_API_URL=http://localhost:3001
RUN npm run build

# Production stage
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Default nginx port
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
