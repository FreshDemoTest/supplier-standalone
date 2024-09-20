# 1. Use an official Node.js runtime as a parent image
FROM node:18-alpine

# 2. Set the working directory in the container
WORKDIR /usr/src/app

# 3. Copy the package.json and package-lock.json (if available)
COPY package*.json ./

# 4. Install dependencies (npm ci is used for CI/CD, npm install is used for development)
RUN npm ci --only=production

# 5. Copy the rest of the application code
COPY . .

# 6. Build the app for production
RUN npm run build

# 7. Install a simple server to serve the production build (e.g., serve)
RUN npm install -g serve

# 8. Expose the port your app will run on (default for serve is 5000)
EXPOSE 5000

# 9. Use serve to serve the build directory
CMD ["serve", "-s", "build", "-l", "5000"]