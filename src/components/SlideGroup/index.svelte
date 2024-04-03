<script>

    import { mdiChevronLeft, mdiChevronRight } from '@mdi/js';
    import Icon from '../Icon/index.svelte';
    import { getBackground, getBackgroundCode, getColor, theme } from '../../store/theme';
    import { onDestroy, onMount } from 'svelte';
    import { Ripple } from 'svelte-materialify/src';
  import Button from '../Form/Button.svelte';
  import { slide } from 'svelte/transition';

    // Theme handler
    let _theme = "light";
    const unsubscribeTheme = theme.subscribe(val => _theme = val);

    export let items = [];
    export let padding = "6px";
    export let itemPadding = "0 6px 0 0";
    export let variant = false;

    // Scroll list reference
    let scrollListRef;

    // Max scroll position
    let maxScrollPosition;

    // Scroll position
    let scrollPosition = 0;

    // Resize observer
    let resizeObserver;

    // On component mount
    onMount(() => {

        // Observer handler
        resizeObserver = new ResizeObserver( updateScrollStatus );

        // Start observer
        resizeObserver.observe( scrollListRef );

    });

    // On component destroy
    onDestroy(() => {

        // Disconnect observer
        resizeObserver?.disconnect?.();

        // Unsubscribe to theme update
        unsubscribeTheme();

    });

    // Update scroll status
    function updateScrollStatus() {

        // Update max scroll position
        maxScrollPosition = scrollListRef.scrollWidth - scrollListRef.clientWidth - 30;

        // Update scroll position
        scrollPosition = scrollListRef.scrollLeft;

    }

    // Scroll slide group
    function scroll(distance) {

        // Scroll the slide group smooth
        scrollListRef.scrollBy({
            left: distance,
            behavior: 'smooth'
        });

    }

</script>

<!-- Main container -->
<main style="--color: {variant ? getBackgroundCode(_theme) : getColor(_theme)}">

    <!-- Check if scroll position is different then 0 -->
    {#if scrollPosition > 0}
    
        <!-- Backward button container -->
        <div class="backward button-container" transition:slide|local={{ axis: "x", delay: 300 }}>
    
            <!-- Button -->
            <Button icon on:click={() => scroll( -scrollListRef.clientWidth )}>
                <Icon path={mdiChevronLeft} />
            </Button>
    
        </div>

    {/if}

    <!-- List -->
    <div class="list" style="padding: {padding}" bind:this={scrollListRef} on:scroll={updateScrollStatus}>

        <!-- Default slot -->
        <slot />

        <!-- Iterate over items -->
        {#each items as item, i}

            <!-- Item container -->
            <div class="item-container" style="padding: {itemPadding};">

                <!-- Slot -->
                <slot name="slide-item" {item} {i}>

                    <!-- Default item -->
                    <div class="default-item">
                        {i}
                    </div>

                </slot>

            </div>

        {/each}

        <!-- Check slot -->
        {#if $$slots.append}

            <!-- Item container -->
            <div class="item-container" style="padding: {itemPadding};">

                <!-- Slot -->
                <slot name="append" />

            </div>

        {/if}

    </div>

    <!-- Check if scroll position is lower the max scroll position -->
    {#if scrollPosition < maxScrollPosition}
    
        <!-- Forward button container -->
        <div class="forward button-container" transition:slide|local={{ axis: "x", delay: 300}}>
        
            <!-- Button -->
            <Button icon on:click={() => scroll( scrollListRef.clientWidth )}>
                <Icon path={mdiChevronRight} />
            </Button>
    
        </div>

    {/if}

</main>

<style>

    /* Main container */
    main {
        position: relative;
        overflow: hidden;
        display: flex;
    }

    /* List */
    main > .list {
        flex: 1;
        height: auto;
        overflow-x: auto;
        overflow-y: hidden;
        white-space: nowrap;
        scrollbar-width: none;
    }

    /* List scrollbar */
    main .list::-webkit-scrollbar {
        display: none;
    }

    /* Item container */
    main > .list > .item-container {
        height: auto;
        display: inline-block;
    }

    /* Button container */
    .button-container {
        display: flex;
        align-items: center;
    }

    /* Backward button container */
    .backward {
        padding-right: 6px;
        border-right: 1px solid var(--theme-dividers) !important;
    }

    /* Forward button container */
    .forward {
        padding-left: 6px;
        border-left: 1px solid var(--theme-dividers) !important;
    }

    /* Default item */
    .default-item {
        padding: 3px 6px 3px 6px;
        border: 1px solid var(--theme-dividers) !important;
    }

</style>