<script>
    import { mdiArrowLeft, mdiArrowRight, mdiMagnify } from "@mdi/js";
    import { onDestroy, createEventDispatcher } from "svelte";
    import { Button, Chip, Icon, List, ListItem, ProgressLinear } from "svelte-materialify/src";
    import { quintOut } from "svelte/easing";
    import { fly, slide } from "svelte/transition";
    import { theme, getBackground, getBackgroundCode } from "../store/theme";
    import Overlay from "./Overlay.svelte";
    import { StatusBarColor, setStatusBarColor } from "../store/system";

    export let active = false;
    export let placeholder = "Cerca";
    export let getOptions = async () => [];
    export let closeOnSelect = true;
    export let showList = false;
    export let dense = false;
    export let disableRightArrow = false;

    // Handle active change
    $: active, handleActiveChange();

    // Theme handler
    let _theme = "light";
    const unsubscribeTheme = theme.subscribe(val => _theme = val);

    // StatusBar color handler
    let _statusBarColor = "#ffffff";
    const unsubscribeStatusBarColor = StatusBarColor.subscribe(val => _statusBarColor = val);

    // Dispatcher
    const dispatch = createEventDispatcher();

    // Query
    let q = "";

    // List suggestion
    let list = [];

    // List downloading status
    let isDownloading = false;

    // Error
    let error = null;

    // Textfield reference
    let textFieldRef;

    // Last statusbar color
    let lastStatusBarColor = null;

    // On searchbar destroy
    onDestroy(() => {

        // Unsubscribe to theme update
        unsubscribeTheme();

        // Unsubscribe statusbar color
        unsubscribeStatusBarColor();

    });

    // Handle focus
    function handleActiveChange() {

        // Check if popup is active
        if(!active){
            
            // Check if last status bar color is ready
            if(lastStatusBarColor) {

                // Reset statusbar color
                setStatusBarColor( lastStatusBarColor );

                // Reset last statusbar color
                lastStatusBarColor = null;

            }

            return;
        }

        // Update last statusbar color
        lastStatusBarColor = _statusBarColor;

        // Set new statusbar color
        setStatusBarColor( getBackgroundCode(_theme) );

        // Reset
        q = "";
        list = [];
        error = null;

        // Update list if required
        if(showList)
            updateList();

        // Timeout for animation
        setTimeout(() => {
            
            // Focus textfield
            textFieldRef?.focus();

        }, 300);

    }

    // On key press
    function keyPress(e) {

        // Prepare event
        e = e || window.event;

        // Check if is esc
        if(e.code === "Escape") {
            
            // Hide searchbar
            active = false;

            return;
        }

        // Check if enter
        if(e.code === "Enter" && Array.isArray(list) && list.length > 0) {

            // Select first element
            select( list[0] );

            return;

        }

        // Check query
        if(q === "" && !showList) {

            // Reset list
            list = [];

            return;
        }

        // Update list
        updateList();

    }

    // Trigger list update
    function updateList() {
        
        // Reset error
        error = null;

        // Show download bar
        isDownloading = true;

        // Download options
        getOptions(q)

        // Update list
        .then(result => list = result)

        // Catch error
        .catch(e => {

            // Log error
            console.log(e);
            
            // Show error info
            error = e.message;

        })

        // Hide download bar
        .finally(() => isDownloading = false);

    }

    // Select element
    function select(v) {

        // Send selection
        dispatch("select", v);

        // Close searchbar
        if(closeOnSelect)
            active = false;

    }

</script>

<!-- Overlay -->
<Overlay bind:active={active}>

    <!-- Container -->
    <main class="{getBackground(_theme)} rounded-lg elevation-1" transition:fly="{{delay: 0, duration: 300, x: 0, y: 500, opacity: 1, easing: quintOut}}">

        <!-- Searchbar -->
        <div class="searchbar">

            <!-- Close icon container -->
            <div class="close-container pl-1">

                <!-- Button -->
                <Button icon on:click={() => active = false}>

                    <!-- Icon -->
                    <Icon path={mdiArrowLeft} size={24} />
                
                </Button>

            </div>

            <!-- Textfield -->
            <div class="input-bar">

                <!-- Input -->
                <input
                    class="{_theme === "light" ? "black-text" : "white-text"}" 
                    bind:this={textFieldRef} 
                    type="text" 
                    {placeholder} 
                    bind:value={q}
                    on:keyup={keyPress}
                />

            </div>

            <!-- Check if arrow is disabled -->
            {#if !disableRightArrow}
            
                <!-- Icon container -->
                <div class="icon-container" slotFull={$$slots.append}>

                    <!-- Additional action -->
                    <slot name="append">

                        <!-- Icon -->
                        <Icon path={list.length > 0 ? mdiArrowRight : mdiMagnify} size={32} />

                    </slot>

                </div>

            {/if}

        </div>

        <!-- Check if error -->
        {#if error}

            <!-- Error element -->
            <div class="error red white-text pa-3">
                {error}
            </div>

        {/if}

        <!-- Download bar -->
        <div class="download-bar">

            <!-- Divider -->
            <ProgressLinear indeterminate={isDownloading} />

        </div>
        
        <!-- Check if list is ready -->
        {#if !error && list.length > 0}
        
            <!-- Content -->
            <div class="content" transition:slide>

                <!-- List container -->
                <div class="list-container">

                    <!-- List -->
                    <List>

                        <!-- Iterate over list -->
                        {#each list as s,i}

                            <ListItem {dense} on:click={() => select(s)}>
                            
                                <!-- Name -->
                                {s?.key || s?.name || s}
                            
                                <!-- Append -->
                                <span class="enter-select" slot="append">

                                    <!-- Check if first -->
                                    {#if i === 0}
                                    
                                        <!-- Enter to click -->
                                        <Chip class="primary-color white-text">
                                            Enter to select
                                        </Chip>

                                    {/if}

                                </span>

                            </ListItem>
                            
                        {/each}

                    </List>

                </div>

            </div>

        {/if}

    </main>

</Overlay>

<style>

    /* Container */
    main {
        width: 95%;
        max-width: 600px;
        height: auto;
        max-height: 95%;
        flex-direction: column;
        overflow: hidden;
    }

    /* Searchbar */
    main > .searchbar {
        width: 100%;
        height: 72px;
        display: flex;
        overflow: hidden;
    }

    /* Searchbar input bar */
    main > .searchbar > .input-bar {
        flex: 1;
        position: relative;
    }

    /* Searchbar input */
    main > .searchbar > .input-bar > input {
        height: 100%;
        width: 100%;
        padding: 6px 12px;
        font-size: 24px;
        outline: 0;
    }

    /* Close container */
    main > .searchbar > .close-container {
        display: none;
        place-items: center;
    }

    /* Icon container */
    main > .searchbar > .icon-container {
        width: 72px;
        display: grid;
        place-items: center;
    }

    /* Content */
    main > .content {
        width: 100%;
        height: auto;
        overflow: hidden;
    }

    /* list */
    main > .content > .list-container {
        height: auto;
        max-height: 300px;
        overflow-y: auto;
        overflow-x: hidden;
    }

    /* Media queries */
    @media screen and (max-width: 600px) {

        /* Container via mobile */
        main {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            max-width: 100%;
            height: 100%;
            max-height: 100%;
            border-radius: 0;
        }

        /* list via mobile */
        main > .content > .list-container {
            max-height: 100%;
        }

        /* Close container */
        main > .searchbar > .close-container {
            display: grid;
        }

        /* Icon container */
        main > .searchbar > .icon-container[slotFull = false] {
            display: none;
        }

        /* Searchbar */
        main > .searchbar {
            width: 100%;
            height: 64px;
            display: flex;
            overflow: hidden;
        }

        /* Enter select */
        .enter-select {
            display: none;
        }

    }

</style>