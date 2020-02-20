import os
from lib.es_setup import Table, Q

from elasticsearch_dsl.connections import connections

es = connections.create_connection(hosts=['http://{host}'.format(host=os.getenv('NETWORK'))])

def search_query(term):
    return {
        "query": {
            "bool": {
                "should": [ 
                    {
                        "nested": {
                            "path": "columns",
                            "query": {
                                "nested": {
                                    "path": "columns.tags",
                                    "query": {
                                        "match": {
                                            "columns.tags.tag": {
                                                "query": "{term}".format(term=term),
                                                "fuzziness": 3
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    {
                        "nested": {
                            "path": "columns",
                            "query": {
                                "multi_match": {
                                    "query": "{term}".format(term=term),
                                    "fields": ["columns.description^2", "columns.column_name^3"]
                                }
                            }
                        }
                    },
                    {
                        "multi_match": {
                            "query": "{term}".format(term=term),
                            "fields": ["description^3", "schemaname", "tablename^5"]
                        }
                    }
                ]
            }
        }
    }

def get_tables():
    q = Q("multi_match", query='python make', fields=['schemaname', 'tablename'])
    return [Table.to_dict(t) for t in Table.search().execute().hits]

def search_tables(term):
    result = es.search(index='tables', body=search_query(term))
    hits = result['hits']['hits']
    tables = [Table.to_dict(Table.from_es(hit)) for hit in hits]
    return tables

def get_table_by_id(table_id):
    try:
        return Table.to_dict(Table.get(table_id))
    except:
        print("table {table_id} not found".format(table_id=table_id)) #TODO add logging
        return

def update_table_by_id(table_id, params):
    table = Table.get(table_id)
    table.columns = params.get('columns')
    table.description = params.get('description')
    table.save()
