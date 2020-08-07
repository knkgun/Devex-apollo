FROM node:13.14.0-alpine3.11
WORKDIR /app
COPY ./package.json ./
RUN yarn install
COPY . ./
RUN wget https://s3.amazonaws.com/rds-downloads/rds-combined-ca-bundle.pem
RUN yarn start