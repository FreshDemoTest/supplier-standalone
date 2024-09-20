# 1. Use an official Node.js runtime as a parent image
FROM node:18-alpine

# 2. Set the working directory in the container
WORKDIR /usr/src/app

# 3. Copy the package.json and package-lock.json (if available)
COPY package*.json ./

# 4. Install dependencies (npm ci is used for CI/CD, npm install is used for development)
RUN npm install

# 5. Copy the rest of the application code
COPY . .

# 6. Set the desired port as an environment variable
ENV PORT=4000

# 7. Expose the port your app will run on
EXPOSE 4000

# 8. Start the app with the specified port
CMD ["npm", "start"]