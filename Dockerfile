# Use an official Node.js runtime as the base image
FROM node:16-alpine

# Set the working directory in the container
WORKDIR /app

# Copy the application source files to the container
COPY src ./src

# Install local-web-server globally
RUN npm install -g local-web-server

# Expose the port local-web-server will run on
EXPOSE 8000

# Define the command to run your app
CMD ["npx", "local-web-server", "--rewrite", "/api/puzzle/(.*) -> http://sudokupad.app/api/puzzle/$1", "--spa", "index.html", "-d", "src"]
