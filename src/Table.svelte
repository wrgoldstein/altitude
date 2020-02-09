<script>
    export let table_id;

	let table = { columns: [] }
	let modal_column
    
	import { onMount } from "svelte"
	import ColumnModal from "./components/ColumnModal.svelte"

    const get_table_metadata = async (table_id) => {
        const response = await fetch(`/tables/${table_id}.json`).then(resp => resp.json())
        table = response
	}
	
	function pop_modal(i){
		return () => {
			modal_column = table.columns[i]
		}
	}

    onMount(() => {
        get_table_metadata(table_id)
	})
	
	let save = () => {
		if (modal_column){

			// somewhat roundabout because we need to mutate
			// the original page as well as the modal content
			table.columns.forEach((column) => {
				if (column.column_name == modal_column.column_name){
					column.description = modal_column.description
				}
			})
			fetch(`/tables/${table.schemaname}.${table.tablename}`, {
				method: 'POST',
				body: JSON.stringify({ table })
			}).then(() => 
				table = table
			)
			
		}
	}

	let close = () => modal_column = undefined
</script>

<svelte:head>
	<title>Altitude: {table.name}</title>
</svelte:head>

<!-- MODAL -->
{#if modal_column}
	<ColumnModal table={table} column={modal_column} {save} {close}>
		<div class="level">
			<div class="column">
				<div class="level-item has-text-centered column">
					<p class="heading">description</p>
					<textarea bind:value={modal_column.description} class="textarea" placeholder="e.g. Favorite column ever!"></textarea>
				</div>
			</div>
			<div class="column">
				<div class="level-item has-text-centered column">
					<p class="heading">tags</p>
					<p class="">{modal_column.tags}</p>
				</div>
			</div>
      </div>
	</ColumnModal>
{/if}

<!-- MAIN PAGE -->
<div class="panel is-primary">
	<p class="panel-heading">{table.schemaname}.{table.tablename}</p>
	<p class="panel-block description">{table.description || ''}</p>

	<div class="level"></div>
	<div>
		<table>
			<thead>
				<tr>
					<th class="subtitle has-text-centered"><p class="subtitle">Column</p></th>
					<th class="subtitle has-text-centered">Type</th>
					<th class="subtitle has-text-centered" colspan=3>Other information</th>
				</tr>
			</thead>
			<tbody>
				{#each table.columns as column, i}
					<tr>
						<td class="has-text-centered">{column.column_name}</td>
						<td class="has-text-centered">{column.column_type}</td>
						<td class="has-text-centered">
							<div class="level-item has-text-centered column">
								<p class="heading">description</p>
								<p class="">{column.description}</p>
							</div>
						</td>
						<td class="has-text-centered">
							<div class="level-item has-text-centered column">
								<p class="heading">tags</p>
								<p class="">{column.tags}</p>
							</div>
						</td>
						<td class="has-text-centered">
							<ion-icon on:click={pop_modal(i)} name="ellipsis-horizontal-outline" class="icon is-medium"></ion-icon>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

<style>
.tablecolumn {
    margin-bottom: 0px;
    text-decoration: none;
}

.tablecolumn:hover {
    background-color: #f5f5f5;
}

.description {
	color: grey;
}

.attribute {
	justify-content: space-around;
}

table {
	width: 100%;
}

td, th {
	vertical-align: middle;
}

tr {
	height: 2em;
}

.textarea {
	vertical-align: top;
}
</style>
