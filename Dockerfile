# Docker image for jz-gamification-engine

FROM node:14

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY src/ .

EXPOSE 3000
ENTRYPOINT ["/usr/local/bin/npm", "start"]
