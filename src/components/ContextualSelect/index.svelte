<script>
  
    // Imports
    import { ContextMenu } from '../ContexMenu';
    import Icon from '../Icon';
    import ListItem from '../List/ListItem.svelte';
    import SearchElement from '../SearchElement/SearchElement.svelte';
    import { mdiCheckboxOutline, mdiCheckboxBlankOutline, mdiMinus, mdiRadioboxBlank, mdiRadioboxMarked } from '@mdi/js';
    import { Button } from '../Form';
    import { loadedDictionary } from '../../store/dictionary';
    import GhostLoader from '../GhostLoader.svelte';
    import { slide } from 'svelte/transition';
    import { Intersect } from 'svelte-materialify/src';
    import { createEventDispatcher } from 'svelte';
    import { MobileModeEnabled } from "../../store/system";

    // Dispatcher
    const dispatch = createEventDispatcher();

    // Properties
    export let active = true;
    export let value = null;
    export let ref = null;
    export let absolute = false;
    export let showSearchBar = false;
    export let placeholder = "Search";
    export let multiple = false;
    export let mandatory = false;
    export let radio = false;
    export let items = [];
    export let getItemsAsync = async () => [];
    export let enablePageHandler = false;
    export let title;

    // Dictionary handler
    let dict = $loadedDictionary;

    // Query
    let query = "";

    // Loaded items
    let loadedItems = [];

    // Page number
    let pageNumber;

    // Check if is last page
    let isLastPage = false;

    // Check if item is selected
    function isItemSelected(item, value) {

        // Check if is multiple
        if(multiple)
            return value?.includes?.(item?.value ?? item) || false;

        // Default return
        return value == (item?.value ?? item);

    }

    // Select an item from the list
    function selectItem(item) {

        // Verify value
        if(!item)
            return;
        
        // Check if is multiple
        if(multiple) {

            // Check if value is alread an array
            if(!Array.isArray( value ))
                value = [];

            // Push item
            value = [...value, ( item?.value ?? item )];

            // Close function
            return;

        }

        // Set value
        value = item?.value ?? item;

    }

    // Deselect an item from the list
    function deselectItem(item) {

        // Verify value
        if(!item)
            return;

        // Check if is multiple
        if(multiple) {

            // Check if value is alread an array
            if(!Array.isArray( value )){
                
                // Reset list
                value = [];

            } else {

                // Filter value
                value = value.filter(v => v !== (item?.value ?? item));

            }

            // Close function
            return;

        }

        // Deselect value
        value = (item?.value ?? item) === value ? undefined : value;

    }

    // Toogle item
    function toogleItem(item) {

        // Check if is multiple and item is selected
        if((multiple || !mandatory) && isItemSelected(item, value)) {

            // Deselect item
            deselectItem( item );

        } else {

            // Select item
            selectItem( item );

        }

        // Dispatch change
        dispatch("change", value)

    }

    // Get items list
    async function getItemList(query) {

        // Check if page handler should be enable
        if(enablePageHandler) {

            // Reset page number
            pageNumber = 1;

        }

        // Get asyncronus items
        let elements = await getItemsAsync(query, pageNumber);

        // Update loaded elements
        loadedItems = [...items, ...elements];

    }

    // Update page number
    function updatePage() {

        // Check if is last page
        if(isLastPage)
            return;

        // Update page number
        pageNumber += 1;

        // Get items async
        getItemsAsync(query, pageNumber)
        .then((newItems, checkLastPage) => {

            // Add new items to list
            loadedItems = [...loadedItems, ...newItems];

            // Update last page
            isLastPage = checkLastPage;

        })
        .catch(e => {
            
            // Log error
            console.error( e );

            // Stop page loader
            isLastPage = true;

        });

    }

</script>

<!-- Contextual menu -->
<ContextMenu bind:ref bind:active {absolute}>

    <!-- Check if title is valid -->
    {#if title}

        <!-- Title -->
        <div class="title" searchbar={ showSearchBar }>
            {title}
        </div>

    {/if}

    <!-- Check if search bar should be visible -->
    {#if showSearchBar}
    
        <!-- Searchbar container -->
        <div class="searchbar-container">

            <!-- Searchbar container -->
            <SearchElement bind:query {placeholder} />

        </div>

    {/if}

    <!-- Get all items -->
    {#await getItemList(query)}

        <!-- Ghost loader -->
        <GhostLoader />

    {:then}

        <!-- List -->
        <div class="list" transition:slide>
    
            <!-- Iterate over static items -->
            {#each loadedItems as item}

                <!-- Check if item is selected -->
                {@const active = isItemSelected(item, value)}

                <!-- List item container -->
                <div class="list-item-container">

                    <!-- List item -->
                    <ListItem {active} size={$MobileModeEnabled ? "large" : "default"} on:click={() => toogleItem( item )}>
                        
                        {item?.name ?? item?.key ?? item}
                        
                        <!-- Append -->
                        <svelte:fragment slot="append">

                            <!-- Check if is multiple -->
                            {#if multiple}

                                <!-- Icon -->
                                <Icon path={active ? mdiCheckboxOutline : mdiCheckboxBlankOutline} />

                            {:else if radio}

                                <!-- Icon -->
                                <Icon path={active ? mdiRadioboxMarked : mdiRadioboxBlank} />

                            {:else if !mandatory && active}
                            
                                <!-- Icon -->
                                <Icon path={mdiMinus} />

                            {/if}

                        </svelte:fragment>

                    </ListItem>

                </div>

            {/each}

            <!-- Check if page handler is enabled -->
            {#if enablePageHandler && !isLastPage}
    
                <!-- List item container -->
                <div class="list-item-container">

                    <!-- Loading item -->
                    <div class="loader-container" use:Intersect on:intersect={updatePage}>

                        <!-- Progress circular -->
                        <GhostLoader />

                    </div>

                </div>

            {/if}

        </div>

    {/await}

    <!-- Default slot -->
    <slot />

    <!-- Actions -->
    <svelte:fragment slot="actions">
    
        <!-- Close button -->
        <Button rounded text class="primary-text" size={$MobileModeEnabled ? "default" : "small"} on:click={() => active = false}>
            {dict?.getString("close")}
        </Button>

    </svelte:fragment>

</ContextMenu>

<style>

    /* Searchbar container */
    .searchbar-container {
        padding: 6px;
        border-bottom: 1px solid var(--theme-dividers);
    }

    /* List */
    .list {
        position: relative;
        padding: 3px;
        max-height: 300px;
        overflow-y: auto;
        overflow-x: hidden;
        transition: .2s ease all;
    }

    /* List item container */
    .list > .list-item-container {
        padding-bottom: 3px;
    }

    /* List item container, last-child */
    .list > .list-item-container:last-child {
        padding-bottom: 0;
    }

    /* Title */
    .title {
        padding: 9px;
        opacity: .6;
        border-bottom: 1px solid var(--theme-dividers);
    }

    /* Title with searchbar */
    .title[searchbar = true] {
        padding: 9px 9px 0 9px;
        border-bottom: 0;
    }

    /* Loader container */
    .loader-container {
        position: relative;
        min-height: 48px;
    }

</style>