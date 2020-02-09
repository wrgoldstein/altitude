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
- Install the javascript dependencies with `npm install`
- [Install python >= 3.6](https://docs.python-guide.org/starting/installation/)
- Install [pyenv](https://github.com/pyenv/pyenv) (optional)
- Install python dependencies with `pip install -r requirements.txt`
- This may change, but for now add a `config.yml` at the root of the projecft with the single entry pointing to the target data warehouse in the following format:

```yaml
database_url: postgres://abc:123@ec2-....compute-1.amazonaws.com:5432/databoose
```

- Get elasticsearch set up:

```sh
python es/es_setup.py
python es/es_index.py
```

then:

- in one terminal window run `node_modules/rollup/dist/bin/rollup -c -w`
- in another run `FLASK_DEBUG=1 python -m flask run`. This will ensure you have hot reloading set up. Navigate to `localhost:5000`
- in a third, run `docker-compose up` to launch [elasticsearch](https://www.elastic.co/elasticsearch). Eventually `docker-compose` will orchestrate both the web server and the search service.
    * Note elasticsearch with docker is quite memory hungry-- if you get cryptic errors, try reducing to one node or increasing the memory allocated to docker.


### Deployment

Not yet determined.
