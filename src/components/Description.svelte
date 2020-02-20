<script>
import { table } from "../stores.js"
export let column

let mode = 'view'
let value = column ? column.description : $table.description

let saveDescription = () => {
    
    if (column){
        let columns = $table.columns
        columns.forEach((c) => {
            c.description = c.column_name == column.column_name ?
                value :
                c.description

        })
        table.set({...$table, columns })
    } else {
        table.set({...$table, description: value })
    }

    fetch(`/tables/${$table.schemaname}.${$table.tablename}`, {
        method: 'POST',
        body: JSON.stringify({ table: $table })
    }).then(() => {
        mode = 'view'
    })
}

let editMode = () => {
    mode = 'edit'
    // enable keyboard shortcuts #todo
}
</script>

{#if mode == 'edit'}
    <textarea bind:value={value} class="textarea" placeholder="e.g. Never use this."></textarea>
    <button on:click={saveDescription} class="button">save</button>
{:else}
    <div>{value || 'No description yet.'}</div>
    <button on:click={editMode} class="button">edit</button>
{/if}
