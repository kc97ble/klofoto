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

* `klofoto-ml-engine`: Deep learning engine

* `klofoto-backend`: Cloud infrastructure

### Deep learning engine

To run `klofoto-ml-engine`, follow these steps:

1. Launch a Deep Learning AMI

2. Download `get_sqs.py` and `styleTransfer.py`

3. Run command `source activate tensorflow_p36` to activate the virtual environment.

4. Run `sqs message listener get_sqs.py`

### Cloud infrastructure

See `klofoto-backend/readme.md` and the report for more details.
