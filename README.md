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

- Install the javascript dependencies:

```
npm install
```

- [Install python >= 3.6](https://docs.python-guide.org/starting/installation/)
- Install [pyenv](https://github.com/pyenv/pyenv) (optional)

```
pip install flask
```

then to develop in one terminal window run `node_modules/rollup/dist/bin/rollup -c -w` and in another run `FLASK_DEBUG=1 python -m flask run`. This will ensure you have hot reloading set up. Navigate to `localhost:5000`.

### Deployment

Not yet determined.
