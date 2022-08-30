# FROM docker.atixlabs.com/node:16.16.0-alpine
FROM node:16.16.0-buster-slim

# RUN apk add --update bash npm
# RUN apk add --update g++ make py3-pip
RUN apt-get update && apt-get install python3.7 build-essential -y && apt-get clean && ln -s /usr/bin/python3.7 /usr/bin/python 
RUN mkdir -p /application
COPY . /application/
WORKDIR /application/
# install
RUN npm ci
# build
WORKDIR /application
RUN npm run build
EXPOSE 8080
CMD npm run start
