<svelte:head>

    <!-- Point in polygon method -->
    <script src="https://cdn.rawgit.com/hayeswise/Leaflet.PointInPolygon/v1.0.0/wise-leaflet-pip.js"></script>

</svelte:head>

<script>
    import { createEventDispatcher, onDestroy, onMount } from "svelte";
    import { getColor, getColorInverted, theme } from "../store/theme";
    import L from 'leaflet';
    import GhostLoader from "./GhostLoader.svelte";
    import NetworkUtils from "../utils/network_utils";
    import { fly } from "svelte/transition";
    import { quintOut } from "svelte/easing";
    import { Ripple, Icon } from "svelte-materialify/src";
    import { mdiClose, mdiCrosshairs, mdiMagnify, mdiMinus, mdiPlus } from "@mdi/js";
    import SearchBar from "./SearchBar.svelte";
    import { sendNotification } from '../store/notification';

    export let placeSelected = null;
    export let disabled = false;
    export let mandatory = false;
    export let hideName = false;
    export let controllerOnHover = false;
    export let classMap = "rounded";
    export let geolevel;

    // Dispatcher
    const dispatch = createEventDispatcher();

    // Constants
    const MAPTILER_ATTRIBUTION = '<a href="https://maptiler.com/?_gl=1*nltusw*_gcl_au*ODk3MzU4MDAyLjE3MDAwNDgyMjQ.*_ga*Mjk1NjExNzk2LjE3MDAwNDgyMjQ.*_ga_K4SXYBF4HT*MTcwMDA0ODIyMy4xLjEuMTcwMDA0ODM0Ni42MC4wLjA.">© MapTiler</a>';
    const SENSESQUARE_ATTRIBUTION = '<a href="https://sensesquare.eu">© Sense Square</a>';
    const MAP_PROVIDER = {
        light: "https://api.maptiler.com/maps/basic-v2-light/{z}/{x}/{y}.png?key=2LgFFGRIs3S6udTIh4Gs",
        dark: "https://api.maptiler.com/maps/streets-v2-dark/{z}/{x}/{y}.png?key=2LgFFGRIs3S6udTIh4Gs"
    };
    const FEATURES_COLORS = {
        light: "#607d8b",
        dark: "#eeeeee"
    };
    const SELECTED_FEATURES_COLORS = {
        light: "#009688",
        dark: "#64ffda"
    };
    const COORDINATE_REGEX = /^([-+]?)([\d]{1,2})(((\.)(\d+)(,)))(\s*)(([-+]?)([\d]{1,3})((\.)(\d+))?)$/g;

    // Map instance
    let map;

    // Tile layer
    let tileLayer;

    // Visible geojson
    let visibleGeojson = null;

    // Theme handler
    let _theme = "light";
    const unsubscribeTheme = theme.subscribe(val => {
    
        // Update theme value
        _theme = val;

        // Update map tiles
        tileLayer?.setUrl( MAP_PROVIDER[ _theme ] );

        // Update colors
        updateFeaturesColors();
    
    });

    // Disable handler
    $: disabled, disabled ? disableAllInteractions() : enableAllInteractions();

    // Place selected handler
    $: placeSelected, updateSelection();

    // Map reference
    let mapRef;

    // Is loading
    let isLoading = true;

    // Visible map path
    let visiblePath = null;

    // Visible geolevel
    let visibleGeolevel = 0;

    // Abort controller
    let abortController;

    // Check if is first start
    let isFirstStart = true;

    // Tooltip configuration
    let tooltipConfiguration = null;

    // Mouse position
    let mousePosition = null;

    // Container dimensions
    let containerWidth, containerHeight;

    // Show search dialog
    let showSearchDialog = false;

    // Is gps loading
    let isGpsLoading = false;

    // Show gps button
    let showGpsButton = true;

    // Visible marker
    let visibleMarker = null;

    // Show map controllers
    let showMapController = !controllerOnHover;

    // On component mount
    onMount(() => {

        // Init map
        map = new L.map(mapRef, {
            renderer: L.canvas(),
            center: [41.880458, 12.470133], 
            zoom: 5,
            zoomControl: false,
            doubleClickZoom: false
        });

        // Check if disabled
        if(disabled) {

            // Disable all interactions
            disableAllInteractions();

        }

        // Apply tiles
        applyTiles();

        // Check if should start the map handler
        if(typeof(geolevel) !== "number" || geolevel < 5) {

            // Check if place is provided
            if(placeSelected) {

                // First start
                firstStart();

            } else {

                // Update map
                updateMap();

                // Start map handler
                startMapHandler();

            }

        } else {

            // Check if point is selected
            if(placeSelected) {

                // Set visible marker
                visibleMarker = L.marker(placeSelected.center, { title: placeSelected.name });

                // Add marker to the map
                visibleMarker.addTo( map );

                // Fly to selected point
                map.flyTo(placeSelected.center, getZoomFromGeolevel( 4 ), {
                    animate: false
                });

            }

            // Start point handler
            map.on("click", handleMapClick);
            
            // Reset first start
            isFirstStart = false;

            // Stop loading
            isLoading = false;

        }

    });

    // On component destroy
    onDestroy(() => {

        // Remove all event listener from geojson layer
        visibleGeojson?.clearAllEventListeners();

        // Remove geojson layer
        visibleGeojson?.remove();

        // Destroy map
        map?.remove();

        // Unsubscribe to theme update
        unsubscribeTheme();

    });

    // Apply tiles to map
    function applyTiles() {

        // Apply tiles and set tile layer
        tileLayer = L.tileLayer( 
            MAP_PROVIDER[ _theme ], 
            { 
                attribution: MAPTILER_ATTRIBUTION
            }
        ).addTo(map);

    }

    // Start map handler
    function startMapHandler() {

        // Start update handler
        map.on("moveend", updateMap);
        map.on("zoomend", updateMap);

        // Start signal abort handler
        map.on("movestart", sendAbortSignal);
        map.on("zoomstart", sendAbortSignal);

    }

    // Start geojson handler
    function startGeojsonHandler() {

        // Mouse over features handler
        visibleGeojson.on("mouseover", showFeatureHover);
        visibleGeojson.on("mouseout", hideFeatureHover);

        // Mouse click on features handler
        visibleGeojson.on("click", featureClick);
        visibleGeojson.on("dblclick", featureDoubleClick);

    }

    // Handle map click for points
    function handleMapClick({ latlng }) {

        // Start loading
        isLoading = true;

        // Set point
        selectPoint(latlng)
        .catch(e => {

            // Send message to user
            sendNotification(e.message, 3000, "error");

            // Dispatch error
            dispatch("error", e);

            // Log error to console
            console.error(e);

        })
        .finally(() => {

            // Stop loading
            isLoading = false;

        });

    }

    // Send abort signal
    function sendAbortSignal() {

        // Send abort signal
        abortController?.abort();

    }

    // First start
    function firstStart() {

        // Prepare params
        let p = new FormData();

        // Geolevel to use
        let useGeolevel = typeof(geolevel) === "number" ? (placeSelected.geolevel <= geolevel ? placeSelected.geolevel : geolevel) : placeSelected.geolevel;

        // Download geojson
        NetworkUtils.getGeoPromise(placeSelected.path, useGeolevel, p)
        .then(geojson => {

            // Init geojson layer group
            visibleGeojson = L.geoJSON(geojson, {
                attribution: SENSESQUARE_ATTRIBUTION
            });

            // Start hover handler
            startGeojsonHandler();

            // Update visible geolevel
            visibleGeolevel = useGeolevel;

            // Update visible path
            visiblePath = placeSelected.path;

            // Iterate over layers
            for(const [ID, layer] of Object.entries( visibleGeojson.getLayers() )) {

                // Check if layer contains the point
                if(layer.feature.properties.name === placeSelected.path[ getGeolevelKey( useGeolevel ) ]) {

                    // Move map to the desired location
                    map.fitBounds(layer.getBounds(), {
                        maxZoom: getZoomFromGeolevel( useGeolevel )
                    });

                    // Exit loop
                    break;

                }

            }

            // Update feature colors
            updateFeaturesColors();

            // Add layer to the map
            visibleGeojson.addTo( map );

        })
        .finally(() => {

            // Start map handler
            startMapHandler();

            // Reset first start
            isFirstStart = false;

            // Stop loading
            isLoading = false;

        });

    }

    // Update map
    function updateMap() {

        // Init abort controller
        abortController = new AbortController();

        // Show loading
        isLoading = true;

        // Get map center
        let center = map.getCenter();

        // Get map geolevel
        let _geolevel = typeof(geolevel) === "number" ? (getGeoLevel() <= geolevel ? getGeoLevel() : geolevel) : getGeoLevel();

        // Get geojson data
        getGeojsonData(center, _geolevel)
        .then(result => {

            // Check result
            if(!result)
                return;

            // Reset tooltip
            tooltipConfiguration = null;

            // Expand infos
            const { geojson, path, geolevel } = result;

            // Check if geojson is already intialized
            if(visibleGeojson !== null) {

                // Clear all layers
                visibleGeojson.clearLayers();

            } else {

                // Init geojson layer group
                visibleGeojson = L.geoJSON();

                // Start hover handler
                startGeojsonHandler();

                // Add layer to the map
                visibleGeojson.addTo( map );

            }

            // Update visible path
            visiblePath = path;

            // Update visible geolevel
            visibleGeolevel = geolevel;

            // Add layer to map
            visibleGeojson.addData( geojson );

            // Update colors
            updateFeaturesColors();


        })
        .catch(e => {

            // Check type of error
            if(!(e instanceof DOMException)) {

                // Log error
                console.error( e );

                // Send message to user
                sendNotification(e.message, 3000, "error");

                // Dispatch error
                dispatch("error", e);

            }

        })
        .finally(() => {

            // Reset first start
            isFirstStart = false;

            // Hide loading indicator
            isLoading = false;

        });

    }

    // Get geojson to show
    async function getGeojsonData(point, geolevel) {

        // Check geolevel and if is inside polygon
        if(visibleGeolevel === geolevel && isInsidePolygon( point )) {

            // No update is required
            return null;

        }

        // Prepare params
        let p = new FormData();

        // Download path
        let path = await NetworkUtils.geodecode(point.lat, point.lng, geolevel - 1, p, abortController.signal);
        
        // Check if there is an error
        if(path.hasOwnProperty("error")){

            // Throw error
            throw Error(path.error);

        }

        // Check if same path
        if(isSamePath(visiblePath, path)) {

            // Return null because the path is already shown on the map
            return null;

        }

        // Downlaod geojson
        let geojson = await NetworkUtils.getGeoPromise(path, getGeoLevel(), p, abortController.signal);

        // Return geojson
        return { geojson, path, geolevel };

    }

    // Check if point is inside loaded polygon
    function isInsidePolygon(point) {

        // Check if there is a geojson loaded
        if(!visibleGeojson) {

            // Return false because there is no geojson loaded
            return false;

        }

        // Iterate over layers
        for(const layer of Object.entries( visibleGeojson.getLayers() )) {

            // Check if layer contains the point
            if(layer[ 1 ].contains( point ))
                return true;

        }

        // Return false as a fallback
        return false;

    }

    // Get geolevel from map zoom
    function getGeoLevel(zoom=map.getZoom()) {

        // Check if zoom is less then 6 -> Nazioni
        if(zoom < 6)
            return 0;

        // Check if zoom is between 6 and 9 -> Regioni
        if(zoom < 9)
            return 1;

        // Check if zoom is between 9 and 11 -> Province
        if(zoom < 11)
            return 2;

        // Check if zoom is between 11 and 13 -> Comuni
        if(zoom < 13)
            return 3;

        // Zoom is higher then 13 -> Square
        return 4;
    }

    // Get path key from geolevel
    function getZoomFromGeolevel(geolevel) {

        // Switch handler
        switch(geolevel) {

            // Nazione
            case 0:
                return 3;

            // Regione
            case 1:
                return 6;

            // Provincia
            case 2:
                return 9;

            // Comune
            case 3:
                return 11;

            // Square
            case 4:
                return 13;

            // Device
            case 5:
                return 13;

            // Fallback
            default:
                return 0;

        }

    }

    // Check if path is the same
    function isSamePath(p1, p2, skipGeolevel=false) {

        // Check if are both objects
        if(!p1 || !p2 || typeof(p1) !== "object"|| typeof(p2) !== "object") {

            // Return false as a fallback
            return false;

        }

        // Check if same number of keys
        if(!skipGeolevel && Object.keys( p1 ).length !== Object.keys( p2 ).length)
            return false;

        // Iterate over p1 keys
        for(const [key, val] of Object.entries( p1 )) {

            // Check if values are not the same
            if(val !== p2?.[key]) {

                // Return false because the values are different
                return false;

            }

        }

        // Return true because the for check went fine
        return true;

    }

    // Update selection
    function updateSelection() {

        // Check map
        if(!map)
            return;

        // Check if geolevel is less then 5
        if(typeof(geolevel) !== "number" || geolevel < 5) {

            // Update features colors
            updateFeaturesColors();

        } else if (geolevel === 5) {

            // Remove old marker
            visibleMarker?.remove?.();

            // Set visible marker
            visibleMarker = L.marker(placeSelected?.center, { title: placeSelected?.path?.squareID });

            // Add marker to the map
            visibleMarker?.addTo?.( map );

        }

        // Fly to selected point
        map.flyTo(placeSelected?.center, getZoomFromGeolevel( placeSelected?.geolevel ));

    }

    // Update features colors
    function updateFeaturesColors() {

        // Iterate over features
        visibleGeojson?.setStyle?.(feature => {

            // Prepare path
            let p = { ...visiblePath };

            // Add feature name
            p[ getGeolevelKey( visibleGeolevel ) ] = feature.properties.name;

            // Check if place is selected
            let isSelected = placeSelected?.geolevel === visibleGeolevel && isSamePath(p, placeSelected?.path);

            // Set color
            let color = isSelected ? SELECTED_FEATURES_COLORS[ _theme ] : FEATURES_COLORS[ _theme ];

            // Return style for the feature
            return { fillColor: color, color: color, weight: isSelected ? 2 : 1, fillOpacity: isSelected ? .4 : .2 };

        });

    }

    // Get path key from geolevel
    function getGeolevelKey(geolevel) {

        // Switch handler
        switch(geolevel) {

            // Nazione
            case 0:
                return "nazione";

            // Regione
            case 1:
                return "regione";

            // Provincia
            case 2:
                return "provincia";

            // Comune
            case 3:
                return "comune";

            // Square
            case 4:
                return "squareID";

            // Fallback
            default:
                return null;

        }

    }

    // Show feature hover
    function showFeatureHover(event) {

        // Check if component is disabled
        if(disabled)
            return;

        // Prepare path
        let p = { ...visiblePath };

        // Add feature name
        p[ getGeolevelKey( visibleGeolevel ) ] = event.layer.feature.properties.name;

        // Check if place is selected
        let isSelected = placeSelected?.geolevel === visibleGeolevel && isSamePath(p, placeSelected?.path);

        // Set color
        let color = isSelected ? SELECTED_FEATURES_COLORS[ _theme ] : ( _theme === "light" ? "#000000" : "#ffffff" );

        // Set stroke
        event.layer.setStyle({ fillColor: color, color: color, weight: 3 });

        // Show tooltip
        tooltipConfiguration = { name: event.layer.feature.properties.name, isSelected };

    }

    // Hide feature hover
    function hideFeatureHover(event) {

        // Check if component is disabled
        if(disabled)
            return;

        // Prepare path
        let p = { ...visiblePath };

        // Add feature name
        p[ getGeolevelKey( visibleGeolevel ) ] = event.layer.feature.properties.name;

        // Check if place is selected
        let isSelected = placeSelected?.geolevel === visibleGeolevel && isSamePath(p, placeSelected?.path);

        // Set color
        let color = isSelected ? SELECTED_FEATURES_COLORS[ _theme ] : FEATURES_COLORS[ _theme ];
        
        // Unset stroke
        event.layer.setStyle({ fillColor: color, color: color, weight: isSelected ? 2 : 1 });

        // Hide tooltip
        tooltipConfiguration = null;

    }

    // On feature mouse click handler
    function featureClick(event) {

        // Check if component is disabled
        if(disabled)
            return;

        // Get layer
        const { latlng, layer } = event;
        
        // Reset tooltip
        tooltipConfiguration = null;

        // Prepare path
        let p = { ...visiblePath };

        // Add feature name
        p[ getGeolevelKey( visibleGeolevel ) ] = layer.feature.properties.name;

        // Check if is selectable
        if(typeof(geolevel) !== "number" || geolevel === visibleGeolevel) {

            // Check if place is selected
            if(placeSelected?.geolevel === visibleGeolevel && isSamePath(p, placeSelected?.path)) {

                // Cancel selection
                cancelSelection();

            } else {

                // Update selected place
                placeSelected = {
                    name: layer.feature.properties.name,
                    path: p,
                    geolevel: visibleGeolevel,
                    center: event.latlng,
                    zoom: map.getZoom(),
                    bounds: getBoundingBox( layer )
                };

                // Update colors handler
                updateFeaturesColors();

                // Dispatch event
                dispatch("change", placeSelected);

            }

        } else {

            // Move map to the clicked upon layer
            featureDoubleClick( event );

        }

    }

    // Handle double on top of a feature
    function featureDoubleClick(event) {

        // Check visible geolevel
        if(visibleGeolevel === 4)
            return;

        // Move map to the clicked upon layer
        map.flyTo(event.latlng, getZoomFromGeolevel( visibleGeolevel + 1 ));

    }

    // Update mouse position
    function updateMousePosition(event) {

        // Get bounding client position
        let positionContainer = mapRef?.getBoundingClientRect();

        // Update mouse position
        mousePosition = {
            x: event.clientX - (positionContainer?.x ?? positionContainer?.left),
            y: event.clientY - (positionContainer?.y ?? positionContainer?.top)
        };

    }

    // Disable all interactions
    function disableAllInteractions() {

        map?.dragging.disable();
        map?.touchZoom.disable();
        map?.doubleClickZoom.disable();
        map?.scrollWheelZoom.disable();
        map?.boxZoom.disable();
        map?.keyboard.disable();
        map?.tap?.disable?.();

    }

    // Enable all interactions
    function enableAllInteractions() {

        map?.dragging.enable();
        map?.touchZoom.enable();
        map?.doubleClickZoom.enable();
        map?.scrollWheelZoom.enable();
        map?.boxZoom.enable();
        map?.keyboard.enable();
        map?.tap?.enable?.();

    }

    // Cancel selection
    function cancelSelection() {

        // Check if is mandatory
        if(!mandatory && !disabled) {

            // Remove selected place
            placeSelected = null;

            // Check if is point or path
            if(geolevel !== 5) {

                // Update colors handler
                updateFeaturesColors();

            } else {

                // Remove marker
                visibleMarker?.remove?.();

            }

            // Dispatch event
            dispatch("change", placeSelected);

        }

    }

    // Set bound for the map
    function viewPosition(e) {

        // Get detail about selected place
        let info = e.detail.value;

        // Check if is coordinates or bounds
        if(info?.hasOwnProperty("lat")) {

            // Handle click on top of map
            handleMapClick({
                latlng: { lat: info.lat, lng: info.lon }
            });

        } else {

            // Prepare bounds
            let bounds = [[parseFloat(info[0]), info[2]], [parseFloat(info[1]), info[3]]];

            // Fly to selected place
            map.flyToBounds(bounds, { duration: 1 });

        }

    }

    // View gps point
    function viewGpsPosition() {

        // Start gps loading
        isGpsLoading = true;

        // Get current position
        navigator.geolocation.getCurrentPosition(pos => {
            
            // Check if is point
            if(geolevel === 5) {

                // Handle click on top of map
                handleMapClick({
                    latlng: { lat: pos.coords.latitude, lng: pos.coords.longitude }
                });

            } else {

                // Fly to user position
                map.flyTo({
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude
                }, getZoomFromGeolevel( geolevel || 4 ));

            }

            // Stop gps loading
            isGpsLoading = false;
                
        }, e => {

            // Log error
            console.error(e);

            // Stop gps loading
            isGpsLoading = false;

            // Hide gps button
            showGpsButton = false;

        }, {
            timeout: 10000
        });

    }

    // Select a point
    async function selectPoint(point) {

        // Prepare params
        let p = new FormData();

        // Geodecode position
        let geodecode = await NetworkUtils.geodecode(point.lat, point.lng, 4, p);

        // Check if there is an error
        if(geodecode.hasOwnProperty("error")){

            // Throw error
            throw Error(geodecode.error);

        }

        // Check geolevel for the marker
        if(geolevel === 5) {

            // Remove old marker
            visibleMarker?.remove?.();

            // Set visible marker
            visibleMarker = L.marker(point, { title: geodecode.squareID });

            // Add marker to the map
            visibleMarker.addTo( map );

        }

        // Fly to selected point
        map.flyTo(point, getZoomFromGeolevel( 4 ));

        // Update selected place
        placeSelected = {
            name: geodecode.squareID,
            path: {
                ...geodecode,
            },
            zoom: map.getZoom(),
            center: point,
            geolevel: getGeoLevel()
        };

        // Dispatch event
        dispatch("change", placeSelected);
    
    }

    // Mouse enter map container
    function mouseEnterMapContainer() {

        // Check if controller on hover is enabled
        if(controllerOnHover) {

            // Show controller
            showMapController = true;

        }

    }

    // Mouse leave map container
    function mouseLeaveMapContainer() {

        // Check if controller on hover is enabled
        if(controllerOnHover) {

            // Hide controller
            showMapController = false;

        }

    }

    // Get bounding box
    function getBoundingBox(layer) {

        // Init result
        let result = [];

        // get bounds
        let bounds = layer.getBounds();

        // Push the two coordinates
        result.push(bounds.getNorthEast());
        result.push(bounds.getSouthWest());

        // Return result
        return result;
    }

</script>

<!-- Main container -->
<main class="{getColor(_theme)} {classMap}" on:mouseenter={mouseEnterMapContainer} on:mouseleave={mouseLeaveMapContainer} on:mousemove={updateMousePosition} bind:clientWidth={containerWidth} bind:clientHeight={containerHeight}>

    <!-- Map -->    
    <div 
        bind:this={mapRef} 
        class="map" 
    />

    <!-- Overlay -->
    <div class="overlay">

        <!-- Check if place is selected -->
        {#if !hideName && placeSelected}
        
            <!-- Selected place indicator -->
            <button class="selected-place primary-color white-text" transition:fly|local={{ delay: 0, duration: 300, x: 0, y: 50, opacity: 0, easing: quintOut }} use:Ripple on:click={cancelSelection}>
                
                <!-- Content -->
                <div>

                    <!-- Check if is mandatory -->
                    {#if !mandatory && !disabled}
                    
                        <!-- Icon container -->
                        <div>
        
                            <!-- Close icon -->
                            <Icon path={mdiClose} class="white-text" size={16} />
    
                        </div>

                    {/if}

                    <!-- Text container -->
                    <div>
                        {placeSelected?.name}
                    </div>

                </div>

            </button>

        {/if}

        <!-- Check if is disabled -->
        {#if !disabled && showMapController}
        
            <!-- Map controller -->
            <div class="right-side map-controller {getColor(_theme)}" transition:fly|local={{ delay: 0, duration: 300, x: 50, y: 0, opacity: 0, easing: quintOut }}>
                    
                <!-- Button -->
                <button class="action" use:Ripple on:click={() => map?.zoomIn()}>

                    <!-- Icon -->
                    <Icon path={mdiPlus} size={16} />

                </button>

                <!-- Button -->
                <button class="action" use:Ripple on:click={() => map?.zoomOut()}>

                    <!-- Icon -->
                    <Icon path={mdiMinus} size={16} />

                </button>

                <!-- Button -->
                <button class="action" use:Ripple on:click={() => showSearchDialog = true}>

                    <!-- Icon -->
                    <Icon path={mdiMagnify} size={16} />

                </button>

                <!-- Check if the user should see the gps button -->
                {#if 'geolocation' in navigator && showGpsButton}

                    <!-- Button -->
                    <button class="action" use:Ripple on:click={viewGpsPosition}>

                        <!-- Icon -->
                        <Icon path={mdiCrosshairs} size={16} />

                        <!-- Check if is gps loading -->
                        {#if isGpsLoading}
                        
                            <!-- Ghost loader -->
                            <GhostLoader />

                        {/if}

                    </button>

                {/if}

            </div>

        {/if}

    </div>

    <!-- Check if tooltip should be visible -->
    {#if tooltipConfiguration && mousePosition}
    
        <!-- Tooltip overlay -->
        <div class="tooltip-overlay {tooltipConfiguration.isSelected ? "primary-color white-text" :  `${getColorInverted(_theme)} ${getColor(_theme)}-text`}" style="left: {mousePosition?.x}px; top: {mousePosition?.y}px;">
            {tooltipConfiguration?.name}
        </div>

    {/if}

    <!-- Check if should show loading overlay -->
    {#if isLoading}
    
        <!-- Loading overlay -->
        <div class="loading-overlay {isFirstStart ? getColor(_theme) : ""}" {isFirstStart}>

            <!-- Ghost loader -->
            <GhostLoader />
    
        </div>

    {/if}

    <!-- Search dialog -->
    <SearchBar 
        bind:active={showSearchDialog}
        getOptions={async (s) => {

            // Search for the query on nominatim
            let result = await NetworkUtils.getNominatim("search", {
                format: "json",
                q: s
            });

            // Get list
            result = result.map(o => {
                return {key: o.display_name, value: o.boundingbox};
            });

            // Check if s is coordinate
            if(COORDINATE_REGEX.test( s )) {

                // Get coordinates
                let coordinates = s.split(",").map(s => parseFloat( s ));

                // Update result
                result = [{ key: s, value: { lat: coordinates[0], lon: coordinates[1] } }, ...result];

            }

            // Return result
            return result;

        }}
        on:select={viewPosition}
    />

</main>

<style>

    /* Main container */
    main {
        position: relative;
        flex: 1;
        width: 100%;
        height: 100%;
        overflow: hidden;
    }

    /* Map */
    main > .map {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        z-index: 0;
    }

    /* Overlay */
    main > .overlay {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        pointer-events: none;
        z-index: 1;
    }

    /* Overlay, selected place */
    main > .overlay > .selected-place {
        position: absolute;
        width: max-content;
        height: auto;
        padding: 6px;
        font-size: 12px;
        bottom: 6px;
        left: 50%;
        transform: translateX(-50%);
        border-radius: 16px;
        border: 1px solid var(--theme-dividers) !important;
        pointer-events: all;
    }

    /* Overlay, map left side */
    main > .overlay > .left-side {
        top: 6px;
        left: 6px;
    }

    /* Overlay, map right side */
    main > .overlay > .right-side {
        top: 6px;
        right: 6px;
    }

    /* Overlay, map controller */
    main > .overlay > .map-controller {
        position: absolute;
        width: auto;
        height: auto;
        border-radius: 9px;
        pointer-events: all;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        border: 1px solid var(--theme-dividers) !important;
    }

    /* Overlay, map controller, first action */
    main > .overlay > .map-controller > .action:first-child {
        border-top-right-radius: 9px;
        border-top-left-radius: 9px;
    }

    /* Overlay, map controller, last action */
    main > .overlay > .map-controller > .action:last-child {
        border-bottom-right-radius: 9px;
        border-bottom-left-radius: 9px;
    }

    /* Overlay, map controller, actions */
    main > .overlay > .map-controller > .action {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid var(--theme-dividers) !important;
    }

    /* Overlay, selected place, Content */
    main > .overlay > .selected-place > div{
        display: flex;
    }

    /* Overlay, selected place childs */
    main > .overlay > .selected-place > div > div {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 3px;
    }

    /* Tooltip overlay */
    main > .tooltip-overlay {
        position: absolute;
        width: max-content !important;
        height: auto;
        padding: 6px;
        font-size: 12px;
        top: 0;
        left: 0;
        z-index: 2;
        pointer-events: none;
        border-radius: 16px;
        transition: 1 ease all;
        border: 1px solid var(--theme-dividers) !important;
        transform: translateX(-50%) translateY(60%);
        overflow: hidden;
    }

    /* Loading overlay */
    main > .loading-overlay {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        z-index: 3;
        pointer-events: none;
    }

    /* Loading overlay when is first start */
    main > .loading-overlay[isFirstStart = true] {
        pointer-events: all;
    }

</style>