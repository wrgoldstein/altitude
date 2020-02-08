from es_setup import Table, Q

q = Q("multi_match", query='python make', fields=['schemaname', 'tablename'])
print(Table.search().execute())
