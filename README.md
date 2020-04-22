# Cloud Photo Stylizer

## Frontend

To run `klofoto-frontend`, you need to install `yarn` >= 1.22, `node` >= 10.15.

First, install dependencies by running:

```
cd klofoto-frontend
yarn
```

Then, start a local server by running:

```
yarn start
```

## Backend

Backend is divided in two folders:

* `klofoto-serverless-backend`: AWS Lambda functions

* `klofoto-ml-engine`: Python scripts to stylize photos

See `klofoto-serverless-backend/readme.md` for more details.
