FROM node:20-alpine AS base

# Install necessary packages for Puppeteer
# Installs latest Chromium (100) package.
RUN apk add --no-cache \
    udev \
    ttf-freefont \
    chromium

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app

COPY package*.json ./

RUN npm install

EXPOSE 3000

CMD ["npm", "run", "dev"]
