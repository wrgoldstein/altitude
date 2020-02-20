<script>
	import { table } from "./stores.js"

    export let table_id;

	let loaded = false
	let modal_column
    
	import { onMount } from "svelte"
	import ColumnModal from "./components/ColumnModal.svelte"
	import Description from "./components/Description.svelte"
	import Tags from "./components/Tags.svelte"

    const get_table_metadata = async (table_id) => {
        const response = await fetch(`/tables/${table_id}.json`).then(resp => resp.json())
		table.set(response)
		loaded = true
	}

    onMount(() => {
        get_table_metadata(table_id)
	})

</script>

<svelte:head>
	<title>Altitude: {$table.name || 'Table'}</title>
</svelte:head>

<div class="panel is-primary">
	{#if loaded}
		<p class="panel-heading">{$table.schemaname}.{$table.tablename}</p>
		
		<div class="column">
			<p class="heading">description</p>
			<Description column={undefined}/>
		</div>
		<div>
			{#each ($table.columns || []) as column}
				<div class="columns">
					<p class="column is-one-fifth cell">{column.column_name}</p>
					<p class="column is-one-fifth cell">{column.column_type}</p>
					<p class="column is-one-fifth cell"><Tags {column}/></p>
					<p class="column cell"><Description {column}/></p>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>

.cell {
	margin: 1em;
	overflow: scroll;
	text-align: left;
	scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none;  /* Internet Explorer 10+ */
}
.cell::-webkit-scrollbar { /* WebKit */
    width: 0;
    height: 0;
}
</style>
