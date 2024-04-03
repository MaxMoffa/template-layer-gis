
<!-- Window object -->
<svelte:window on:resize={closeDialog} bind:innerWidth={bodyWidth} />

<script>

    import { onDestroy } from "svelte";
    import { getBackground, getBackgroundCode, theme } from "../../store/theme";
    import Overlay from "../Overlay.svelte";
    import { StatusBar } from "../StatusBar";

    // Theme handler
    let _theme = "light";
    const unsubscribeTheme = theme.subscribe(val => _theme = val);

    // Window padding
    const PADDING = 16;

    // Reference item padding
    const REFERENCE_PADDING = 6;

    export let active = true;
    export let ref = null;
    export let width = 300;
    export let duration = 100;
    export let absolute = false;

    // Context menu reference
    let contextMenuReference;

    // Parent ref
    let parentRef;

    // Body width
    let bodyWidth;

    // On component destroy
    onDestroy(() => {

        // Unsubscribe to theme update
        unsubscribeTheme();

    });

    // Get position style for card
    function getPositionStyle(ref, parentRef) {

        // Check position
        if(!ref && (absolute && !parentRef))
            return;

        // Get button reference bounding client rect
        let refPos = ref.getBoundingClientRect();

        // Get parent width
        let parentWidth = document.body.clientWidth;

        // Init reference mounting point
        let mountingPoint = {
            x: refPos.x + (refPos.width / 2),
            y: refPos.y
        };

        // Check if is absolute
        if(absolute && parentRef) {

            // Get button reference bounding client rect
            let parentRect = parentRef.parentElement.getBoundingClientRect();

            // Update parent width
            parentWidth = parentRect.width;

            // Update mounting point x
            mountingPoint.x = mountingPoint.x - parentRect.x;

            // Update mounting point y
            mountingPoint.y = mountingPoint.y - parentRect.y;

        }

        console.log(1, mountingPoint.x);

        // Get left position
        let resultX = mountingPoint.x - (width / 2);

        // Get right position
        let resultY = mountingPoint.y + REFERENCE_PADDING;

        console.log(2, resultX);

        // Check x is smaller then padding
        if(resultX < PADDING)
            resultX = PADDING;

        // Check y is smaller then padding
        if(resultY < PADDING)
            resultY = PADDING;

        // Check x is greater then padding
        if(resultX > parentWidth - PADDING - width)
            resultX = parentWidth - PADDING - width;
        
        // Return
        return `left: ${resultX}px; top: ${resultY}px;`;

    }

    // Close dialog
    function closeDialog() {

        // Hide dialog
        active = false;

    }

</script>

<!-- Overlay -->
<Overlay opacity={.3} bind:active {duration} {absolute}>
    
    <!-- Status bar -->
    <StatusBar color={getBackgroundCode( _theme )} />

    <!-- Card -->
    <div 
        bind:this={contextMenuReference} 
        class="card {getBackground(_theme)}" 
        style="{getPositionStyle(ref, parentRef)} --width: {width}px;" 
        fullscreen={(width + (PADDING * 2)) > bodyWidth || bodyWidth < 600}    
    >

        <!-- Check if there is something in the default slot -->
        {#if $$slots?.default}

            <!-- Content -->
            <div class="content">
                
                <!-- Default slot -->
                <slot />

            </div>

        {/if}

        <!-- Check if there is something in the actions slot -->
        {#if $$slots?.actions}

            <!-- Content -->
            <div class="actions">
                
                <!-- Action slot -->
                <slot name="actions" />

            </div>

        {/if}

    </div>

</Overlay>

<!-- Parent ref -->
<span bind:this={parentRef} />

<style>

    /* Card */
    .card {
        position: absolute;
        width: 100%;
        max-width: var(--width);
        height: auto;
        border-radius: var(--card-radius);
        border: 1px solid var(--theme-dividers) !important;
        overflow: hidden;
    }

    /* Card fullscreen */
    .card[fullscreen = true] {
        width: 100%;
        max-width: 100%;
        max-height: 100%;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        overflow-y: auto;
        border-radius: 0 0 var(--card-radius) var(--card-radius);
        border-top: 0 !important;
    }

    /* Content */
    .card > .content {
        position: relative;
    }

    /* Actions */
    .card > .actions {
        border-top: 1px solid var(--theme-dividers);
        padding: 6px;
        display: flex;
        flex-direction: row-reverse;
    }

</style>