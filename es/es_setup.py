from elasticsearch import Elasticsearch
from elasticsearch_dsl import Document, Date, Nested, Boolean, \
    analyzer, InnerDoc, Completion, Keyword, Text, Search, Q
from elasticsearch_dsl.connections import connections

connections.create_connection(hosts=['localhost'])

class ColumnTag(InnerDoc):
    tag = Text(analyzer='snowball')

class TableTag(InnerDoc):
    tag = Text(analyzer='snowball')

class Column(InnerDoc):
    columname = Text(analyzer='snowball')
    columntype = Text(analyzer='snowball')
    tags = Nested(ColumnTag)
    # most_column_vals = Text()
    # histogram_bounds = Text()

class Table(Document):
    schemaname = Text(analyzer='snowball')
    tablename = Text(analyzer='snowball')
    columns = Nested(Column)
    tags = Nested(TableTag)

    class Index:
        name = "tables"


# create the mappings in elasticsearch
Table.init()
