<script>
	import Layout from "./Layout.svelte"
	import Table from "./Table.svelte"

	export let table;
</script>

<Layout>
	<main>
	{#if table}
		<Table table_name={table} />
	{:else}
		<h1>Hello {table}!</h1>
	{/if}
	</main>
</Layout>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 80vw;
		margin: 0 auto;
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