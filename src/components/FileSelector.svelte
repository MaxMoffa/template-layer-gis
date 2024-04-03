<script>
    import { Chip, Icon } from 'svelte-materialify/src';
    import { mdiCancel, mdiDelete } from '@mdi/js';
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    export let file;
    export let accept = ".txt"
    export let multiple = false;

    let input;

    function fileSelection(e) {
        if(multiple)
            file = e.target.files;
        else
            if(e.target.files.length > 0)
                file = e.target.files[0];
            else
                file = null;
        dispatch("change", file);
    }   

</script>

<main>

    {#if multiple && file !== null}
        {#each file as f,i}
            <Chip class="primary-color-text mr-2" outlined link on:click={() => {
                file.splice(i, 1);
                file = file;
            }}>
                {f.name}
                <Icon path={mdiDelete} size="16"/>
            </Chip>
        {/each}
    {/if}
    {#if !multiple && file !== null}
        <Chip class="primary-color-text mr-2" outlined link on:click={() => {
            file = null;
        }}>
            {file.name}
            <Icon path={mdiDelete} size="16"/>
        </Chip>
    {/if}
    <Chip class="primary-color white-text mr-2" link on:click={() => {
        input.click();
    }}>
        Seleziona {accept}
    </Chip>

    <input bind:this={input} type="file" {accept} on:change={fileSelection}>

</main>

<style>

    input {
        display: none;
    }

</style>