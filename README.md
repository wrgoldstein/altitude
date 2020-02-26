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

This application is designed to be as simple as possible. For now, it is [svelte](https://svelte.dev/) on the front end and [flask](https://flask.palletsprojects.com/en/1.1.x/) on the back end. It currently has no database connections, although it will eventually have two (one to store data related to this project and one source connection to get data from Redshift).

### Development

- Clone the repo
- Install [docker](https://docs.docker.com/install/) and [docker-compose](https://docs.docker.com/compose/install/)
- Run `docker-compose up`
- After the initial setup, once elasticsearch is online, run the following to initialize the elasticsearch mappings:
    * Note this doesn't work for databases on locally tunneled ports (e.g. StrongDM). In that case, run the script locally pointing to localhost:9200 which is exposed from the Dockerfile.


##### If you have a postgres database to explore

Add a `config.yml` at the root of the projecft with the single entry pointing to the target data warehouse in the following format:

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

##### If you just want to get set up with sample data

```
docker-compose exec web python example_indexer.py
```

- Elasticsearch will be running on :9200 and Altitude will be running on :5000.
    * Note elasticsearch with docker is quite memory hungry-- if you get cryptic errors, try reducing to one node or increasing the memory allocated to docker.

**Alternatively**, if you do not wish to develop in docker (maybe you don't have 5GB of spare memory on your laptop?) run the following in three separate terminal prompts (assuming you've [installed elasticsearch](https://www.elastic.co/guide/en/elasticsearch/reference/current/install-elasticsearch.html))

- `NETWORK=localhost FLASK_ENV=dev python app.py`
- `rollup -c -w`
- `elasticsearch`

or just `npm run dev` which runs all three in parallel.

and in a fourth run 

```
python lib/es_setup.py
python lib/es_index.py
```

### Tests

This application uses [cypress](https://www.cypress.io/) for integration testing. To run the tests in a headless docker container, run:

```
    docker-compose -f docker-compose-test.yml up --exit-code-from test
```

It will be faster when **writing new tests** to iterate by running cypress locally.

1. Run the development server in one terminal (`npm run dev`)
2. Open cypress with `node_modules/.bin/cypress open` and follow the [getting started docs](https://docs.cypress.io/guides/getting-started/testing-your-app.html) for running individual tests.

### Deployment

Not yet determined.
