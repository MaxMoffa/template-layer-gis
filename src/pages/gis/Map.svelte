<svelte:head>

    <!-- Map libre CSS -->
    <link href='https://unpkg.com/maplibre-gl@2.4.0/dist/maplibre-gl.css' rel='stylesheet' />

</svelte:head>

<script>

    // Imports
    import maplibregl from 'maplibre-gl';
    import { onMount, onDestroy, createEventDispatcher } from "svelte";
    import { Button, Divider, Icon } from 'svelte-materialify/src';
    import { mdiCrosshairs, mdiInformationVariant } from '@mdi/js';
    import LockController from './controller/LockController';
    import NetworkUtils from '../../utils/network_utils';
    import Overlay from '../../components/Overlay.svelte';
    import { theme, getBackground } from '../../store/theme';
    import { user } from '../../store/user';
    import GenericController from './controller/GenericController';

    export let layers = [];
    export let mapState = null;
    export let interactive = true;
    export let interactivePosition = false;
    export let workerCount = null;
    export let padding = null;
    export let showPointer = false;
    export let showLoading = false;
    export let showLock = false;
    export let customControllers = null;
    export let showInfo = true;
    export let registerChange = false;
    export let pointerSize = 24;
    export let showControllers = true;
    export let attributionControl = true;
    export let loadLayerComponents = true;
    export function destroy () {
        return _destroy();
    };
    export function serialize () {
        return _serialize();
    };

    // Smart props
    $: padding, updatePadding();
    $: layers, updateLayers();

    // Constants
    const INITIAL_ZOOM = 3;
    const INITIAL_CENTER = [12.470133, 41.880458];
    const INITIAL_PITCH = 0;
    const INITIAL_BEARING = 0;
    const CONTROLLER_POSITION = "top-right";
    const POSITION_CONTROLLER_POSITION = "top-right";
    const LOCK_CONTROLLER_POSITION = "top-right";
    const INFO_CONTROLLER_POSITION = "bottom-right";
    const ATTRIBUTION = ["<a href='https://sensesquare.eu'>© Sense Square</a>"];
    const MAX_PITCH = 85;

    // Event dispatcher
    const dispatch = createEventDispatcher();

    // Theme color
    let _theme = "light";
    let unsubscribeTheme = theme.subscribe(val => _theme = val);

    // User info
    let _user = null;
    let unsubscribeUser = user.subscribe(val => _user = val);

    // Reference to map DOM element
    let mapRef = null;

    // Reference to map instance
    let map = null;

    // Reference to map controller
    let mapController = null;

    // Reference to position controller
    let positionController = null;

    // Reference to lock controller
    let lockController = null;

    // Resize observer
    let mapContainerSizeObserver = null;

    // Loading controller
    let loadingRequest = [];

    // Active popup legend
    let showLegend = false;

    // Layers components
    let layersComponents = [];

    // On first start
    onMount(() => {

        // Set worker count
        if(workerCount && typeof(workerCount) === "number")
            maplibregl.workerCount = workerCount;

        // Map init
        initMap();

        // Map controller interface
        if(interactive && showControllers)
            initController();

        // User position interace
        if(interactivePosition && showControllers)
            initPositionController();

        // Show lock
        if(showLock && showControllers)
            initLockController();

        // Show info
        if(showInfo && showControllers)
            initInfoController();

        // Check if there are custom controllers
        if(customControllers && Array.isArray(customControllers))
            initCustomControllers();

        // Init resize observer
        mapContainerSizeObserver = new ResizeObserver(mapContainerResize)

        // Connect resize observer
        mapContainerSizeObserver.observe(mapRef);

    });

    // On map destroy
    onDestroy(() => {

        // Unsubscribe to theme update
        unsubscribeTheme();

        // Unsubscribe to user update
        unsubscribeUser();

        // Destroy
        _destroy();

    })

    // Destroy map and layers
    function _destroy() {

        // Destroy all layers
        destroyLayers();

        // Remove contextmenu listener
        map.off("contextmenu", openContextMenu);
        map.off("moveend", dispatchChange);
        map.off("zoomend", dispatchChange);
        map.off("pitchend", dispatchChange);
        map.off("rotateend", dispatchChange);

        // Remove map
        map?.remove();

        // Disconnect resize observer
        mapContainerSizeObserver?.disconnect();

    }

    // Init map
    function initMap() {
        
        // Create mapLibreGL instance
        map = new maplibregl.Map({
            container: mapRef,
            center: mapState?.center ? mapState?.center : INITIAL_CENTER,
            zoom: mapState?.zoom ? mapState?.zoom : INITIAL_ZOOM,
            pitch: mapState?.pitch ? mapState?.pitch : INITIAL_PITCH,
            bearing: mapState?.bearing ? mapState.bearing : INITIAL_BEARING,
            maxPitch: MAX_PITCH,
            hash: false, //TODO
            attributionControl: attributionControl,
            customAttribution: ATTRIBUTION,
            renderWorldCopies: false,
            preserveDrawingBuffer: true,
            interactive: interactive
        });

        // Dispatch map ready event
        dispatch("ready", map);

        // Listen to context menu event
        map.on("contextmenu", openContextMenu);

        // Check if change register is required
        if(registerChange) {

            // Register position movement
            map.on("moveend", dispatchChange);

            // Register zoom movement
            map.on("zoomend", dispatchChange);

            // Register pitch changes
            map.on("pitchend", dispatchChange);

            // Register rotation changes
            map.on("rotateend", dispatchChange);

        }

        // Set padding if provided
        updatePadding();

    }

    // Init map controller interface
    function initController() {

        // Create navigation control instance
        mapController = new maplibregl.NavigationControl({
            showCompass: true,
            showZoom: true,
            visualizePitch: true
        });

        // Add controller to map
        map.addControl(mapController, CONTROLLER_POSITION);

    }

    // Init position controller
    function initPositionController() {

        // Create position controller
        positionController = new maplibregl.GeolocateControl({
            fitBoundsOptions: {
                maxZoom: 13
            },
            positionOptions: {
                enableHighAccuracy: true
            },
            trackUserLocation: true
        });

        // Add controller to map
        map.addControl(positionController, POSITION_CONTROLLER_POSITION);

    }

    // Init lock controller
    function initLockController() {

        // Lock controller
        lockController = new LockController(layers);

        // Add controller to map;
        map.addControl(lockController, LOCK_CONTROLLER_POSITION);

    }

    // Init search controller
    function initInfoController() {

        // Search controller
        let infoController = new GenericController(mdiInformationVariant, () => {

            // Open searchbar
            showLegend = true;

        });

        // Add controller to map;
        map.addControl(infoController, INFO_CONTROLLER_POSITION);

    }

    // Init custom controllers
    function initCustomControllers() {
        
        // Iterate over custom controllers
        customControllers.forEach(controller => {

            // Init controller
            let controllerInstance = new GenericController(controller?.icon, () => {

                // Dispatch controller event
                dispatch("customControllerEvent", { id: controller?.id, position: controller?.position });

            });

            // Add controller to map;
            map.addControl(controllerInstance, controller?.position);

        });

    }

    // Map container has changed size
    function mapContainerResize() {

        // Resize map content
        map?.resize();

    }

    // Update padding if provided
    function updatePadding() {

        // Check if padding value exist
        if(!padding)
            return;

        // Fly to map present position using padding
        map?.flyTo({
            padding,
            maxDuration: 300
        });

        // Add padding to top-right controllers
        let topRight = document.querySelector(".maplibregl-ctrl-top-right");

        // Check top right
        if(topRight) {

            // Update padding
            topRight.style.top = padding.top + "px";
            topRight.style.right = padding.right + "px";

        }

        // Add padding to bottom-right controllers
        let bottomRight = document.querySelector(".maplibregl-ctrl-bottom-right");

        console.log({bottomRight});

        // Check bottom-right
        if(bottomRight) {

            // Update padding
            bottomRight.style.bottom = padding.bottom + "px";
            bottomRight.style.right = padding.right + "px";

        }

    }

    // Get pointer padding
    function getPointerPadding(padding) {

        // Check if padding is valid
        if(!padding || typeof(padding) !== "object")
            return "";

        // Add screen padding if present
        let top, left, right, bottom;
        top = padding?.top || 0;
        left = padding?.left || 0;
        right = padding?.right || 0;
        bottom = padding?.bottom || 0;

        // Offsets
        let offsetX = Math.abs(left - right);
        let offsetY = Math.abs(top - bottom);

        return `width: calc(100% - ${offsetX}px); height: calc(100% - ${offsetY}px); left: ${left}px; right: ${right}px; top: ${top}px; bottom: ${bottom}px; `;

    }

    // Load layers
    async function updateLayers() {

        // Check if map is ready
        if(map === null)
            return;

        // Check if change register is required
        if(registerChange && layers.length > 0)
            dispatchChange();

        // Check if layers are valid
        if(!layers || !Array.isArray(layers) || layers.length === 0)
            return

        // Check if lock controller is engaged
        if(lockController !== null)
            lockController.updateLayerListeners(layers);

        console.log("RENDER LAYERS");

        // Iterate over layers
        for(const layer of layers) {

            // Check if layers is rendered
            if(!layer.isRendered()){

                // Set options
                layer.setOptions({
                    interactive,
                    showControllers,
                    loadLayerComponents
                });

                // Render layer
                layer.render(layer);

                // Read loading events
                layer.on("startLoading", startLoading);
                layer.on("stopLoading", stopLoading);
                layer.on("openOption", openOption);
                layer.on("error", handleError);

                // Check if change register is required
                if(registerChange)
                    layer.on("stateChange", dispatchChange);

                // Check if load layer component is enabled
                if(loadLayerComponents) {
                    
                    // Load loader handler
                    layer.on("loadComponent", loadComponent);

                    // Load remove handler
                    layer.on("removeComponent", removeComponent);

                }

                // Wait
                await layer.onceRendered();

            }

        }

    }

    // Destroy all layers
    function destroyLayers() {

        // Check if layers are valid
        if(!layers || !Array.isArray(layers) || layers.length === 0)
            return;

        // Iterate over layers
        [...layers].reverse().forEach(layer => {

            // Handle errors
            try {
                
                // Destroy layer
                layer.destroy();

            } catch (error) {
                
                // Log error
                console.log(error);

            }

        });

    }

    // Open context menu
    function openContextMenu(e) {

        // Dispatch context menu event
        dispatch("contextmenu", e);

    }

    // Open option
    function openOption(o) {

        // Dispatch open option event
        dispatch("openOption", o);

    }

    // Dispatch change if required
    function dispatchChange() {

        // Check if map is ready
        if(!map)
            return;

        // Dispatch change with serialize map and layers state
        dispatch("change", _serialize());

    }

    /* 
        Loading handler 
    */

    // Start loading
    function startLoading(id) {

        console.log(id + "_start");

        // Add loading request
        if(loadingRequest.indexOf(id) === -1)
            loadingRequest.push(id);

        // Start loading
        showLoading = true;
    }

    // Start loading
    function stopLoading(removeId) {

        console.log(removeId + "_end");

        // Remove loading request
        loadingRequest = loadingRequest.filter(id => id !== removeId);

        // Check if request are 0, then stop loading
        if(loadingRequest.length === 0)
            showLoading = false;
    }

    // Handler layer error
    function handleError({ e, id, name }) {

        // Stop loading if layer was loading
        stopLoading(id);

        // Emit error
        dispatch("error", e);

    }

    // Serialize map and layers
    function _serialize() {

        return JSON.stringify({
            map: {
                center: map.getCenter(),
                zoom: map.getZoom(),
                pitch: map.getPitch(),
                bearing: map.getBearing()
            },
            layers: layers.map(l => l.serialize())
        });

    }

    // Get linear gradient for legend
    function getLinearGradient(colors) {
        
        // Gradient
        let s = "";

        // Iterate over colors
        colors.forEach((c,i) => {

            // Gradient position
            let p = (100 / colors.length) * i;

            // Add color
            s += `${c} ${p}%, `;

        });

        // Remove last comma and space
        s = s.substring(0, s.length - 2);
        
        // Return gradient
        return `background: linear-gradient(90deg, ${s});`

    }

    // Get source list
    async function getSourcesList() {

        // Prepare params
        let p = new FormData();
        p.append("token", _user.token);

        // Fetch data from server
        let response = await NetworkUtils.getServerLettura("legenda_accuratezza", {
            method: "POST",
            body: p
        })

        // Check response code
        if(response.response_code !== 200)
            return "No info about sources";

        // Prepare result
        let s = "";

        // Iterate over keys
        Object.keys(response.result).forEach(k => s += `${k}: ${response.result[k].alias}, `);

        // Remove comma and spaces
        s = s.substring(0, s.length - 2);

        // Return result
        return s;

    }

    // Load component handler
    function loadComponent(config) {

        // Remove component from list
        removeComponent(config);

        // Push components to the list
        layersComponents = [...layersComponents, config];

    }


    // Remove component handler
    function removeComponent(config) {

        // Remove component from list
        layersComponents = layersComponents.filter(c => c?.id !== config?.id);

    }

    // Convert int to string
    function intToString(num) {
        num = num.toString().replace(/[^0-9.]/g, '');
        if (num < 1000) {
            return num;
        }
        let si = [
        {v: 1E3, s: "K"},
        {v: 1E6, s: "M"},
        {v: 1E9, s: "B"},
        {v: 1E12, s: "T"},
        {v: 1E15, s: "P"},
        {v: 1E18, s: "E"}
        ];
        let index;
        for (index = si.length - 1; index > 0; index--) {
            if (num >= si[index].v) {
                break;
            }
        }
        return (num / si[index].v).toFixed(2).replace(/\.0+$|(\.[0-9]*[1-9])0+$/, "$1") + si[index].s;
    };

</script>

<!-- Map container -->
<main>

    <!-- Map -->
    <div class="map" bind:this={mapRef}></div>

    <!-- Map overlay container -->
    <div class="map-overlay-container" style={getPointerPadding(padding)}>

        <!-- Slot -->
        <slot />

        <!-- Pointer -->
        {#if showPointer}
            <Icon class="black-text" spin={showLoading} size={pointerSize} path={mdiCrosshairs} />
        {/if}

        <!-- Legend -->
        <Overlay bind:active={showLegend}>

            <!-- Popup -->
            <div class="popup-legend {getBackground(_theme)} rounded elevation-1 pa-3">

                <!-- Handler layer changes -->
                {#key layers}
                
                    <!-- Iterate over layers -->
                    {#each [...layers].reverse() as l}

                        <!-- Layer legend -->
                        {@const legend = l.getLegend()}
    
                        <!-- Check if legend is valid-->
                        {#if legend}
                        
                            <!-- Layer info -->
                            <div class="text-body-1 d-flex">
                                
                                <!-- Name -->
                                <span>
                                    {l.getName()}
                                </span>

                                <!-- Spacer -->
                                <span style="flex-grow: 1;"></span>
                            
                                <!-- Measure unit -->
                                <span class="scale-unit">
                                    {legend?.measureUnit || ""}
                                </span> 

                            </div>
    
                            <!-- Check if scale is present -->
                            {#if legend?.scale}
                            
                                <!-- Scale -->
                                <div class="scale mt-2">
    
                                    <!-- Iterate over scale values -->
                                    {#each legend.scale as s, i}
    
                                        <!-- Scale element -->
                                        <div class="value {i === legend.scale.length - 1 ? "text-right" : ""} {i !== 0 && i !== legend.scale.length - 1 ? "text-center" : ""}">
                                            {intToString( s )}
                                        </div>
    
                                    {/each}
    
                                </div>
    
                            {/if}
    
                            <!-- Legend -->
                            <div class="legend rounded mt-2 mb-4" style="{getLinearGradient(legend.colors)}" />
    
                            <!-- Divider -->
                            <Divider class="mb-4" />
    
                        {/if}
                        
                    {/each}
            
                {/key}

                <!-- Sources list -->
                <div class="source-list mt-4">

                    <!-- Glossary title -->
                    <div class="text-body-1 mb-2">
                        Glossario
                    </div>

                    <!-- Downlaod sources list -->
                    {#await getSourcesList()}
                        ...
                    {:then list} 
                        {list}
                    {:catch e}
                        No info about sources
                    {/await}

                </div>

                <!-- Close button -->
                <Button outlined block class="primary-text mt-4" on:click={() => showLegend = false}>
                    Chiudi
                </Button>    

            </div>

        </Overlay>

    </div>

</main>

<!-- Iterate over layers components -->
{#each layersComponents as config}

    <!-- Layer component -->
    <svelte:component this={config?.component} data={config?.data} on:remove={() => removeComponent( config ) }/>

{/each}

<!-- Map style -->
<style>

    /* Map container */
    main {
        position: relative;
        width: 100%;
        height: 100%;
        flex: 1;
        background-color: #abcdef;
        display: flex;
        overflow: hidden;
    }

    /* Map */
    main > .map {
        flex: 1;
    }

    /* Map pointer container */
    .map-overlay-container {
        position: absolute;
        width: 100%;
        height: 100%;
        z-index: 10;
        top: 0;
        left: 0;
        display: grid;
        place-items: center;
        user-select: none;
        pointer-events: none;
    }

    /* Loading indicator */
    .loading-indicator {
        position: absolute;
        top: 16px;
        left: 16px;
    }

    /* Popup legend */
    .popup-legend {
        width: 95%;
        max-width: 400px;
        height: auto;
        max-height: 90%;
        overflow-y: auto;
    }

    /* Measure unit */
    .popup-legend .scale-unit {
        font-family: 'Courier New', Courier, monospace;
    }

    /* Scale */
    .popup-legend > .scale {
        width: 100%;
        height: auto;
        display: flex;
    }

    /* Scale value */
    .popup-legend > .scale > .value {
        flex: 1;
        font-family: 'Courier New', Courier, monospace;
        font-size: 12px;
    }

    /* Legend */
    .popup-legend > .legend {
        width: 100%;
        height: 22px;
    }

    /* Glossary */
    .popup-legend > .source-list {
        font-family: 'Courier New', Courier, monospace;
    }

    /* Maplibre popup fix */
    :global(.maplibregl-popup) {
        z-index: 0 !important;
    }

</style>