import json
import sys, os
from lib.es_setup import Table, Column, TableTag, ColumnTag


from elasticsearch_dsl.connections import connections
es = connections.create_connection(hosts=['http://{host}'.format(host=os.getenv('NETWORK'))])

with open('example/tables.json', 'r') as f:
    tables = json.load(f)

def index_all():
    
    for table in tables:
        print('[INFO] Fetching columns for {table_schema}.{table_name}'.format(**table))
        indexable = Table(
            meta = {"id": "{table_schema}.{table_name}".format(**table)},
            schemaname = table['table_schema'],
            tablename = table['table_name'],
            columns = table['columns']
        )

        indexable.save()


if __name__ == "__main__": 
    index_all()
