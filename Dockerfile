# 1. Use an official Node.js runtime as a parent image
FROM node:18-alpine

# 2. Set the working directory in the container
WORKDIR /usr/src/app

# 3. Copy the package.json and package-lock.json (if available)
COPY package*.json ./

# 4. Install dependencies
RUN npm install

# 5. Install env-cmd to pass environment variables at runtime
RUN npm install -g env-cmd

# 6. Copy the rest of the application code
COPY . .

# 7. Build the app for production
RUN npm run build

# 8. Expose the port your app will run on
EXPOSE 5000

# 9. Use env-cmd to pass environment variables to the build
CMD ["env-cmd", "-f", ".env", "serve", "-s", "build", "-l", "5000"]