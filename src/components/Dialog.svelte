<script>
    import { onDestroy } from "svelte";
    import Overlay from "./Overlay.svelte";
    import { getBackground, theme } from "../store/theme";
    import { fly } from "svelte/transition";
    import { quintOut } from "svelte/easing";
    // import StatusBar from "./StatusBar";

    export let active;
    export let disableClose;
    export let absolute;
    export let padding = "16px";
    export let radius = "9px";
    export let maxWidth = "400px";
    export let disableContentPadding = false;
    // export let disabledStatusBarColor = false;

    // Theme handler
    let _theme = "light";
    const unsubscribeTheme = theme.subscribe(val => _theme = val);

    // On dialog destroy
    onDestroy(() => {

        // Unsubscribe to theme update
        unsubscribeTheme();

    });

</script>

<!-- Overlay -->
<Overlay bind:active {disableClose} {absolute} on:close>

    <!-- Check if status bar color is disabled -->
    <!-- {#if !disabledStatusBarColor} -->
    
        <!-- Status bar color -->
        <!-- <StatusBar /> -->

    <!-- {/if} -->

    <!-- Dialog -->
    <div class="dialog {getBackground(_theme)} elevation-1" style="--padding: {padding}; --radius: {radius}; --max-width: {maxWidth};" transition:fly|local={{ delay: 0, duration: 300, x: 0, y: 200, opacity: 0, easing: quintOut }}>

        <!-- Check if icon is provided -->
        {#if $$slots?.icon}
        
            <!-- Icon container -->
            <div class="icon-container">

                <!-- Icon slot -->
                <slot name="icon" />

            </div>

        {/if}

        <!-- Check if title is provided -->
        {#if $$slots?.title}
    
            <!-- Title container -->
            <div class="title-container">

                <!-- Title slot -->
                <slot name="title" />

            </div>

        {/if}


        <!-- Check if description is provided -->
        {#if $$slots?.description}
    
            <!-- Description container -->
            <div class="description-container">

                <!-- Description slot -->
                <slot name="description" />

            </div>

        {/if}

        <!-- Check if default is provided -->
        {#if $$slots?.default}
        
            <!-- Content container -->
            <div class="content-container" style={disableContentPadding ? "padding: 0 !important;" : ""}>

                <!-- Content slot -->
                <slot />

            </div>

        {/if}

        <!-- Check if actions is provided -->
        {#if $$slots?.actions}
    
            <!-- Actions container -->
            <div class="actions-container">

                <!-- Actions slot -->
                <slot name="actions" />

            </div>

        {/if}

        <!-- Check if bottom is provided -->
        {#if $$slots?.bottom}

            <!-- Bottom container -->
            <div class="bottom-container">

                <!-- Bottom slot -->
                <slot name="bottom" />

            </div>

        {/if}

    </div>

</Overlay>

<style>

    /* Dialog */
    .dialog {
        width: 90%;
        max-width: var(--max-width);
        border-radius: var(--radius);
        padding: var(--padding);
    }

    /* Dialog icon container */
    .dialog > .icon-container {
        display: grid;
        place-items: center;
        padding-bottom: 16px;
    }

    /* Dialog title container */
    .dialog > .title-container {
        text-align: center;
        font-size: 24px;
        font-weight: 400;
        opacity: .8;
        padding-bottom: 16px;
    }

    /* Dialog description container */
    .dialog > .description-container {
        font-size: 14px;
        opacity: .8;
    }

    /* Dialog content container */
    .dialog > .content-container {
        font-size: 14px;
        opacity: .8;
        padding-top: 32px;
    }

    /* Dialog actions container */
    .dialog > .actions-container {
        display: flex;
        justify-content: end;
        padding-top: 32px;
    }

    /* Dialog bottom container */
    .dialog > .bottom-container {
        padding-top: 6px;
    }

</style>