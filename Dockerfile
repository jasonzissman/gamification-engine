# Docker image for jz-gamification-engine

FROM node:17-alpine3.14

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY src/ ./src

EXPOSE 3000
ENTRYPOINT ["/usr/local/bin/npm", "start"]
