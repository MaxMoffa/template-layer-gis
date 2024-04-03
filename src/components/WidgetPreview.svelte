<script>
    import { Ripple } from "svelte-materialify/src";
    import { getColor, theme } from "../store/theme";
    import { createEventDispatcher, onDestroy, onMount } from "svelte";

    export let w = 1;
    export let h = 1;
    export let disableClickableLayer = false;

    // Dispatch handler
    const dispatch = createEventDispatcher();

    // Theme handler
    let _theme = "light";
    let unsubscribeTheme = theme.subscribe(val => _theme = val);

    // Widget preview height
    let height = "300px";

    // Widget preview width
    let widgetPreviewWidth;

    // On widget preview mount
    onMount(() => {

        // Update height
        updateHeight();

    })

    // On widget preview destroy
    onDestroy(() => {

        // Unsubscribe to theme update
        unsubscribeTheme();

    });

    // Update widget preview height
    function updateHeight() {

        // Check if are equals
        if(w === h)
            height = widgetPreviewWidth;

        // Check if is portrait 
        else if(w < h)
            height = widgetPreviewWidth * 1.2;

        // Check if is landscape
        else if(w > h)
            height = widgetPreviewWidth / 1.2;

    }

    // Convert height in css compatible values
    function getNumberCSS(value) {

        // Check if is string
        if(typeof(value) === "number")
            return value + "px";

        // Return value fallback
        return value;

    }

</script>

<!-- Main widget preview -->
<main class="{getColor(_theme)}" style="--height: {getNumberCSS(height)};" bind:clientWidth={widgetPreviewWidth}>

    <!-- Widget slot -->
    <slot>

        <!-- Fallback container -->
        <div class="fallback-container">
            Widget content
        </div>

    </slot>

    <!-- Handle disable clickable layer -->
    {#if !disableClickableLayer}
    
        <!-- Clickable cover -->
        <button 
            class="cover" 
            use:Ripple={{ color: "teal" }} 
            on:click 
            on:contextmenu={e => {
                
                // Dispatch event
                dispatch("longClick", e);

            }}
        />

    {/if}

</main>

<style>

    /* Main widget preview */
    main {
        position: relative;
        height: var(--height);
        display: flex;
        overflow: hidden;
        border-radius: var(--card-radius);
        border: 1px solid var(--theme-dividers) !important;
    }

    /* Fallback container */
    main > .fallback-container {
        flex: 1;
        display: grid;
        place-items: center;
    }

    /* Cover */
    main > .cover {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }

</style>