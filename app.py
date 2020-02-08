import json
from flask import jsonify 
from flask import Flask
from flask import render_template

app = Flask(__name__)

@app.route('/')
def hello_world():
    return render_template('index.html')

@app.route('/tables.json')
def get_tables():
    return jsonify(json.load(open('tables.json', 'r')))
