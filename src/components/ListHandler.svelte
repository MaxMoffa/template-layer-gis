<script>
    import { onDestroy } from "svelte";    
    import { theme } from "../store/theme";
    import { sendNotification } from "../store/notification";
    import { Intersect, ProgressCircular } from "svelte-materialify/src";
    import { dictionary, getDictionary } from "../store/dictionary";

    export let url = "";
    export let method = "POST";
    export let getFormData = () => new FormData();
    export let enablePageHandler = false;
    export let padding = 1;
    export let itemsPadding = 0;
    export let responseHandler = response => response.result;
    export let grid = false;
    export let cols = 4;
    export let gap = 0;
    export let autoHeight = false;
    export let checkResponseCode = true;
    export let hideScrollbar = false;
    export function getItem (i) { return list?.[i] };

    // Theme handler
    let _theme = "light";
    const unsubscribeTheme = theme.subscribe(val => _theme = val);

    // Dictionary handler
    let dict = null;
    const unsubscribeDictionary = dictionary.subscribe(val => dict = getDictionary( val ));

    // Page number
    let page = 1;

    // Items list
    let list = [];

    // Check if is last page
    let isLastPage = false;

    // On list destroy
    onDestroy(() => {

        // Unsubscribe theme handler
        unsubscribeTheme();

        // Unsubscribe to dictionary update
        unsubscribeDictionary();

    });

    // Get list
    async function getList(page) {

        // Check page and reset list
        if(page === 1)
            list = [];

        // Get params
        let p = getFormData();

        // Check if page handler is enabled
        if(enablePageHandler) {

            // Add page to params
            p.append("pagina", page);

        }

        // Get data
        let response = await ( await fetch(url, { method, body: p })).json();

        // Check response code
        if(response?.response_code !== 200 && checkResponseCode)
            throw Error(response.message);

        // Update isLastPage
        isLastPage = response?.pagine_totali <= response?.pagina_corrente;

        // console.log({ isLastPage, pagine_totali: response?.pagine_totali, pagine_correnti: response?.pagina_corrente});

        // Update list
        list = [...list, ...responseHandler(response)];

        return;

    }

    // Go to next page
    function nextPage() {

        // Update page number
        page = page + 1;

        // Get new page
        getList( page )
        .catch(e => {

            // Log error
            console.error(e);

            // Send notification
            sendNotification(e.message, 3000, "error");

        });

    }

</script>

<!-- Handle url changes -->
{#key url}

    <!-- Main list container -->
    <main {autoHeight} {hideScrollbar} style="--cols: {cols};">

        <!-- List -->
        <div class="list" {autoHeight}>

            <!-- Async download -->
            {#await getList(1)}

                <!-- Info container -->
                <div class="info-container" {autoHeight}>

                    <!-- Slot for empty list -->
                    <slot name="loading-list">

                        <!-- Info content -->
                        <div class="info-content">

                            <!-- Icon container -->
                            <div class="icon-container">
                                <ProgressCircular indeterminate color="primary"/>
                            </div>

                            <!-- Text container -->
                            <div class="text-container">
                                <slot name="loading-list-text" />
                            </div>

                        </div>

                    </slot>

                </div>
                
            {:then result}
            
                <!-- Check list length -->
                {#if list.length > 0}

                    <!-- List padding -->
                    <div class="grid-element pa-{padding}" {grid} style="gap: {gap * 3}px; overflow: hidden" {autoHeight}>

                        <!-- Iterate over list -->
                        {#each list as item, i}

                            <!-- List item container -->
                            <div class="pb-{itemsPadding}" style="overflow: hidden;">

                                <!-- Slot for custom list-item -->
                                <slot name="list-item" {item} {i} length={list.length}>
                                
                                    <!-- Fallback item -->
                                    <div class="text-center pa-3">
                                        {i}
                                    </div>

                                </slot>

                            </div>

                        {/each}

                    </div>

                    <!-- Check if page handler is enabled -->
                    {#if enablePageHandler && !isLastPage}
                    
                        <!-- Loading item -->
                        <div class="d-flex align-center justify-center pa-3" use:Intersect on:intersect={nextPage}>

                            <!-- Progress circular -->
                            <ProgressCircular indeterminate color="primary"/>

                        </div>

                    {/if}

                {:else}
                
                    <!-- Info container -->
                    <div class="info-container">

                        <!-- Slot for empty list -->
                        <slot name="empty-list">

                            <!-- Info content -->
                            <div class="info-content">

                                <!-- Text container -->
                                <div class="text-container">
                                    {dict?.getString("emptyListDescription")}
                                </div>

                            </div>

                        </slot>

                    </div>

                {/if}

            {:catch e}

                <!-- Info container -->
                <div class="info-container">

                    <!-- Slot for error -->
                    <slot name="error-list">

                        <!-- Info content -->
                        <div class="info-content">

                            <!-- Icon container -->
                            <div class="icon-container">
                                ⚠️
                            </div>

                            <!-- Text container -->
                            <div class="text-container">
                                {e.message}
                            </div>

                        </div>

                    </slot>

                </div>

            {/await}

        </div>

        <!-- Default slot -->
        <slot {list} />

    </main>

{/key}

<style>

    /* Main list container */
    main {
        position: relative;
        flex: 1;
        width: 100%;
        height: 100%;
        overflow: hidden;
        container-type: size;
    }

    /* Main autoHeight */
    main[autoHeight = true] {
        height: auto;
        overflow: visible;
    }

    /* List */
    main > .list {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        overflow-x: hidden;
        overflow-y: auto;
    }

    /* List HIDE SCROLLBAR FIREFOX */
    main[hideScrollbar = true] > .list {
        scrollbar-width: none;
    }

    /* List HIDE SCROLLBAR CHROME */
    main[hideScrollbar = true] > .list::-webkit-scrollbar {
        display: none;
    }
    
    /* Info container */
    .info-container {
        position: absolute;
        left: 0;
        right: 0;
        width: 100%;
        height: 100%;
        display: grid;
        place-items: center;
        user-select: none;
    }

    /* Auto height */
    main > .list[autoHeight = true], .info-container[autoHeight = true] {
        overflow: unset;
        height: auto;
    }

    /* Info content icon */
    .info-container > .info-content > .icon-container {
        display: grid;
        place-items: center;
        padding: 16px 0;
        font-size: 64px;
    }

    /* Info content text */
    .info-container > .info-content > .text-container {
        font-family: 'Poppins';
        font-size: 1.2rem;
        padding: 6px;
        text-align: center;
    }

    /* Grid element */
    .grid-element[grid = true] {
        display: grid;
        grid-template-columns: repeat(var(--cols), 1fr);
    }

    /* Media queries, 2 cols */
    @container (max-width: 1200px) {
    
        /* Grid element */
        .grid-element[grid = true] {
            grid-template-columns: repeat(2, 1fr);
        }

    }

    /* Media queries, 1 col */
    @container (max-width: 600px) {
    
        /* Grid element */
        .grid-element[grid = true] {
            grid-template-columns: repeat(1, 1fr);
        }

    }

</style>