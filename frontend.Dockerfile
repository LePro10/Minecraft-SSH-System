# Frontend Dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY src/frontend/package*.json ./
RUN npm install

COPY src/frontend/ ./
# No static API URL - Frontend uses dynamic window.location.hostname:3001
RUN npm run build


# Production stage
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Default nginx port
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
