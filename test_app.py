import os
import requests
import unittest
from unittest.mock import MagicMock

import app

import time
from elasticsearch_dsl.connections import connections
import example.es_index

IndexName = "test_tables"

example.es_index.Table._index._name = IndexName

if __name__ == "__main__":
    host = os.getenv('NETWORK') or 'localhost'
    es = connections.create_connection(hosts=['http://{host}'.format(host=host)])
    
    try:
        # index and then run server
        example.es_index.index_all()
        app.app.run(host='0.0.0.0')
    finally:
        # clean up elasticsearch test index
        response = requests.delete(f"http://localhost:9200/{IndexName}")
