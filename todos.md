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
- [x] Search -- metadata needs to be searchable. Add search page, that links out to Table component page.
- [x] Find some good sample data to toss into a postgres instance as a test
- [ ] Use `moz-sql-parser` to provide a way to index:
    * How many times in the last 7 days a given table has been queried
    * Which tables are most frequently co-queried with that table
- [x] Clean up design of tables view and columns view
- [x] Add functionality for editing description and tags of tables, and tags of columns
- [ ] Security audit

### Testing

My plan is to use [Cypress](https://www.cypress.io/) to do full integration testing. I'm not sure whether additional unit testing of the server / elasticsearch is necessary after covering a reasonable surface area with integration testing. Leaning towards thinking its a good idea.

Struggling now with how to set up Docker for testing with Cypress.

I think I want

- `npm run dev` to run the full battery of services needed (Elastic, Rollup, Flask)
- `npm run test` to run both the necessary services and cypress
- `npm run prod` to run just Flask

With the Dockerfile / docker-compose set up so that in `dev` or `test` we don't run an external elasticsearch cluster but in `prod` we do.

Using `depends_on:`, we might be able to orchestrate the cypress and test environment in docker-compose, as detailed here: https://www.ardanlabs.com/blog/2019/03/integration-testing-in-go-executing-tests-with-docker.html. This actually seems like it would work great with `docker-compose -f docker-compose.test.yml up` and a small change to the base dockerfile. 

I'm trying to have either path be legitimate: run everything through docker, or run stuff locally for more visibility and lower memory overhead.

1. locally [x]
    - in one pane run `npm run dev`
    - in another once that's up run `npm run test`

2. in docker [ ]
    - in one pane run `docker-compose -f docker-compose.test.yml up`
    - which will run the flask app in dev mode and then run a small container with cypress in it. Try https://stackoverflow.com/questions/39996732/docker-compose-disable-output-on-one-of-containers to silence the non cypress container, the output of which shouldn't matter (unless you're developing).
