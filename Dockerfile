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

# 6. Expose the port on which your app will run (e.g., 3000)
EXPOSE 3000

# 7. Define the command to run the application
CMD ["npm", "start"]