<script>

    import ListHandler from "../ListHandler.svelte";

    export let active = true;
    export let url = "";
    export let method = "POST";
    export let getFormData = null;
    export let enablePageHandler = false;
    export let responseHandler = response => response.result;
    export let checkResponseCode = true;
    export function getItem (i) { return listRef?.getItem?.(i) };

    // Reference to list
    let listRef;

</script>

<!-- Check if is active -->
{#if active}

    <!-- Main container -->
    <main>

        <!-- List handler -->
        <ListHandler 
            bind:this={listRef}
            {url}
            {method}
            {getFormData}
            {enablePageHandler}
            {responseHandler}
            {checkResponseCode}
            padding={0}
            hideScrollbar
        >
        
            <!-- Custom list item -->
            <svelte:fragment slot="list-item" let:item let:i let:length>

                <!-- Slot for custom list-item -->
                <slot name="list-item" {item} {i} {length}>

                    <!-- Fallback item -->
                    <div class="text-center pa-3">
                        {i}
                    </div>
    
                </slot>

            </svelte:fragment>            

        </ListHandler>


    </main>
    
{/if}

<style>

    /* Main container */
    main {
        height: 200px;
    }

</style>