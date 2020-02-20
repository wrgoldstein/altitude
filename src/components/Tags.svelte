<script>
import _ from "lodash"
import { table } from "../stores.js"
export let column

let mode = 'view'
let tags = (column ? column.tags : $table.tags) || []
let new_tag;


let saveTags = () => {
    // todo there must be a cleaner way to do this
    console.log(tags)
    if (column){
        let columns = $table.columns
        columns.forEach((c) => {
            if (c.column_name == column.column_name) {
                c.tags = (c.tags || []).concat({tag: new_tag})
            }
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
        tags = tags.concat({tag: new_tag})
        new_tag = undefined
    })
}

let editMode = () => {
    mode = 'edit'
    // enable keyboard shortcuts #todo
}

function deleteTag(i) {
    return () => {
        let filtered_tags = _.clone(tags)
        filtered_tags.splice(i, 1)
        if (column){
            let columns = $table.columns
            columns.forEach((c) => {
                if (c.column_name == column.column_name){
                    c.tags = filtered_tags
                }
            })
            table.set({...$table, columns })
        } else {
            table.set({...$table, description: value })
        }

        fetch(`/tables/${$table.schemaname}.${$table.tablename}`, {
            method: 'POST',
            body: JSON.stringify({ table: $table })
        }).then(() => {
            tags = filtered_tags
            mode = 'view'
        })
    }
}

</script>

<!-- svelte-ignore a11y-missing-attribute
                   a11y-autofocus -->
<div>
    {#each (tags || []) as tag, i}
        <div class="tag">
            <p>{tag.tag}</p>
            <a href="javascript:;" on:click={deleteTag(i)} class="delete is-small"></a>
        </div>
    {/each}
    {#if mode == 'edit'}
        <input bind:value={new_tag} autofocus placeholder="Add a new tag">
        <button on:click={saveTags} class="button">save</button>
    {:else}
        <span on:click={editMode} class="icon is-medium">
            <ion-icon name="pencil-outline"></ion-icon>
        </span>
    {/if}
</div>

<style>
.tag {
    background-color: #eee;
}

ion-icon:hover {
    cursor: pointer;
}
</style>
