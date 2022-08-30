FROM docker.atixlabs.com/node:16.16.0-alpine

RUN apk add --update bash npm
RUN apk add --update g++ make py3-pip
RUN mkdir -p /application
COPY . /application/
WORKDIR /application/
# install
RUN npm install
# build
WORKDIR /application
RUN npm run build
EXPOSE 8080
CMD npm run start
