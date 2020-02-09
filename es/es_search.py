from es.es_setup import Table, Q

def get_tables():
    q = Q("multi_match", query='python make', fields=['schemaname', 'tablename'])
    return [Table.to_dict(t) for t in Table.search().execute().hits]

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

