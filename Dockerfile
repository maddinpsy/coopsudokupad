# Use the official Caddy image as the base
FROM caddy:2-alpine

# Copy the application source files to the container
COPY src /app

# Copy the Caddyfile to the container
COPY Caddyfile /etc/caddy/Caddyfile

# Expose Caddy's default port
EXPOSE 80
