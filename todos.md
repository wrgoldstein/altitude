TODO
======

- [x] Add either postgres or elasticsearch to persist database metadata
- [x] Table component
    - add point people / owners
        * owners should be editable
    - tags should be editable
    - visually differentiate between different column types
    - add design for column metadata -> distribution, most common values
        * this could be a Column component that can grow or shrink when clicked
    - Add stars / hearts as a way of showing that a table is well used
- [x] Metadata fetcher
    - There needs to be at minimum a script that can be cronned into fetching the latest from redshift
    - Consider hitting the stv_queries table for query metadata / usage
    - other tables: information schema for tables, pg_table_stats or whatever for columns
    - 
- [ ] Design a homepage. Liked tables, recently used tables
- [ ] Search -- metadata needs to be searchable. Add search page, that links out to Table component page.
- [ ] Find some good sample data to toss into a postgres instance as a test
- [ ] Use `moz-sql-parser` to provide a way to index:
    * How many times in the last 7 days a given table has been queried
    * Which tables are most frequently co-queried with that table
- [ ] Clean up design of tables view and columns view
- [ ] Add functionality for editing description and tags of tables, and tags of columns
- [ ] Security audit
