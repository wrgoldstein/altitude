from elasticsearch_dsl import Document, Date, Nested, Boolean, \
    analyzer, InnerDoc, Completion, Keyword, Text, Search, Q
from elasticsearch_dsl.connections import connections

from es_setup import Table, Column, TableTag, ColumnTag
from pg import execute

tables = execute("""
      select
        distinct table_schema, table_name
      from information_schema.columns
      where table_schema not in ('pg_catalog', 'information_schema')
""")

column_stats_query = """
    select 
      schemaname,
      tablename,
      attname,
      data_type,
      inherited,
      null_frac,
      avg_width,
      n_distinct,
      most_common_vals::text::varchar[],
      most_common_freqs::text::varchar[],
      histogram_bounds::text::varchar[]
    from pg_stats p
      left join information_schema.columns c
        on p.schemaname = c.table_schema
        and p.tablename = c.table_name
        and p.attname = c.column_name
    where (tablename = '{tablename}' and schemaname = '{schemaname}')
"""

def stats_to_column(stats):
    ix, stats = stats
    return Column(
        column_name = stats['attname'],
        column_type = stats['data_type'],
    )

for ix, table in tables.iterrows():

    schemaname = table['table_schema']
    tablename = table['table_name']

    column_stats = execute(column_stats_query.format(tablename=tablename, schemaname=schemaname))
    columns = list(map(stats_to_column, column_stats.iterrows()))

    indexable = Table(
        meta = {"id": "{schemaname}.{tablename}".format(tablename=tablename, schemaname=schemaname)},
        schemaname = schemaname,
        tablename = tablename,
        columns = columns
    )

    indexable.save()
    

