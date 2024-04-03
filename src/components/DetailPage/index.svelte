<script>

    // Imports
    import { createEventDispatcher, onDestroy } from "svelte";
    import { getBackground, getColor, theme } from "../../store/theme";
    import ListItem from "../List/ListItem.svelte";
    import Button from "../Form/Button.svelte";
    import Icon from "../Icon";
    import { mdiClose, mdiFloppy, mdiUndo } from "@mdi/js";
    import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

    export let active = true;
    export let title = "Example";
    export let saveInfo = "";
    export let errorInfo = "";
    export let showTopBar = true;
    export let showBottomBar = false;
    export let showSave = true;
    export let showUndo = true;
    export let disableSaveButton = false;
    export let variant = false;

    $: active, sendDispatcher();

    // Dispatcher
    const dispatch = createEventDispatcher();

    // Theme handler
    let _theme = "light";
    const unsubscribeTheme = theme.subscribe(val => _theme = val);

    // On page destroy
    onDestroy(() => {

        // Unsubcribe to theme updates
        unsubscribeTheme();

    });

    // Close page
    function closePage() {

        // Close page
        active = false;

    }

    // Save page
    function savePage() {

        // Dispatch save
        dispatch("save");

        // Close page
        closePage();

    }

    // Undo action
    function undoAction() {

        // Dispatch undo
        dispatch("undo");

    }

    // Send close dispatch
    function sendDispatcher() {

        // Check if is not active
        if(!active) {

            // Dispatch close
            dispatch("close");

        }

    }

</script>

<!-- Check if is active -->
{#if active}

    <!-- Main container -->
    <main class="{variant ? getBackground(_theme) : getColor(_theme)}">

        <!-- Check if should show top bar -->
        {#if showTopBar}
        
            <!-- Top bar -->
            <ListItem static>

                <!-- Back action container -->
                <svelte:fragment slot="prepend">

                    <!-- Action -->
                    <Button icon on:click={closePage}>
                        <Icon path={mdiClose} />
                    </Button>

                </svelte:fragment>

                <!-- Append action container -->
                <svelte:fragment slot="append">

                    <!-- Append slot -->
                    <slot name="append" />

                </svelte:fragment>

                <!-- Title -->
                {title}
                
            </ListItem>

        {/if}

        <!-- Slot top bar -->
        <slot name="top-bar" />

        <!-- Content -->
        <div class="content">

            <!-- Default slot -->
            <slot />

        </div>

        <!-- Check if should show bottom bar -->
        {#if showBottomBar}

            <!-- Bottom bar container -->
            <div transition:fly|local={{ delay: 0, duration: 300, x: 0, y: 300, opacity: 1, easing: quintOut }}>

                <!-- Bottom bar -->
                <ListItem static>

                    <!-- Check if save info is provided -->
                    {#if saveInfo}
                    
                        <!-- Save info -->
                        <span>
                            {saveInfo}
                        </span>

                    {/if}

                    <!-- Check if error info is provided -->
                    {#if errorInfo}
                    
                        <!-- Error info -->
                        <span class="red-text">
                            {errorInfo}
                        </span>

                    {/if}

                    <!-- Back action container -->
                    <svelte:fragment slot="append">

                        <!-- Check if undo action is enabled -->
                        {#if showUndo}
                        
                            <!-- Undo action -->
                            <Button icon on:click={undoAction}>
                                <Icon path={mdiUndo} />
                            </Button>

                        {/if}

                        <!-- Check if save action is enabled -->
                        {#if showSave}
                            
                            <!-- Save action -->
                            <Button class="primary-color white-text" on:click={savePage} disabled={disableSaveButton}>
                                Salva
                                <Icon path={mdiFloppy} size={18} />
                            </Button>

                        {/if}

                    </svelte:fragment>
                    
                </ListItem>

            </div>



        {/if}

    </main>
    
{/if}

<style>

    /* Main container */
    main {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
    }

    /* Content */
    .content {
        flex: 1;
        border-top: 1px solid var(--theme-dividers);
        border-bottom: 1px solid var(--theme-dividers);
        overflow-y: auto;
        overflow-x: hidden;
    }

</style>