<script>
    export let table_name;

    let table = {}
    
    import { onMount } from "svelte"

    const get_table_metadata = async (table_name) => {
        const response = await fetch(`/tables/${table_name}.json`).then(resp => resp.json())
        table = response
    }

    onMount(() => {
        get_table_metadata(table_name)
    })
</script>

<svelte:head>
	<title>Altitude: {table.name}</title>
</svelte:head>

<div class="panel is-primary">
	<p class="panel-heading">{table.schema}.{table.name}</p>
	<p class="panel-block description">{table.description}</p>

	<div class="level"></div>
	<div>
		<table>
			<tr>
				<th>column name</th>
				<th>column type</th>
				<th>description</th>
				<th>tags</th>
			</tr>
			{#each table.columns || [] as column}
				<tr>
					<td>{column.name}</td>
					<td>{column.column_type}</td>
					<td>{column.description ? column.description : '--'}</td>
					<td>{column.tags}</td>
				</tr>
			{/each}
		</table>
	</div>
	<div class="level"></div>
</div>

<style>
table {
	width: 80%;
	margin: 30px;
}

th {
	font-weight: 300;
}

.description {
	color: grey;
}
</style>
