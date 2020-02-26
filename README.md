# Altitude

<table>
    <tr>
        <th> What is this? </th> 
        <td> A data dictionary application for searching for available data </td>
    </tr>
    <tr>
        <th> Status </th> 
        <td> Under development
    </tr>
</table>

### Architecture

This application is designed to be as simple as possible. It is [svelte](https://svelte.dev/) on the front end and [flask](https://flask.palletsprojects.com/en/1.1.x/) on the back end, along with [elasticsearch](https://www.elastic.co/) for searching and persisting metadata. It currently allows for connecting to Redshift or Postgres databases.

### Getting started

- Clone the repo
- Install [docker](https://docs.docker.com/install/) and [docker-compose](https://docs.docker.com/compose/install/)
- Run `docker-compose up`

At this point you're up and running!

#### Getting data

If you want to import some sample data to get started, run:

```
docker-compose exec web python example_indexer.py
```

If instead you have a postgres database to explore:

Add a `config.yml` at the root of the project with the single entry pointing to the target data warehouse in the following format:

```yaml
host: localhost
port: 5432
user: ...
password: ...
database: ...
```

```
docker-compose exec web python lib/es_index.py
```

### Local development

If you do not wish to develop in docker (maybe you don't have enough spare memory on your laptop?) run the following (assuming you've [installed elasticsearch](https://www.elastic.co/guide/en/elasticsearch/reference/current/install-elasticsearch.html))

```
npm run dev
```

Which runs the following in parallel:
- `NETWORK=localhost FLASK_ENV=dev python app.py`
- `rollup -c -w`
- `elasticsearch`

Then follow the above directions for importing data.

### Running tests

This application uses [cypress](https://www.cypress.io/) for integration testing. To run the tests in a headless docker container, run:

```
    docker-compose -f docker-compose-test.yml up --exit-code-from test
```

It will be faster when **writing new tests** to iterate by running cypress locally.

1. Run the development server in one terminal (`npm run dev`)
2. Open cypress with `node_modules/.bin/cypress open` and follow the [getting started docs](https://docs.cypress.io/guides/getting-started/testing-your-app.html) for running individual tests.

### Deployment

Not yet determined.
