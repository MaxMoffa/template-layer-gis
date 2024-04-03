<!-- Window -->
<svelte:window on:resize={resizeHandler} />

<script>
    import { createEventDispatcher, onDestroy } from "svelte";
    import { getBackground, getColor, getColorInverted, theme } from "../../store/theme";
    import { ClickOutside, Icon, Ripple } from "svelte-materialify/src";
    import { mdiMagnify } from "@mdi/js";
    import SearchList from "./SearchList.svelte";
    import { fly } from "svelte/transition";
    import { quintOut } from "svelte/easing";

    // Inside class info
    let klass = '';

    export { klass as class };
    export let placeholder = "Search";
    export let button = false;
    export let rounded = false;
    export let block = false;
    export let variant = false;
    export let query = "";
    export let url = "";
    export let method = "POST";
    export let getFormData = null;
    export let enablePageHandler = false;
    export let responseHandler = response => response.result;
    export let checkResponseCode = true;

    // Dispatcher
    const dispatch = createEventDispatcher();

    // Theme handler
    let _theme = "light";
    const unsubscribeTheme = theme.subscribe(val => _theme = val);

    // Is focused
    let isFocused = false;

    // Main container ref
    let mainContainerRef;

    // Show result list
    let showResultList = false;

    // Search list reference
    let searchListRef;

    // Search bar ref
    let searchBarRef;

    // On component destroy
    onDestroy(() => {

        // Unsubscribe to theme update
        unsubscribeTheme();

    });

    // On input focuse
    function inputFocus() {

        // Set isFocused
        isFocused = true;

        // Show result list
        showResultList = true;

        // Dispatch event
        dispatch("focus");

    }

    // On input blur
    function inputBlur() {

        // Unset isFocused
        isFocused = false;

        // Dispatch event
        dispatch("blur");

    }

    // Get style from main container for searchbar
    function getStyleFromSearchBar(ref) {

        // Check reference value
        if(!ref)
            return "";

        // Get bounding rect
        let br = ref.getBoundingClientRect();

        // Get required dimensions
        let { width, left, bottom } = br;

        // Return style
        return `width: ${width}px; left: ${left}px; top: ${bottom + 6}px`;

    }

    // Handle window resize
    function resizeHandler() {

        // Hide list
        showResultList = false;

    }

    // Select first element
    function selectFirst(e) {

        // Check code list
        if(e?.code === "Enter") {

            // Hide search result list
            showResultList = false;

            // Blur search bar
            searchBarRef?.blur?.();

            // Dispatch value or just event
            dispatch("enter", searchListRef.getItem( 0 ));

        }

    }

</script>

<!-- Main container -->
<main class="{klass}" {block} bind:this={mainContainerRef} use:ClickOutside on:clickOutside={() => showResultList = false }>

    <!-- Searchbar -->
    <div class="search-bar" {rounded} {isFocused}>

        <!-- Switch between button and text input -->
        {#if button}

            <!-- Content -->
            <button class="content {variant ? getBackground(_theme) : getColor(_theme)}" use:Ripple={{ class: "primary-color" }} on:focus={inputFocus} on:blur={inputBlur} on:click>

                <!-- Icon -->
                <div class="icon">
                    <Icon path={mdiMagnify} class={isFocused ? "primary-text" : ""} />
                </div>

                <!-- Fake input -->
                <div class="fake-input" withContent={query !== ""}>
                    {query || placeholder}
                </div>

                <!-- Append -->
                <div class="append">
                    <slot name="append" focus={isFocused} />
                </div>

            </button>
            
        {:else}

            <!-- Content -->
            <div class="content {variant ? getBackground(_theme) : getColor(_theme)}" use:Ripple={{ class: "primary-color" }}>

                <!-- Icon -->
                <div class="icon">
                    <Icon path={mdiMagnify} class={isFocused ? "primary-text" : ""} />
                </div>

                <!-- Input -->
                <input
                    class="input {getColorInverted(_theme)}-text"
                    type="text" 
                    placeholder={placeholder} 
                    bind:this={searchBarRef}
                    bind:value={query}
                    on:change
                    on:input
                    on:focus={inputFocus}
                    on:blur={inputBlur}
                    on:keydown
                    on:keypress
                    on:keyup
                    on:keypress={selectFirst}
                />

                <!-- Append -->
                <div class="append">
                    <slot name="append" focus={isFocused} />
                </div>

            </div>

        {/if}

    </div>

    <!-- Check if result list should be visible -->
    {#if query !== "" && url && showResultList && !button}

        <!-- Query update handler -->
        {#key query}

            <!-- Result list -->
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <div class="result-list elevation-1 {getColor(_theme)}" style={getStyleFromSearchBar( mainContainerRef )} on:click={() => showResultList = false } in:fly={{ delay: 0, duration: 300, x: 0, y: -20, opacity: 0, easing: quintOut }}>

                <!-- Search list -->
                <SearchList
                    bind:this={searchListRef}
                    {url}
                    {method}
                    getFormData={() => {

                        // Check get form data
                        if(typeof(getFormData) === "function")
                            return getFormData( query );

                        // Fallback
                        return null;

                    }}
                    {enablePageHandler}
                    {responseHandler}
                    {checkResponseCode}
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

                </SearchList>

            </div>
            
        {/key}

    {/if}

</main>



<style>

    /* Main container */
    main {
        width: 100%;
        max-width: 400px;
    }

    /* Main container, block */
    main[block = true] {
        max-width: 100%;
    }

    /* Search bar */
    main > .search-bar {
        position: relative;
        height: 48px;
        width: 100%;
        border: 1px solid var(--theme-dividers) !important;
        border-radius: 6px;
        overflow: hidden;
        transition: .2s ease all;
    }

    /* Search bar, rounded */
    main > .search-bar[rounded = true] {
        border-radius: 64px;
    }

    /* Search bar, is focused */
    main > .search-bar[isFocused = true] {
        border: 1px solid var(--primary) !important;
    }

    /* Content */
    main > .search-bar > .content {
        display: flex;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        padding: 0 16px;
        cursor: text;
        outline: 0;
    }

    /* Content childs */
    main > .search-bar > .content > * {
        height: 100%;
    }

    /* Search bar icon */
    main > .search-bar > .content > .icon {
        display: grid;
        place-items: center;
        margin-right: 16px;
    }

    /* Search bar input */
    main > .search-bar > .content .input {
        flex: 1;
        outline: 0;
        font-size: 16px;
    }

    /* Search bar, fake input */
    main > .search-bar > .content > .fake-input {
        flex: 1;
        outline: 0;
        font-size: 16px;
        display: flex;
        align-items: center;
        user-select: none;
        opacity: .7;
    }

    /* Search bar, fake input with content */
    main > .search-bar > .content > .fake-input[withContent = true] {
        opacity: 1;
    }

    /* Search bar append */
    main > .search-bar > .content > .append {
        display: grid;
        place-items: center;
        margin-left: 16px;
    }

    /* Result list */
    .result-list {
        position: fixed;
        z-index: 10000;
        border-radius: 6px;
        overflow: hidden;
        border: 1px solid var(--theme-dividers) !important;
    }

</style>