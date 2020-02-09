TODO
======

2. Table component
    - add point people / owners
        * owners should be editable
    - tags should be editable
    - visually differentiate between different column types
    - add design for column metadata -> distribution, most common values
        * this could be a Column component that can grow or shrink when clicked
    - Add stars / hearts as a way of showing that a table is well used
3. Metadata fetcher
    - There needs to be at minimum a script that can be cronned into fetching the latest from redshift
    - Consider hitting the stv_queries table for query metadata / usage
    - other tables: information schema for tables, pg_table_stats or whatever for columns
    - 
4. Design a homepage. Liked tables, recently used tables
5. Search -- metadata needs to be searchable. Add search page, that links out to Table component page.
6. Find some good sample data to toss into a postgres instance as a test
