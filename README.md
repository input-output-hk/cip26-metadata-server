# CIP-26 Cardano Off-Chain Metadata

## Table of contents

- [CIP-26 Cardano Off-Chain Metadata](#cip-26-cardano-off-chain-metadata)
  - [Table of contents](#table-of-contents)
  - [About the project](#about-the-project)
    - [Components](#components)
      - [Backend Server](#backend-server)
      - [MongoDB](#mongodb)
    - [Considerations](#considerations)
  - [Getting started](#getting-started)
    - [Deploy manually](#deploy-manually)
      - [Installing dependencies](#installing-dependencies)
      - [Setting up database](#setting-up-database)
      - [Setting environmental variables](#setting-environmental-variables)
      - [Starting the application](#starting-the-application)
      - [Running tests](#running-tests)
    - [Deploy using Docker Compose](#deploy-using-docker-compose)
      - [Setting environmental variables](#setting-environmental-variables-1)
      - [Deploying](#deploying)
  - [Contributing](#contributing)
  - [License](#license)

## About the project

This project was built using

- [![NodeJS][nodejs]][nodejs-url]
- [![MongoDB][mongodb]][mongodb-url]

### Components

This solutions consists of a backend server that implements a REST API, and a MongoDB database.

#### Backend Server

The backend server is written using the following:
  - TypeScript as language.
  - NodeJs as runtime environment.
  - ExpressJS framework.

The structure of the project can be divided into 4 layers.

* **Routes**: Mapping layer. The endpoints and links to handlers are defined here.
* **middlewares**: Validation layer. Request format and schema validation is implemented on this layer.
* **handlers**: Request handling and business logic layer.
* **Services**: Integration with external services and the database. Should not include business logic.

#### MongoDB

MongoDB is used as storage service implementing the following schema. (For further information about what each property represents please refer to [CIP-26](https://cips.cardano.org/cips/cip26/)):

```json
{
  "_id": {
      "type": "string",
      "optional": false
  },
  "subject": {
      "type": "string",
      "optional": false
  }, 
  "policy": {
      "type": "string",
      "optional": true
    },
    "preimage": {
      "type": "object",
      "optional": true,
      "properties": {
        "alg": {
          "type": "string",
          "optional": false
        },
        "msg": {
          "type": "string",
          "optional": false
        }
      }
    },
    "name": {
      "type": "string",
      "optional": true
    },
    "description": {
      "type": "string",
      "optional": true
    },
    "ticker": {
      "type": "string",
      "optional": true
    },
    "decimals": {
      "type": "integer",
      "optional": true
    },
    "url": {
      "type": "string",
      "optional": true
    },
    "logo": {
      "type": "string",
      "optional": true
    },
    "<entry>": {
      "type": "object",
      "optional": "false",
      "properties": {
        "value": {},
        "sequenceNumber": { 
          "type": "integer",
          "optional": false
         },
        "signatures": { 
          "type": "array",
          "optional": "false",
          "items": {
            "type": "object",
            "properties": {
              "publicKey": "string",
              "signature": "string"
            }
          }
        }
      }
    }
}
```

### Considerations

- The application does not manage ownership over database objects. Every user could modify every object. This kind of permissions should be implemented on further developments or by another service.
- There is no authentication method for requests for the moment. This can be implemented on further developments too.
  
## Getting started

### Deploy manually

#### Installing dependencies

```bash
npm run install
```

#### Setting up database

Create a MongoDB database and set the DATABASE_URL variable on `.env` file.

```bash
DATABASE_URL=mongodb+srv://<username>:<password>@<your-cluster-url>/test?retryWrites=true&w=majority
```

#### Setting environmental variables

A list of environmental variables can be found in `.env.example` file.
Copy that file, rename the copy to `.env` and replace the values with the correct ones.

#### Starting the application

Start the application running

```bash
npm run dev
```

Once the application is started swagger docs can be found at `<server-url>/docs`.

#### Running tests

Running unit tests:

```bash
npm run test:unit
```

```bash
npm run test:unit:cover
```

Running end to end tests:

```bash
npm run test:integration
```

### Deploy using Docker Compose

#### Setting environmental variables

A list of environmental variables can be found in `.env.example` file.
Copy that file, rename the copy to `.env` and replace the values with the correct ones.

#### Deploying

The application can be started locally via Docker Compose.

```bash
docker-compose up
```

Once the application is started swagger docs can be found at `<server-url>/docs`.

## Contributing

[CONTRIBUTING.md](./docs/CONTRIBUTING.md)

## License

This project is available under the [MIT license](https://opensource.org/licenses/MIT).

[mongodb]: https://img.shields.io/badge/mongodb-ffffff?style=for-the-badge&logo=mongodb&logoColor=green
[mongodb-url]: https://www.mongodb.com/
[nodejs]: https://img.shields.io/badge/node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white
[nodejs-url]: https://nodejs.org/en/
