from elasticsearch import Elasticsearch
from elasticsearch_dsl import Document, Date, Nested, Boolean, \
    analyzer, InnerDoc, Completion, Keyword, Text, Search, Q

class ColumnTag(InnerDoc):
    tag = Text(analyzer='snowball')

class TableTag(InnerDoc):
    tag = Text(analyzer='snowball')

class Column(InnerDoc):
    columname = Text(analyzer='snowball')
    columntype = Text(analyzer='snowball')
    description = Text(analyzer='snowball')
    tags = Nested(ColumnTag)

    # These come back as multiple types which throws a wrench
    # into Elasticsearch's fragile mind. So ignore for now, since
    # they're noncritical.
    #
    # most_column_vals = Text()
    # histogram_bounds = Text()  

class Table(Document):
    schemaname = Text(analyzer='snowball')
    tablename = Text(analyzer='snowball')
    description = Text(analyzer='snowball')
    columns = Nested(Column)
    tags = Nested(TableTag)

    last_used = Text()

    class Index:
        name = "tables"
