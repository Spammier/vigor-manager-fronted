# Stage 1: Build the Vue.js application
FROM node:20 AS build-stage

# Set the working directory
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Run npm install as root
# Also clean cache just to be thorough
RUN npm cache clean --force && npm install

# Copy the rest of the application code
COPY . .

# Run the build script as root
RUN npm run build

# Stage 2: Serve the built application with Nginx
FROM nginx:stable-alpine AS production-stage
# Copy built assets from the build stage
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Add a basic Nginx configuration
# Escape $uri for Dockerfile heredoc
COPY <<EOF /etc/nginx/conf.d/default.conf
server {
    listen 80;
    server_name localhost;

    location / {
        root   /usr/share/nginx/html;
        index  index.html index.htm;
        try_files \$uri \$uri/ /index.html; # Important for single-page applications
    }

    error_page   500 502 503 504  /50x.html;
    location = /50x.html {
        root   /usr/share/nginx/html;
    }
}
EOF
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"] 