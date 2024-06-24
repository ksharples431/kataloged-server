# Use the official Node.js image as the base image
FROM node:19-alpine

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Copy the service account key file
COPY serviceAccountKey.json /usr/src/app/serviceAccountKey.json

# Set environment variable for Google application credentials
# ENV GOOGLE_APPLICATION_CREDENTIALS=/usr/src/app/serviceAccountKey.json

# Expose the port the app runs on
EXPOSE 8080

# Command to run the application
CMD ["node", "src/server.js"]