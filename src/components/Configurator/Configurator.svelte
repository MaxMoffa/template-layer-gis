<script>
    import { ClickOutside, AppBar, Button, Icon, ProgressCircular, Tooltip } from "svelte-materialify/src";
    import { mdiClose, mdiFullscreen, mdiFullscreenExit } from "@mdi/js";
    import { fade, fly } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';
    import { theme, getBackground, getColor, getColorInverted } from '../../store/theme';
    import { onDestroy, createEventDispatcher, onMount } from "svelte";
    import Preview from "./Preview.svelte";
    import * as WidgetIndex from '../../widgets/index';
    import Options from "./Options.svelte";
    import LangUtils from "../../utils/lang_utils";

    export let active = true;
    export let widgetId = null;
    export let state = null;
    export let apikey = null;
    export let token = null;
    export let configuration = null;
    export let dict = new LangUtils("en", {});
    export let widgetName = null;
    export let alwaysFullscreen = false;

    // Fullscreen storage name
    const FULLSCREEN_STORAGE = "configurator_fullscreen_force_info";

    // Dispatcher
    const dispatch = createEventDispatcher();

    // Update on active change
    $: active, toogle();

    // Ref and info
    let pageContent;
    let previewHeight;

    // Shadow on scroll
    let flatConfiguratorBar = true;
    let flatPageBar = true;

    // Fullscreen mode
    let isFullscreen = false;
    let mediaListener = window.matchMedia("(max-width: 1200px)");

    // Theme
    let _theme = "light";
    let unsubscribeTheme = theme.subscribe(val => _theme = val);

    // Temporary state
    let _state = null;

    // Preview
    let previewState = null;

    // Check if all is loaded
    let isLoaded = true;

    // Check if something changed
    let somethingChanged = false;

    // Force fullscreen (no vertical)
    let forceFullscreen = false;

    // On configurator mount
    function toogle() {

        // Toogle screen listener
        toogleScreenListener();

        if(!active){
            configuration = null;
            widgetName = null;
            return;
        }
            
        // Load widget proprieties
        Promise.all([WidgetIndex.getPropreties(widgetId), loadDictionary(widgetId, dict.getLang())])
        .then(result => {

            // Set default state as fallback
            if(!state){
                let defaultState = result[0].DEFAULT_CONFIGURATION;
                _state = defaultState && typeof(defaultState) === "object" ? {...defaultState} : defaultState;
                previewState = defaultState && typeof(defaultState) === "object" ? {...defaultState} : defaultState;
            } else {
                _state = state && typeof(state) === "object" ? {...state} : state;
                previewState = state && typeof(state) === "object" ? {...state} : state;
            } 

            // Set configurator name if not provided
            if(!widgetName)
                widgetName = result[0].WIDGET_NAME

            // Set widget configuration if not provided
            if(!configuration)
                configuration = result[0].CONFIGURATION;

            // Set widget dictionary
            if(result[1])
                dict.addDictionary(result[1]);

            // Show configurator
            isLoaded = true;

        })
        .catch(e => {
            console.error(e);
            closeConfigurator()
        });
    }

    onMount(() => {

        // Check if user prefer fullscreen mode
        forceFullscreen = localStorage.getItem(FULLSCREEN_STORAGE) ? true : false;

    });

    // On configurator destroy
    onDestroy(() => {

        // Unsubscribe to theme update
        unsubscribeTheme();

        // Unsubscribe to resize update
        mediaListener.removeEventListener("change", toogleFullscreen);

    });

    // Load dictionary file
    async function loadDictionary(id, lang) {
		try {

            // Import index
            let index = (await import(`../../widgets/${id}/lang/index.json`)).default;

            // Select dictionary
            if(index.includes(lang))
                return (await import(`../../widgets/${id}/lang/${lang}.json`)).default;

            // Fallback language
            if(index.length > 0)
                return (await import(`../../widgets/${id}/lang/${index[0]}.json`)).default;

            return false;

        } catch (error) {

            console.log(error);
            return false;
        
        }
	}

    // Toogle fullscreen
    function toogleFullscreen(x) {
        console.log("Enable fullscreen", x.matches);
        if(x.matches)
            isFullscreen = true;
        else
            isFullscreen = false;
    }

    // Toogle screen listener
    function toogleScreenListener() {
        console.log("Enable fullscreen listener", active);
        // Check if configurator is active
        if(active){
            // Toogle fullscreen
            toogleFullscreen(mediaListener);
            // Start listening to change
            mediaListener.addEventListener("change", toogleFullscreen);
        } else {
            // Remove the listener event
            mediaListener.removeEventListener("change", toogleFullscreen);
        }
    }

    // Configurator scroll event
    function configuratorScroll(e) {
        if(e.target.scrollTop === 0)
            flatConfiguratorBar = true;
        else
            flatConfiguratorBar = false;
    }

    // Page scroll event
    function pageScroll(e) {
        if(e.target.scrollTop < previewHeight - 100)
            flatPageBar = true;
        else
            flatPageBar = false;
    }

    // Close configurator
    function closeConfigurator() {

        // Emitt close event
        dispatch("close");

        active = false;

        // Reset variables
        _state = null;
        previewState = null;
        isLoaded = false;
        somethingChanged = false;
        flatConfiguratorBar = true;
        flatPageBar = true;
    }

    // In fullscreen mode scroll the view to the preview
    function goToPreview() {
        if(pageContent)
            pageContent.scrollTo({ top: 0, behavior: "smooth" });
    }

    // Update preview state
    function updatePreview(e) {
        somethingChanged = true;
        previewState = { ..._state };
    }

    // Update changes to parent component
    function updateChanges() {
        somethingChanged = false;
        dispatch("saveState", previewState);
        state = {...previewState};
        closeConfigurator();
    }

    // Toogle the fullscreen mode
    function toogleForceFullscreen() {
        
        // Toogle fullscreen mode
        forceFullscreen = !forceFullscreen;

        // Save user preference
        if(forceFullscreen)
            localStorage.setItem(FULLSCREEN_STORAGE, forceFullscreen);
        else
            localStorage.removeItem(FULLSCREEN_STORAGE);

    }

</script>

<!-- Check if configurator is active -->
{#if active}

    <!-- Overlay -->
    <div class="overlay-custom" transition:fade="{{delay: 0, duration: 300}}">
        
        <!-- Background -->
        <div class="overlay-background {getColorInverted(_theme)}"></div>

        <!-- Main configurator -->
        <main forceFullscreen={forceFullscreen || alwaysFullscreen} {isFullscreen} class="{getBackground(_theme)} rounded-lg elevation-2" use:ClickOutside on:clickOutside={closeConfigurator} transition:fly="{{delay: 0, duration: 300, x: 0, y: 100, easing: quintOut}}">

            <!-- Start loading -->
            {#if isLoaded}
            
                <!-- AppBar -->
                <AppBar flat={flatPageBar} style="background-color: transparent; position: absolute; width: 100%; top: 0; left: 0; z-index: 1004 !important">

                    <!-- Cancel button -->
                    <span slot="icon">
                        <Tooltip bottom>
                            <Button icon sise="small" on:click={closeConfigurator}>
                                <Icon path={mdiClose} />
                            </Button>
                            <span slot="tip">
                                Chiudi
                            </span>
                        </Tooltip>
                    </span>
        
                    <!-- Title -->
                    <span slot="title">
                        {widgetName || "Configuratore"}
                    </span>
        
                    <!-- Spacer -->
                    <span style="flex: 1;"></span>

                    <Tooltip bottom>
                        {#if !isFullscreen && !alwaysFullscreen}
                            <div class="button-fullscreen-toogle">
                                <Button icon sise="small" on:click={toogleForceFullscreen}>
                                    <Icon path={forceFullscreen ? mdiFullscreenExit : mdiFullscreen} />
                                </Button>
                            </div>
                        {/if}
                        <span slot="tip">
                            {forceFullscreen ? "Torna al popup" : "Vai fullscreen"}
                        </span>
                    </Tooltip>

                    <!-- Go to preview -->
                    {#if isFullscreen && !flatPageBar}
                        <div transition:fade="{{delay: 0, duration: 300}}">
                            <Button rounded outlined size="small" class="mr-2 primary-color-text" on:click={goToPreview}>
                                Vedi anteprima
                            </Button>
                        </div>
                    {/if}

                    <!-- Save button -->
                    {#if somethingChanged}
                        <Button rounded depressed size="small" class="primary-color white-text mr-2" on:click={updateChanges}>
                            Salva
                        </Button>
                    {/if}
        
                </AppBar>
        
                <!-- Page content -->
                <div class="page-content" on:scroll={pageScroll} bind:this={pageContent}>

                    <!-- White background appbar -->
                    {#if isFullscreen}
                        <div class="{getBackground(_theme)} background-bar-fullscreen-mode"></div>
                    {/if}

                    <!-- Preview side -->
                    <div class="preview-side side {isFullscreen ? "elevation-4" : ""}" bind:clientHeight={previewHeight}>

                        {#if isFullscreen}
                            <div class="white" style="height: 80px;"></div>
                        {/if}
            
                        {#key isFullscreen}
                            <Preview {widgetId} state={previewState} {apikey} {token} lang={dict.getLang()}/>
                        {/key}

                    </div>
        
                    <!-- Configuration side -->
                    <div class="configurator-side side {getColor(_theme)} elevation-1" on:scroll={configuratorScroll}>

                        <!-- Show shadow when scrolling inside configurator popup mode -->
                        {#if !isFullscreen}
                            <AppBar class="{getColor(_theme)}" style="position: sticky; top: 0; z-index: 1003" flat={flatConfiguratorBar}></AppBar>
                        {:else}
                            <div style="height: 64px;"></div>
                        {/if}

                        <!-- Widget options -->
                        <Options {apikey} {token} {configuration} {dict} state={_state} on:change={updatePreview} />
                        
                    </div>
        
                </div>

            {:else}

                <!-- Loading page -->
                <div class="loading-page">
                    <ProgressCircular color="primary-color" indeterminate size={96} />
                </div>

            {/if}

        </main>

    </div>

{/if}

<style>

    /* Overlay */
    .overlay-custom {
        position: fixed;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        z-index: 1000;
        display: grid;
        place-items: center;
        overflow: hidden;
    }

    .overlay-background {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        opacity: 0.5;
        z-index: 0;
    }

    /* Main configurator */
    main {
        position: relative;
        width: 1300px;
        height: 800px;
        overflow-y: hidden;
    }

    /* Page content */
    .page-content {
        width: 100%;
        height: 100%;
        display: flex;
        overflow: hidden;
    }

    /* Loading page */
    .loading-page {
        flex: 1;
        width: 100%;
        height: 100%;
        display: grid;
        place-items: center;
    }

    /* Preview side */
    .preview-side {
        flex: 1;
        display: grid;
        place-items: center;
    }

    /* Configurator side */
    .configurator-side {
        width: 40%;
        overflow-y: auto;
    }

    /* Full screen - vertical */

    .background-bar-fullscreen-mode {
        position: absolute; 
        top: 0; 
        width: 100%;
        height: 56px;
        z-index: 1003;
    }

    /* Force full screen, no vertical */
    main[forceFullscreen = true] {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        border-radius: 0;
    }


    /* Go full screen */
    main[isFullscreen = true] {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        border-radius: 0;
    }

    /* Vertical distribution */
    main[isFullscreen = true] > .page-content {
        display: grid;
        grid-auto-flow: row !important;
        overflow-y: auto;
        scroll-snap-type: y mandatory;
    }

    /* Sides */
    main[isFullscreen = true] > .page-content > .preview-side {
        flex: 0;
        width: 100%;
        height: fit-content;
        padding-top: 0;
        padding-bottom: 16px;
        scroll-snap-align: start;
    }

    main[isFullscreen = true] > .page-content > .configurator-side {
        flex: 0;
        width: 100%;
        height: auto;
        overflow-y: initial;
        scroll-snap-align: start;
        box-shadow: none !important;
    }

    /* Go fullscreen horizontal */
    @media screen and (max-width: 1400px), screen and (max-height: 800px) {

        main {
            position: absolute;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            border-radius: 0;
        }

        main > .page-content > .configurator-side {
            flex: 1;
        }

        main .button-fullscreen-toogle {
            display: none;
        }

    }

</style>