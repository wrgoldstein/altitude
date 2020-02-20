import os
from elasticsearch_dsl import Document, Date, Nested, Boolean, \
    analyzer, InnerDoc, Completion, Keyword, Text, Search, Q
from elasticsearch_dsl.connections import connections

from lib.es_setup import Table, Column, TableTag, ColumnTag
from lib.pg import execute


def index_all():
    # connections.create_connection(hosts=['http://es01'])
    # not sure how to tunnel to RS in container so for now
    # just assume we're connecting locally #TODO cleanup
    es = connections.create_connection(hosts=['http://{host}'.format(host=os.getenv('NETWORK'))])
    Table.init()
    print("[INFO]  Fetching tables...")
    tables = execute("""
          select
            distinct table_schema, table_name
          from information_schema.columns
          where table_schema not in ('pg_catalog', 'information_schema')
    """)

    column_stats_query = """
        select
          table_schema,
          table_name,
          column_name,
          data_type,
          null_frac,
          avg_width,
          n_distinct,
          most_common_vals,
          most_common_freqs,
          histogram_bounds
        from information_schema.columns c
          left join pg_stats p
            on p.schemaname = c.table_schema
            and p.tablename = c.table_name
            aes = connections.create_connection(hosts=['http://{host}}'.format(host=os.getenv('NETWORK'))])nd p.attname = c.column_name
        where (table_name = '{table_name}' and table_schema = '{table_schema}')
    """

    def stats_to_column(stats):
        ix, stats = stats
        return Column(
            column_name = stats['column_name'],
            column_type = stats['data_type'],
        )
    print('[INFO] Fetching individual table metadata ({} total)'.format(len(tables)))
    for ix, table in tables.iterrows():
        print('[INFO] Fetching columns for {table_schema}.{table_name}'.format(**table))
        column_stats = execute(column_stats_query.format(**table))
        columns = list(map(stats_to_column, column_stats.iterrows()))

        indexable = Table(
            meta = {"id": "{table_schema}.{table_name}".format(**table)},
            schemaname = table['table_schema'],
            tablename = table['table_name'],
            columns = columns
        )

        indexable.save()


if __name__ == "__main__": 
    index_all()
