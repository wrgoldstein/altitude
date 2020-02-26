import requests
import unittest
from unittest.mock import MagicMock

import app
import example.es_index

IndexName = "test_tables"

class Index:
    "Overwrite Elasticsearch model index with this one"
    name = IndexName

app.es_search.Table.Index = Index

if __name__ == "__main__":
    try:
        # index and then run server
        example.es_index.index_all()
        app.app.run(host='0.0.0.0')
    finally:
        # clean up elasticsearch test index
        response = requests.delete(f"http://localhost:9200/{IndexName}")
