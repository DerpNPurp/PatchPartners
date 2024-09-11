# Use the official Node.js 18 LTS image as the base image
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json to the working directory
COPY package*.json ./

# Install Node.js dependencies
RUN npm install --only=production

# Copy the rest of the application files to the working directory
COPY . .

# Expose port 8080 (the port your app will run on)
EXPOSE 8080

# Start the Node.js application
CMD ["npm", "start"]
