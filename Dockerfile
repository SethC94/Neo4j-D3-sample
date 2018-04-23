#Base Image
FROM node:9.8.0

WORKDIR /app

COPY package.json /app
RUN npm install
COPY . /app

CMD node app.js

EXPOSE 3000
