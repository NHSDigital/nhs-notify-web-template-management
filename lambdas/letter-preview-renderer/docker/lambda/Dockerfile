ARG BASE_IMAGE=ghcr.io/nhsdigital/nhs-notify/letter-renderer-node-22:latest

FROM node:22-alpine AS build

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY build.sh ./
COPY src ./src
COPY tsconfig.json ./
RUN chmod +x ./build.sh && ./build.sh

FROM ${BASE_IMAGE}

COPY --from=build /app/dist/index.js ${LAMBDA_TASK_ROOT}/index.js

CMD [ "index.handler" ]
