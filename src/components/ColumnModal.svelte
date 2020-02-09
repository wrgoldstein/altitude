<script>
    export let table, column, save, close

    let saved = false

    import { onMount } from 'svelte'

    onMount(() => console.log(column))

    document.addEventListener('keydown', (event) => {
        if (event.keyCode == 27){
            column = undefined
        }
    });

    const this_save = () => {
      save()
      saved = true
      setTimeout(() => saved = false, 300)
    }
</script>
<div class="modal is-active">
  <div class="modal-background"></div>
  <div class="modal-card">
    <header class="modal-card-head">
      <p class="modal-card-title">{table.tablename}.{column.column_name}</p>
      <button on:click={close} class="delete" aria-label="close"></button>
    </header>
    <section class="modal-card-body">
      <slot></slot>
    </section>
    <footer class="modal-card-foot">
      <button on:click={save} class="button is-success">Save changes</button>
      <button on:click={close} class="button">Cancel</button>
    </footer>
  </div>
</div>