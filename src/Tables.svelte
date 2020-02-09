<script>
    let tables = []
    
    import { onMount } from "svelte"

    const get_tables_metadata = async () => {
        const response = await fetch(`/tables.json`).then(resp => resp.json())
        tables = response
        console.log(tables)
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
	<div class="full-height">
        {#each tables as table}
            <a href="/tables/{table.schemaname}.{table.tablename}" class="level table">
                <div class="level-item has-text-centered column">
                    <p class="heading">table</p>
                    <p class="subtitle">{table.schemaname}.{table.tablename}</p>
                </div>
                <div class="level-item has-text-centered column">
                    <p class="heading">columns</p>
                    <p class="subtitle">{table.columns.length}</p>
                </div>
                <div class="level-item has-text-centered column">
                    <p class="heading">description</p>
                    <p class="subtitle">{table.description || 'None'}</p>
                </div>
                <div class="level-item has-text-centered column">
                    <p class="heading">tags</p>
                    <p class="subtitle">{table.tags || 'None'}</p>
                </div>
                <div class="level-item has-text-centered column">
                    <p class="heading">last_used</p>
                    <p class="subtitle">{table.last_used || 'N/A'}</p>
                </div>
            </a>
        {/each}
	</div>
	<div class="level"></div>
</div>

<style>

.table {
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
