import os
from lib.es_setup import Table, Q

from elasticsearch_dsl.connections import connections

es = connections.create_connection(hosts=['http://{host}'.format(host=os.getenv('NETWORK'))])

def search_query(term):
    return {
        "query": {
            "bool": {
                # use bool query to string together multiple matches
                "should": [ 
                    # nested query to search columns.tags.tag
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
                                                "fuzziness": 3,
                                                "boost": 5
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    # nested query to search columns.description and columns.column_name
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
                    # match table fields
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

def get_tables(page):
    start = 20 * (page - 1)
    end = 20 * page
    return [Table.to_dict(t) for t in Table.search()[start:end].execute().hits]

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
