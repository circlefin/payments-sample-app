 FROM node:12-alpine
 
 WORKDIR /app
 COPY . /app
 
 RUN echo BASE_URL=https://api-sandbox.circle.com > .env
 RUN yarn install
 CMD yarn dev
