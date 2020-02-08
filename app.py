import json
from flask import jsonify 
from flask import Flask
from flask import render_template

app = Flask(__name__)

# ===== Pages ======

@app.route('/')
def hello_world():
    return render_template('index.html')

@app.route('/tables/<table>')
def get_table(table=None):
    return render_template('index.html', table=table)

# ===== JSON API =====

@app.route('/tables/<table>.json')
def get_table_json(table):
    #TODO replace this with a database
    try:
        tables = json.load(open('tables.json', 'r'))
        table = next(filter(lambda t: t['name'] == table, tables))
        return jsonify(table)
    except StopIteration:
        return

@app.route('/tables.json')
def get_tables_json():
    return jsonify(json.load(open('tables.json', 'r')))

