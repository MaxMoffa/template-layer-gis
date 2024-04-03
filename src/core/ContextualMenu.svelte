<script>

    // Imports
    import { ClickOutside, Icon, List, ListItem } from "svelte-materialify/src";
    import { theme, getColorInverted, getColor } from '../store/theme';
    import { onDestroy } from "svelte";
	import { fade } from 'svelte/transition';

    /*
        EXPECTED PROPS
        --------------
        context, Object -> Es: { context: OPTIONS_RELATED_CONTEXT, event: CONTEXTUAL_MENU_OPENINIG_EVENT }
        options, Array -> Es: [ { name: OPTION_NAME, callback: OPTION_ASSOCIATED_FUNCTION } ]
        title, String -> Es: "MENU_TITLE"
        absolute, Boolean -> Es: True / False
        padding, Object -> { top: TOP_PADDING, left: LEFT_PADDING, right: RIGHT_PADDING, bottom: BOTTOM_PADDING }
        width, String -> "auto", "200px"
    */

    // Props
    export let context = true;
    export let options = null;
    export let title = null;
    export let centered = false;
    export let backgroundOpacity = 0;
    export let padding = 6;
    export let screenPadding = null;
    export let width = "auto";
    export let elevation = 1;
    export let dense = false;
    export let absolute = false;

    // Contstans
    const FADE_TRANSITION = { delay: 0, duration: 100 };

    // Theme color
    let _theme = "light";
    let unsubscribeTheme = theme.subscribe(val => _theme = val);

    // Contextual menu dimensions
    let _width, _height;

    // On element destroy
    onDestroy(() => {

        // Unsubscribe to theme update
        unsubscribeTheme();

    });

    // Get menu position
    function getMenuPosition(context, centered) {

        // Check if position must be centered
        if(centered || !context?.event)
            return "";

        // Get position
        let pos = getPosition(context?.event, _width, _height, padding, screenPadding);

        // Set position based on click context
        return `position: fixed; top: ${pos.y}px; left: ${pos.x}px`;

    }

    // Close contextual menu
    function closeContextualMenu() {
        context = null;
    }

    // Get position for context menu
    function getPosition(e, width, height, padding=6, screenPadding=null) {
        let posx = 0;
        let posy = 0;

        if (!e)
            e = window.event;
        
        if (e.pageX || e.pageY) {
            posx = e.pageX;
            posy = e.pageY;
        } else if (e.clientX || e.clientY) {
            posx = e.clientX + container.scrollLeft;
            posy = e.clientY + container.scrollTop;
        }

        let pos = {
            x: posx,
            y: posy
        };

        // Check if out of screen on X
        if(pos.x <= 0)
            pos.x = padding;
        else if(pos.x >= document.body.clientWidth - width - padding)
            pos.x = document.body.clientWidth - width - padding;

        // Check if out of screen on Y
        if(pos.y <= 0)
            pos.y = padding;
        else if(pos.y >= document.body.clientHeight - height - padding)
            pos.y = document.body.clientHeight - height - padding;

        // Add screen padding if present
        if(typeof(screenPadding?.top) === "number")
            pos.y -= screenPadding.top;
        if(typeof(screenPadding?.left) === "number")
            pos.x -= screenPadding.left;
        if(typeof(screenPadding?.right) === "number")
            pos.x += screenPadding.right;
        if(typeof(screenPadding?.bottom) === "number")
            pos.y += screenPadding.bottom;

        return pos;
    }

</script>

<!-- Check if menu is open -->
{#if context}

    <!-- Overlay -->
    <main transition:fade={FADE_TRANSITION} {absolute}>

        <!-- Background -->
        <div class="background {getColorInverted(_theme)}" style="opacity: {context?.backgroundOpacity || backgroundOpacity};"></div>

        <!-- Contextual menu -->
        <div class="contextual-menu {getColor(_theme)} rounded elevation-{context?.elevation || elevation}" style="min-width: {width}; {getMenuPosition(context, centered)}" use:ClickOutside on:clickOutside={closeContextualMenu} bind:clientWidth={_width} bind:clientHeight={_height}>
            
            <!-- Menu title -->
            {#if context?.title || title}
                <div class="text-caption grey-text {_theme === "light" ? "text-darken-2" : "text-lighten-1"} pt-3 pl-3 pr-3">
                    {context?.title || title}
                </div>
            {/if}

            <!-- Options -->
            <List>

                <!-- Check if options is a valid array -->
                {#if (context?.options && Array.isArray(context?.options)) || (options && Array.isArray(options))}

                    <!-- Each block over options -->
                    {#each (context?.options || options) as option}
                    
                        {#if !option?.hide}
                        
                            <!-- Option -->
                            <ListItem disabled={option?.disabled} dense={option?.dense || dense} class={option?.class || ""} on:click={() => {

                                // Call callback
                                option?.callback();

                                // Close menu
                                closeContextualMenu();

                            }}>

                                <!-- Icon slot -->
                                <span slot="prepend">
                                    
                                    <!-- Check if icon is provided -->
                                    {#if option?.icon}
                                    
                                        <!-- Icon -->
                                        <Icon path={option?.icon} />

                                    {/if}

                                </span>

                                <!-- Name -->
                                {option?.name}

                            </ListItem>

                        {/if}

                    {/each}

                {:else}
                
                    <!-- Fallback option -->
                    <ListItem dense on:click={closeContextualMenu}>
                        Close
                    </ListItem>

                {/if}

            </List>

        </div>

    </main>

{/if}

<style>

    /* Main element */
    main {
        position: fixed; 
        top: 0;
        left: 0; 
        width: 100vw;
        height: 100vh;
        z-index: 100;
        display: grid;
        place-items: center;
        overflow: hidden;
    }

    /* Main element absolute */
    main[absolute = true] {
        position: absolute;
        width: 100%;
        height: 100%;
    }

    /* Background */
    main > .background {
        position: absolute; 
        top: 0;
        left: 0; 
        width: 100%;
        height: 100%;
        z-index: 1;
        overflow: hidden;
    }

    /* Contextual menu */
    main > .contextual-menu {
        width: auto;
        z-index: 2;
    }

    /* Contextual menu title */
    main > .contextual-menu > .text-caption {
        user-select: none;
    }

</style>