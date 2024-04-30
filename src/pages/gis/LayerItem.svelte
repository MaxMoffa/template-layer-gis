<script>

    // Imports
    import { theme, getColor } from '../../store/theme';
    import { AppBar, Button, Checkbox, Col, Divider, Icon, ProgressCircular, Ripple, Row, Select, Slider, Tooltip } from 'svelte-materialify/src';
    import { mdiChevronDown, mdiChevronUp, mdiDotsVertical, mdiEye, mdiEyeOff, mdiLock, mdiLockOpen} from '@mdi/js';
    import { slide } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
    import { onDestroy, createEventDispatcher } from 'svelte';
    import DateSelector from '../../components/DateSelector.svelte';
    import FileSelector from '../../components/FileSelector.svelte';

    // Layer instance
    export let layer;
    export let hideOptions = [];

    // Constants
    const LAYER_OPTIONS_TRANSITION = { delay: 0, duration: 300, easing: quintOut };
    const dispatch = createEventDispatcher();

    // Layer options
    let options = layer?.getLayerOptions();

    // Theme color
    let _theme = "light";
    let unsubscribeTheme = theme.subscribe(val => _theme = val);

    // Show/Hide layer options
    let isLayerExpanded = true;

    // Show/Hide layer onto map
    let isLayerVisible = layer?.getLayerVisibility();
    const updateVisibility = newVisibility => isLayerVisible = newVisibility;
    layer.on("visibilityChange", updateVisibility);

    // State
    let state = layer?.getState();
    const updateState = newState => state = newState;
    layer.on("stateChange", updateState);

    // Lock
    let lock = layer?.isLocked();
    const updateLock = newLock => lock = newLock;
    layer.on("lockChange", updateLock);

    // Loading
    let loading = layer?.isLoading();
    const setLoading = state => loading = true;
    const resetLoading = state => loading = false;
    layer?.on("startLoading", setLoading);
    layer?.on("stopLoading", resetLoading);

    // On element destroy
    onDestroy(() => {

        // Remove layer listener
        layer?.off("visibilityChange", updateVisibility);
        layer?.off("stateChange", updateState);
        layer?.off("lockChange", updateLock);
        layer?.off("startLoading", setLoading);
        layer?.off("stopLoading", resetLoading);

        // Unsubscribe to theme update
        unsubscribeTheme();

    });

    // Show/Hide layer options
    function toogleLayerExpand(){
        isLayerExpanded = !isLayerExpanded;
    }

    // Show/Hide layer onto map
    function toogleLayerVisibility(){
        isLayerVisible = !isLayerVisible;
        layer?.setVisibility(isLayerVisible);
    }

    // Lock/Unlock layer
    function toogleLayerLock() {
        layer?.setLockState(!lock);
    }

    // Open advanced options
    function openAdvancedOptions(e) {

        // Dispatch opening event
        dispatch("openOptions", { context: layer, event: e });

    }

    // On right mouse click
    function openContextMenu(e) {

        // Prevent default menu
        e.preventDefault();

        // Stop propagation
        e.stopImmediatePropagation();

        // Dispatch opening event
        dispatch("contextmenu", { context: layer, event: e });

    }

    // Check if an option should be disabled
    function isDisabled(o) {

        // Check if option contains a disabled function
        if(!o.hasOwnProperty("disable") || typeof(o.disable) !== "function")
            return false;

        return o.disable(state);

    }

    // Check if an option should be visible
    function isVisible(o) {

        // Check if option contains a disabled function
        if(!o.hasOwnProperty("visible") || typeof(o.visible) !== "function")
            return true;

        return o.visible(state);

    }

</script>

<!-- Main container -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<main class="{getColor(_theme)} rounded mb-3" on:contextmenu={openContextMenu}>

    <!-- Header -->
    <AppBar flat class="{getColor(_theme)}">

        <!-- Lock -->
        <div slot="icon">
            <Tooltip right>
                <Button disabled={lock === null} size="small" icon depressed style="background: transparent" class="{getColor(_theme)}" on:click={toogleLayerLock}>
                    <Icon size={20} path={lock ? mdiLock : mdiLockOpen} />
                </Button>
                <span slot="tip">
                    {#if lock !== null}
                        {lock ? "Sblocca" : "Blocca"}
                    {:else}
                        Bloccato
                    {/if}
                </span>
            </Tooltip>
        </div>

        <!-- Layer name -->
        <div slot="title" class="pa-0">
            {layer?.getName() ?? "Layer"}
        </div>

        <!-- Spacer -->
        <div style="flex-grow: 1;"></div>

        <!-- Check if is loading -->
        {#if loading}

            <!-- Loading indicator -->
            <ProgressCircular class="mr-2" size={16} width={2} indeterminate color={"primary"} />
            
        {/if}

        <!-- Show/Hide layer -->
        <Tooltip bottom>
            <Button icon depressed style="background: transparent" class="{getColor(_theme)}" on:click={toogleLayerVisibility}>
                <Icon path={isLayerVisible ? mdiEye : mdiEyeOff} />
            </Button>
            <span slot="tip">
                {isLayerVisible ? "Nascondi" : "Mostra"}
            </span>
        </Tooltip>

        <!-- Advanced options -->
        <Button icon depressed style="background: transparent" class="{getColor(_theme)}" on:click={openAdvancedOptions}>
            <Icon path={mdiDotsVertical} />
        </Button>

    </AppBar>

    <!-- Check if layer has options -->
    {#if layer?.getLayerOptions() }

        <!-- Check if layer is expanded or not -->
        {#if isLayerExpanded}
        
            <!-- Options -->
            <div class="layer-options" transition:slide={LAYER_OPTIONS_TRANSITION}>

                <!-- Divider -->
                <Divider />

                <!-- Options -->
                <div class="options pt-2 pl-1 pr-1 pb-2">

                    <Row noGutters>

                        {#each options as o}

                            <!-- Refresh -->
                            {#key state}

                                <!-- Check if an option should be visible -->
                                {#if isVisible(o) && !hideOptions.includes(o?.key)}
        
                                    <Col cols={o?.cols || 6} class="pa-1">
    
                                        <!-- Select -->
                                        {#if o?.type === "select"}
                                        
                                            <Select disabled={isDisabled(o)} mandatory value={state[o?.key]} items={o?.items} filled on:change={({detail}) => {
                                                layer?.setState(o?.key, detail);
                                            }}>
                                                {o?.placeholder || "Unknown"}
                                            </Select>
    
                                        <!-- Select -->
                                        {:else if o?.type === "select-multiple"}
            
                                            <Select disabled={isDisabled(o)} mandatory value={state[o?.key]} items={o?.items} multiple filled on:change={({detail}) => {
                                                layer?.setState(o?.key, detail);
                                            }}>
                                                {o?.placeholder || "Unknown"}
                                            </Select>
    
                                        <!-- Checkbox -->
                                        {:else if o?.type === "checkbox"}
    
                                            <Checkbox disabled={isDisabled(o)} checked={state[o?.key]} on:change={(e) => {
                                                layer?.setState(o?.key, e.target.checked);
                                            }}>
                                                {o?.placeholder || "Unknown"}
                                            </Checkbox>
    
                                        <!-- Date -->
                                        {:else if o?.type === "date"}
    
                                            <DateSelector 
                                                acceptString={false}
                                                now
                                                date
                                                disabled={isDisabled(o)}
                                                max={o?.max || null}
                                                min={o?.min || null}
                                                label={o?.placeholder || "Unknown"}
                                                value={state[o?.key]}
                                                on:change={({ detail }) => {
                                                    layer?.setState(o?.key, detail);
                                                }}
                                            />
    
                                        <!-- Datetime -->
                                        {:else if o?.type === "datetime"}
    
                                            <DateSelector 
                                                acceptString
                                                datetime
                                                disabled={isDisabled(o)}
                                                max={o?.max || null}
                                                min={o?.min || null}
                                                label={o?.placeholder || "Unknown"}
                                                value={state[o?.key]}
                                                on:change={({ detail }) => {
                                                    layer?.setState(o?.key, detail);
                                                }}
                                            />

                                        <!-- Slider -->
                                        {:else if o?.type === "slider"}

                                                <Slider
                                                    readonly={isDisabled(o)}
                                                    value={state[o?.key]*100} 
                                                    step={10} 
                                                    on:change={({ detail }) => {
                                                        layer?.setState(o?.key, parseInt(detail.value[0])/100);
                                                    }}
                                                >
                                                    {o?.placeholder || "Unknown"}
                                                </Slider>

                                        <!-- File -->
                                        {:else if o?.type === "file"}

                                            <FileSelector
                                                accept={o?.accept}
                                                file={state[o?.key]}
                                                on:change={({ detail }) => {
                                                    layer?.setState(o?.key, detail);
                                                }}
                                            />
                                        
                                        {/if}
    
                                    </Col>
    
                                {/if}
                                
                            {/key}

                        {/each}

                    </Row>

                </div>

                <!-- Divider -->
                <Divider />

            </div>

        {/if}

        <!-- Button options -->
        <div class="button-options pt-1 pb-1" use:Ripple on:click={toogleLayerExpand}>
            <Icon path={isLayerExpanded ? mdiChevronUp : mdiChevronDown} />
        </div>

    {/if}

</main>

<style>

    /* Main container */
    main {
        width: 100%;
        border: 1px solid var(--theme-dividers) !important;
    }

    /* Button options */
    main > .button-options {
        width: 100%;
        height: auto;
        cursor: pointer;
        display: grid;
        place-items: center;
    }

    /* Layer options */
    main > .layer-options {
        width: 100%;
        height: auto;
    }

</style>
