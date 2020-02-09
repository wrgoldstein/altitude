<script>
	import Layout from "./Layout.svelte"
	import Table from "./Table.svelte"
	import Tables from "./Tables.svelte"

	export let sel, table_id;
</script>

<Layout>
	<main>
	{#if sel == "table"}
		<Table {table_id} />
	{:else if sel == "tables"}
		<Tables />
	{:else}
		<h1>Hello! Try navigating to discover available data!</h1>
	{/if}
	</main>
</Layout>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 80vw;
		margin: 0 auto;
		height: 90%;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (max-width: 800px) {
		main {
			max-width: none;
		}
	}
</style>