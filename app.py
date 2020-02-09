import json
from flask import jsonify 
from flask import Flask
from flask import render_template
from flask import request

from es import es_search

app = Flask(__name__)

# ===== Templates ======

@app.route('/')
def hello_world():
    return render_template('index.html')

@app.route('/tables')
def get_tables():
    return render_template('index.html', sel='tables')

@app.route('/tables/<table_id>', methods=['GET'])
def get_table(table_id=None):
    return render_template('index.html', sel='table', table_id=table_id)

# ======== API ========

@app.route('/tables/<table_id>.json')
def get_table_json(table_id):
    return jsonify(es_search.get_table_by_id(table_id))

@app.route('/tables.json')
def get_tables_json():
    # return jsonify(json.load(open('tables.json', 'r')))
    return jsonify(es_search.get_tables())

@app.route('/tables/<table_id>', methods=['POST'])
def update_table(table_id):
    es_search.update_table_by_id(table_id, json.loads(request.data)['table'])
    return 'ok'  #TODO actually check its ok
