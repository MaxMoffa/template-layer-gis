<script>

    // Imports
    import { onDestroy, onMount } from 'svelte';
    import { theme, getColor, getBackground, getColorString } from '../../store/theme';
    import Map from './Map.svelte';
    import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
    import { Button, Divider, Icon, Ripple } from 'svelte-materialify/src';
    import { mdiCamera, mdiChevronLeft, mdiChevronRight, mdiLayers, mdiMagnify, mdiVideo } from '@mdi/js';
    import LayerItem from './LayerItem.svelte';
    import ContextualMenu from '../../core/ContextualMenu.svelte';
    import BaseMap from '../../layers/BaseMap';
    import NewLayer from '../../layers/NewLayer';
    import SearchBar from '../../components/SearchBar.svelte';
    import { loadLayer } from '../../layers';
    import moment from 'moment';
    import DateDialog from '../../components/Calendar/DateDialog.svelte';
    import ScreenshotDialog from '../../components/ScreenshotDialog.svelte';
    import MapRecorder from './MapRecorder.svelte';
    import { setStatusBarColor } from '../../store/system';
    import NetworkUtils from '../../utils/network_utils';

    // Export
    export let scoped;

    // Constants
    const SIDE_MENU_TRANSITION = {delay: 0, duration: 300, x: -500, y: 0, opacity: 0.5, easing: quintOut};
    const FLOATING_DATE_TRANSITION = {delay: 0, duration: 300, x: 0, y: -100, opacity: 0.5, easing: quintOut};
    const GIS_STATE_STORAGE = "GIS_STATE_STORAGE";
    
    // Custom controllers
    const CUSTOM_CONTROLLERS = [
        { icon: mdiMagnify, id: "search", position: "top-right" },
        { icon: mdiCamera, id: "screenshot", position: "bottom-right" },
        { icon: mdiVideo, id: "video", position: "bottom-right" }
    ];

    // Theme color
    let _theme = "light";
    let unsubscribeTheme = theme.subscribe(val => _theme = val);

    // Hide gis
    let hideGIS = false;

    // Side menu
    let isSideMenuOpen = !scoped?.isMobile;
    let isSideMenuScrolled = false;

    // Map instance
    let map = null;

    // Map component reference
    let mapComponent = null;

    // Map padding
    let mapPadding = {top: 0, bottom: 0, left: scoped.isMobile ? 0 : 500, right: 0};

    // Contextual menu
    let contextualMenuContext = null;

    // Option popup
    let optionPopupContext = null;

    // Layers
    let layers = [];

    // Show layer selector
    let showLayerSelector = false;

    // Page width
    let width;

    // General date
    let date = moment();
    let selectorDate = date;
    let showDateSelector = false;

    // Search bar state
    let activeSearchBar = false;

    // Screenshot dialog state
    let showScreenshotDialog = false;

    // Screenshot image
    let screenshotImage = null;

    // Live mode state
    let isLiveMode = false;

    // Show map recorder
    let showMapRecorder = false;

    // Check if is video recording
    let isVideoRecording = false;

    // On GIS mount
    onMount(() => {

        // Set status bar color
        setStatusBarColor( getColorString( getBackground( _theme ) ) );

    });

    // On map destroy
    onDestroy(() => {

        // Hide GIS
        hideGIS = true;

        // Unsubscribe to theme update
        unsubscribeTheme();

    });

    // Toogle side menu
    function toogleSideMenu() {

        // Check if is mobile and recorder is shown
        if(scoped.isMobile && showMapRecorder)
            showMapRecorder = false;
        
        // Show/Hide side menu
        isSideMenuOpen = !isSideMenuOpen;
        
        // Update map padding
        mapPadding.left = isSideMenuOpen ? 500 : 32;

    }

    // On side menu scroll
    function sideMenuScroll(e) {
        if(e.target.scrollTop <= 35)
            isSideMenuScrolled = false;
        else
            isSideMenuScrolled = true;
    }

    // Open map context menu
    function openMapContextMenu({ detail }) {

        const coordinate = `${detail.lngLat.lat}, ${detail.lngLat.lng}`;

        // Check if navigator contains clipboard
        if(!navigator?.clipboard)
            return;

        // Set event
        contextualMenuContext = {
            title: coordinate,
            backgroundOpacity: .1,
            event: {
                pageX: detail.point.x + 56,
                pageY: detail.point.y
            },
            options: [

                // Copy coordinate button
                {
                    name: "Copia coordinate",
                    callback: () => {

                        // Write text to clipboard
                        navigator.clipboard.writeText(coordinate);

                        // Notify user
                        scoped.sendNotification("Copiato nella clipboard");

                    }
                }

            ]
        }

    }

    // Open layer context menu
    function openLayerContextMenu({ detail }, isButton=false) {

        const box = detail.event.target.getBoundingClientRect();
        const xCenter = (box.left + box.right) / 2;
        const yCenter = (box.top + box.bottom) / 2;

        // Set event
        contextualMenuContext = {
            title: isButton ? "" : detail.context.getName(),
            event: isButton ? {
                pageX: xCenter,
                pageY: yCenter
            } : detail.event,
            backgroundOpacity: isButton ? 0 : .1,
            elevation: isButton ? 4 : 1,
            options: [

                // Toogle layer lock
                {
                    name: detail.context?.isLocked() ? "Sblocca" : "Blocca",
                    hide: detail.context?.isLocked() === null,
                    callback: () => {

                        // Toogle lock state
                        detail.context?.setLockState(!detail.context?.isLocked());

                    }
                },

                // Toogle layer visibility
                {
                    name: detail.context?.getLayerVisibility() ? "Nascondi" : "Mostra",
                    callback: () => {

                        // Toogle lock state
                        detail.context?.setVisibility(!detail.context?.getLayerVisibility());

                    }
                }

            ]
        }

    }

    // Open option
    function openOption({ detail }) {

        // Open popup
        optionPopupContext = detail;

    }

    // Save map and layers state
    function saveState({ detail }) {
        
        // Save state
        localStorage.setItem(GIS_STATE_STORAGE, detail);

    }

    // Retrieve map and layers state
    function loadState() {

        // Get state
        let state = localStorage.getItem(GIS_STATE_STORAGE);
        
        // Check state
        if(!state)
            return state;

        // Return json
        return JSON.parse(state);

    }

    // On map ready
    async function onMapReady(e) {
        
        // Map reference
        map = e.detail;

        // Load map state
        let state = null;

        // Fallback layers
        let loadedLayers = [new BaseMap("BaseMap", map), new NewLayer("NewLayer", map)];

        // Check state
        if(state) {

            // Set map center
            if(state?.map?.center)
                map.setCenter(state.map.center);

            // Set map zoom
            if(state?.map?.zoom)
                map.setZoom(state.map.zoom);

            // Set pitch
            if(state?.map?.pitch)
                map.setPitch(state.map.pitch);

            // Set rotation
            if(state?.map?.bearing)
                map.setBearing(state.map.bearing);

            // Reset loaded layers
            loadedLayers = [];

            // Iterate over state layers
            for(const l of state.layers) {

                // Layer class
                let Layer = await loadLayer(l?.name);

                // Push new layer
                loadedLayers = [...loadedLayers, new Layer(l?.name, map, l?.state)];

            }

        }

        // Add layer
        layers = loadedLayers;
    }

    // Get date string
    function getDateString(date) {      
        
        // Check if same day
        if(moment().isSame(date, "day"))
            return "Oggi, " + moment(date).format("HH:mm");

        // Return fallback date
        return moment(date).format("DD/MM/YYYY, HH:mm");

    }

    // Open date selector
    function openDateSelector() {

        // Set date
        selectorDate = date;

        // Show date selector
        showDateSelector = true;

    }

    // Set date
    function setDate() {

        // Update date
        date = moment(selectorDate).toDate();

        // Update layers
        layers.forEach(l => l.setState("date", date));

        // Hide date selector
        showDateSelector = false;

    }

    // Go to place onto map
    function goToPlace({ detail: { value } }) {

        // Prepare bounds
        let bounds = [ [value[2], value[0]], [value[3], value[1]] ];

        // Move map to bounds
        map?.fitBounds(bounds);

    }

    // Save map picture
    function savePicture() {

        // Open screenshot dialog
        showScreenshotDialog = true;

        // Map canvas
        let mapCanvas = map.getCanvas();

        // Get canvas list
        let list = map.getCanvasContainer().children;

        // Picture canvas
        let pictureCanvas = document.createElement("canvas");

        // Set canvas width
        pictureCanvas.width = mapCanvas.width;

        // Set canvas height
        pictureCanvas.height = mapCanvas.height;

        // Handle padding
        if(mapPadding) {

            // Set padding width
            pictureCanvas.width -= mapPadding.left - mapPadding.right;

            // Set padding height
            pictureCanvas.height -= mapPadding.top - mapPadding.bottom;

        }

        // Get picture canvas context
        let pictureCanvasContext = pictureCanvas.getContext("2d");

        // Draw images
        for (let i = 0; i < list.length; i++) {

            // Canvas
            let c = list[i];

            // Draw image
            pictureCanvasContext.drawImage(c, -(mapPadding?.left || 0), -(mapPadding?.top || 0));
            
        }

        // Set screenshot image
        screenshotImage = pictureCanvas.toDataURL();

    }

    // Handle custom controller events
    function handleCustomControllers({ detail }) {
        
        // Handle different custom controllers
        switch (detail?.id) {

            // Search
            case "search": {

                // Open searchbar
                activeSearchBar = true;

                break;
            };

            // Screenshot
            case "screenshot": {

                // Take screenshot and opens screenshot dialog
                savePicture();

                break;
            };

            // Video
            case "video": {

                // Check if live view is enabled
                if(isLiveMode) {

                    // Disable live view
                    toogleLiveView();

                }

                // Open video dialog
                showMapRecorder = true;

                break;
            };
        
            default:
                break;
        }

    }

    // Open live view mode
    function toogleLiveView() {
        
        // Enable live mode
        isLiveMode = !isLiveMode;

        // Check if liveView is disabled
        if(!isLiveMode) {

            // Update layers
            layers.forEach(l => l.setState("date", date));

        } else {

            // Disabled recording popup
            showMapRecorder = false;

        }
        
    }

</script>

<!-- Hide GIS -->
{#if !hideGIS}

    <main bind:clientWidth={width}>

        <!-- Map container -->
        <div class="map-container">

            <!-- Map -->
            <Map
                bind:this={mapComponent}
                on:ready={onMapReady}
                on:contextmenu={openMapContextMenu} 
                on:openOption={openOption}
                on:change={saveState}
                on:customControllerEvent={handleCustomControllers}
                on:error={({detail}) => {

                    // Notify error
                    scoped.sendNotification(detail.message, 3000, "error");
                
                }}
                bind:layers={layers}
                customControllers={CUSTOM_CONTROLLERS}
                padding={scoped?.isMobile ? null : mapPadding}
                showPointer
                showLock
                showSearch
                interactivePosition
                registerChange
            >

                <!-- Check if side menu is open -->
                {#if !isSideMenuOpen}
                
                    <!-- Floating date button selector -->
                    <div class="date-button-selector-floating" isMobile={scoped?.isMobile} in:fly={{ ...FLOATING_DATE_TRANSITION, delay: 300 }} out:fly={FLOATING_DATE_TRANSITION}>

                        <!-- Date button selector -->
                        <Button rounded class="teal white-text" on:click={() => {

                            // Check if live mode is enabled
                            if(isLiveMode)
                                toogleLiveView();
                            else
                                openDateSelector();

                        }}>
                            {isLiveMode ? "Live View" : getDateString(date)}
                        </Button>

                        <!-- Check if is mobile -->
                        {#if scoped?.isMobile}
        
                            <!-- Menu button container  -->
                            <div class="pt-2">
                                
                                <!-- Menu button -->
                                <Button rounded on:click={toogleSideMenu} disabled={isVideoRecording}>
                                    <Icon path={mdiLayers} />
                                </Button>

                            </div>

                        {/if}

                    </div>

                {/if}

            </Map>

        </div>

        <!----------------------->
        <!------ OVERLAY -------->
        <!----------------------->

        <!-- Map overlay -->
        <div class="map-overlay">

            <!-- Side menu controller -->
            {#if isSideMenuOpen}

                <!-- Side menu -->
                <div class="{getBackground(_theme)} side-menu {width < 1000 ? "side-menu-fullscreen" : ""}" in:fly={{ ...SIDE_MENU_TRANSITION, delay: 300 }} out:fly={SIDE_MENU_TRANSITION}>

                    <!-- Side menu content -->
                    <div class="content" on:scroll={sideMenuScroll}>

                        <!-- AppBar container -->
                        <div style="position: sticky; top: 0; background: {isSideMenuScrolled ? "" : "transparent"}; z-index: 10" class="mt-10 pt-2 mb-2 {isSideMenuScrolled ? getBackground(_theme) : ""}">

                            <!-- AppBar -->
                            <div class="pt-3 pb-3">

                                <!-- Spacer -->
                                <div class="d-flex pl-2 pr-2" style="flex-grow: 1;">

                                    <div>

                                        <!-- Hide menu button -->
                                        <Button icon class="mr-1" on:click={toogleSideMenu} disabled={isVideoRecording}>
                                            <Icon path={mdiChevronLeft} />
                                        </Button>

                                    </div>

                                    <div class="flex-1 pr-1">

                                        <!-- Date button selector -->
                                        <Button rounded depressed block outlined={isLiveMode} class="{!isLiveMode ? "primary white-text" : "primary-text"}" on:click={() => {

                                            // Check if live mode is enabled
                                            if(isLiveMode)
                                                toogleLiveView();
                                            else
                                                openDateSelector();

                                        }}>
                                            {isLiveMode ? "Static View" : getDateString(date)}
                                        </Button>

                                    </div>

                                </div>

                            </div>

                            <!-- Divide -->
                            <Divider />

                        </div>

                        <!-- Layer list -->
                        <div class="layer-list pl-2 pt-2 pr-2">
                            
                            <!-- Destroy on layers changes -->
                            {#key layers}

                                <!-- Iterate over layers -->
                                {#each [...layers].reverse() as layer}
            
                                    <!-- Layer -->
                                    <LayerItem 
                                        {layer}
                                        hideOptions={["date"]}
                                        on:contextmenu={openLayerContextMenu}
                                        on:openOptions={(e) => openLayerContextMenu(e, true)} 
                                    />
        
                                {/each}
                                
                            {/key}

                        </div>
                        <!-- <div style="height: 2000px;"></div> -->

                    </div>

                    <!-- Side menu background -->
                    <div class="background">
                        <div class="{getColor(_theme)}"></div>
                    </div>

                </div>

            {:else if !scoped?.isMobile}

                <!-- Side menu -->
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <div class="elevation-2 side-menu side-menu-closed" use:Ripple on:click={() => {

                    // Check if is video recording
                    if(!isVideoRecording)
                        toogleSideMenu();

                }} in:fly={{ ...SIDE_MENU_TRANSITION, delay: 300 }} out:fly={{ ...SIDE_MENU_TRANSITION, x: -56}}>

                    <!-- Side menu content -->
                    <div class="content pt-16 pb-2 d-flex flex-column align-center">

                        <!-- Show menu button -->
                        <Icon path={mdiChevronRight} />

                        <!-- Divider -->
                        <span style="flex-grow: 1;"></span>

                    </div>

                    <!-- Side menu background -->
                    <div class="background">
                        <div class="{getColor(_theme)}"></div>
                    </div>

                </div>

            {/if}

            <!-- Map recorder handler -->
            <MapRecorder
                on:startRecording={() => isVideoRecording = true}
                on:endRecording={() => isVideoRecording = false}
                bind:active={showMapRecorder}
                padding={mapPadding}
                layers={layers}
                {map}
            />

        </div>

        <!-- Open options -->
        {#if optionPopupContext}
        
            <SearchBar
                showList
                showOptions
                closeOnSelect={false}
                bind:active={optionPopupContext}
                getOptions={async (s) => {

                    // Filtered options
                    let options = optionPopupContext.items.filter(o => o.name.toLowerCase().startsWith(s.toLowerCase()));                

                    return options;
                }}
                on:select={(e) => {

                    // Set state
                    optionPopupContext?.layer?.setState(optionPopupContext.key, e.detail.value);

                    // Close popup
                    optionPopupContext = null;

                }}
            />

        {/if}

        <!-- Searchbar -->
        <SearchBar
            placeholder={"Cerca luogo"}
            bind:active={activeSearchBar}
            on:select={goToPlace}
            getOptions={async (s) => {
                let result = await NetworkUtils.getNominatim("search", {
                    format: "json",
                    q: s,
                    addressdetails: 1
                })
                return result.map(o => {
                    let name = "";
                    for(let key in o.address)
                        if(key !== "country_code")
                            name += o.address[key] + ", ";
                    name = name.substring(0, name.length - 2);
                    return {key: name, value: o.boundingbox};
                });
            }}
        />

        <!-- Image viewer -->
        <ScreenshotDialog bind:active={showScreenshotDialog} bind:image={screenshotImage} />

        <!-- Contextual menu -->
        <ContextualMenu 
            bind:context={contextualMenuContext}
            screenPadding={{ top: 6 }}
            dense
        />

        <!-- Date selector dialog -->
        <DateDialog
            bind:active={showDateSelector}
            on:change={({ detail }) => {

                // Update selector date
                selectorDate = moment(detail);

                // Set date
                setDate();

            }}
            datetime 
            max={moment().add(5, "day")}
        />

    </main>

{/if}

<style>

    /* Main container */
    main {
        width: 100%;
        height: 100%;
        overflow: hidden;
    }

    /* Map container */
    .map-container {
        position: absolute;
        width: 100%;
        height: 100%;
        z-index: 0;
    }

    /*
        OVERLAY
    */

    /* Map overlay */
    .map-overlay {
        position: absolute;
        display: flex;
        width: 100%;
        height: 100%;
        z-index: 2;
        user-select: none;
        pointer-events: none;
    }

    /* Side menu (layer) */
    .map-overlay > .side-menu {
        position: relative;
        flex: 1;
        max-width: 500px;
        pointer-events: auto;
        overflow: hidden;
        border-right: 1px solid var(--theme-dividers) !important;
    }

    /* Side menu fullscreen (layer) */
    .map-overlay > .side-menu-fullscreen {
        width: 100%;
    }

    /* Side menu CLOSED */
    .map-overlay > .side-menu-closed {
        max-width: 32px !important;
        cursor: pointer;
    }

    /* Side menu (layer) > Content */
    .map-overlay > .side-menu > .content {
        position: absolute;
        width: 100%;
        height: 100%;
        overflow-x: hidden;
        overflow-y: auto;
        z-index: 1;
    }

    /* Layer list */
    .map-overlay > .side-menu > .content > .layer-list {
        width: 100%;
        height: auto;
    }

    /* Side menu (layer) > Background */
    .map-overlay > .side-menu > .background {
        position: absolute;
        width: 100%;
        height: 100%;
        backdrop-filter: Blur(10px);
        transform: translate3d(0, 0, 0);
        z-index: 0;
    }

    /* Side menu > Background > Color */
    .map-overlay > .side-menu > .background > div {
        position: absolute; 
        width: 100%; 
        height: 100%; 
        opacity: .6
    }

    /* Date popup */
    .date-popup {
        width: 100%;
        height: auto;
        max-width: 400px;
        max-height: 100%;
    }

    /* Floating date button selector */
    .date-button-selector-floating {
        position: absolute;
        top: 10px;
        left: 10px;
        pointer-events: all;
    }

    /* Floating date button selector mobile */
    .date-button-selector-floating[isMobile=true] {
        position: absolute;
        top: 10px;
        left: 9px;
        pointer-events: all;
    }

    /* Mobile layer selector */
    .mobile-layer-selector {
        width: 100%;
        height: 100vh;
    }

</style>