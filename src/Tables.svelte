<script>
    import { tables } from "./stores.js"

    import { onMount } from "svelte"

    const get_tables_metadata = async () => {
        const response = await fetch(`/tables.json`).then(resp => resp.json())
        tables.set(response)
    }

    onMount(() => {
        get_tables_metadata()
    })
</script>

<svelte:head>
	<title>Altitude: Discover</title>
</svelte:head>

<div class="panel">
	<p class="panel-heading">Tables</p>
    <div class="panel-block">
        <p class="control has-icons-left">
        <input class="input" type="text" placeholder="Search">
        <span class="icon is-left">
            <i class="fas fa-search" aria-hidden="true"></i>
        </span>
        </p>
    </div>
    <div class="panel-block description">
        <h3>Most popular tables matching your search</h3>
    </div>
	<div class="full-height column">
        <p class="subtitle">Tables</p>
        {#each $tables as table}
            <a href="/tables/{table.schemaname}.{table.tablename}">
                <div class="level table">
                    {table.schemaname}.{table.tablename}
                </div>
            </a>
        {/each}
	</div>
	<div class="level"></div> 
</div>

<style>

.table {
    padding: 10px;
    margin-bottom: 0px;
    text-decoration: none;
}

.table:hover {
    background-color: #00c4a7;
    color: white;
}

.description {
    color: grey;
}

.panel {
    height: 100%;
}
</style>
