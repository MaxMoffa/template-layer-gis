<script>
    import { createEventDispatcher } from "svelte";
    import { fade } from "svelte/transition";

    export let active = true;
    export let absolute = false;
    export let opacity = .3;
    export let duration = 200;
    export let disableClose = false;

    // Dispatcher
    const dispatch = createEventDispatcher();

    // Close overlay
    function closeOverlay() {

        // Check if should close
        if(disableClose)
            return;

        // Close overlay
        active = false;

        // Dispatch close event
        dispatch("close");

    }

    // Close overlay with escape key
    function closeWithKey(e) {

        // Check if key is escape
        if(e.code === "Escape")
            closeOverlay();

    }

</script>

<!-- Check if overlay should be active -->
{#if active}

    <!-- Overlay container -->
    <main class="overlay_main_container" transition:fade="{{delay: 0, duration: duration}}" {absolute}>

        <!-- Background -->
        <div 
            class="background black" 
            style="opacity: {opacity}"
            on:click={closeOverlay}
            on:keypress={closeWithKey}
        />

        <!-- Content -->
        <slot class="test">
            Niente qui
        </slot>

    </main>

{/if}

<style>

    /* Overlay container */
    main {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 100000;
        display: grid;
        place-items: center;
    }

    /* Overlay container ABSOLUTE */
    main[absolute = true] {
        position: absolute;
    }

    /* Overlay background */
    main > .background {
        position: absolute;
        width: 100%;
        height: 100%;
        pointer-events: all;
        z-index: 0 !important;
    }

    /* Slot */
    :global(.overlay_main_container > *) {
        z-index: 16;
        pointer-events: all;
    }

</style>