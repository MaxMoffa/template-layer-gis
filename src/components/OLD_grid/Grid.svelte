<svelte:window on:resize={updateGridAfterResize} />

<script>

    import { onMount, onDestroy } from "svelte";
    import { createEventDispatcher } from 'svelte';
    import ScreenshotDialog from '../ScreenshotDialog.svelte';
    import ErrorGrid from './ErrorGrid.svelte';
    import { Icon, ProgressCircular } from 'svelte-materialify/src';
    import { mdiAlertCircle } from '@mdi/js';
    import * as WidgetIndex from "../../widgets/index";
    import domtoimage from 'dom-to-image';
    import gridHelp from "svelte-grid/build/helper/index.mjs";
    import Configurator from "../Configurator/Configurator.svelte";

    // Dispatch a custom event
    const dispatch = createEventDispatcher();

    // Starting witdth
    let main;
    let width_main = null;

    export let token = null;
    export let apikey = null;
    export let items = null;
    export let newItems = null;
    export let rowHeight = 70;
    export let cols = 10;
    export let modifyMode = false;
    export let width = "80%";
    export let parent = null;
    export let contextMenuCustom = true;
    export let dictionary =  new LangUtils("en", {}); 
    export let isGridCustomizable = true;

    //TODO: verificare l'utilità
    export let fastStart = true;

    // Grid instance
    let GRID = null;

    // Grid events trigger
    let OFF_GRID_SETUP = null;
    let OFF_GRID_UPDATE = null;
    let OFF_GRID_MODIFY = null;
    let OFF_GRID_SCREENSHOT = null;

    // Grid reference
    let GRID_REF = null;

    // Timeout grid update resize
    let _gridResizeUpdate = null;

    // Screenshot dialog
    let showScreenshotDialog = false;
    let img = null;

    // Widget configurator
    let optionsDataItem = null;

    // Items elaborated with missing information
    let itemsElaborated = null;

    // Error while preparing the grid
    let errorGrid = null;

    // Verify if grid is getting ready
    let isGridGettingReady = false;

    // Verify if grid update
    let isGridUpdate = false;

    // Animation grid handler
    let animationGrid = "";

    // Check first start modifyMode
    let isFirstTimeModifyMode = true;

    // Skip update
    let skipUpdate = true;

    // Update grid if items change
    $: items, updateGrid();

    // Update grid modify mode status
    $: modifyMode, updateModifyMode();

    // Add new widgets
    $: newItems, addNewItems();

    onMount(() => {

        // Set starting grid width
        width_main = main.offsetWidth;
        
    })

    // Destroy grid if component is being destroyed
    onDestroy(() => {

        destroyGrid();

        parent = null;
        GRID_REF = null;
        main = null;

    })

    // Update the grid after a resize of the window
    function updateGridAfterResize() {

        // Skip if vertical resize
        if(width_main === main.offsetWidth)
            return;

        // Update main width
        width_main = main.offsetWidth;

        // Clear the old timeout (if exist)
        clearTimeout(_gridResizeUpdate);

        // Destroy grid while resizing the window
        destroyGrid();

        // Create a new timeout
        _gridResizeUpdate = setTimeout(() => {
            loadGrid();
        }, 1000);

    }

    // Update modify mode prop to grid (if exist)
    function updateModifyMode() {

        if(isFirstTimeModifyMode) {
            isFirstTimeModifyMode = false;
            return;
        }

        console.log("UPDATE MODIFY MODE");

        if(GRID !== null && itemsElaborated !== null){

            // Send an update (if is not modify mode)
            if(!modifyMode){
                console.log("SAVE", itemsElaborated);
                items = simplifyGrid(itemsElaborated);
                isGridUpdate = true;
                dispatch("update", items);
            }

            console.log("modifyMode", modifyMode);

            // Update all the items
            let _items = itemsElaborated.map(item => {

                // Switch item between modes
                item = {
                    ...item,
                    [cols]: {
                        ...item[cols],
                        fixed: !modifyMode,
                        resizable: modifyMode,
                        draggable: modifyMode
                    }
                };

                return item;

            });

            // Update mode
            GRID.$set({
                modifyMode,
                items: _items
            });

        }

    }

    // Support function, _updateGrid()
    function updateGrid() {
        
        _updateGrid()
        .then(() => {

            console.log("GRID LOADED");

        })
        .catch(e => {
            
            // Load error information
            errorGrid = e;

        });

    }

    // Update the grid, destroy the older instance and create a new one
    async function _updateGrid() {

        console.log("test0");

        if(skipUpdate){
            skipUpdate = false;
            return;
        }    

        console.log("test1");

        if(items === null || (Array.isArray(items) && items.length === 0)){
            destroyGrid();
            itemsElaborated = null;
            isGridUpdate = false;
            return;
        }

        console.log("test2");

        // Verify if grid is getting an update
        if(isGridUpdate){
            isGridUpdate = false;
            return;
        }

        console.log("test3");

        // Verify if grid is already getting ready
        if(isGridGettingReady)
            return;

        console.log("UPDATE GRID");

        // Grid is getting ready
        isGridGettingReady = true;

        // Destroy old grid instance (if exist)
        destroyGrid();

        // Reset the elaborated items
        itemsElaborated = null;

        // Prepare the new grid
        try {
         
            let gridItems = await prepareGrid(items);

            console.log("UPDATE -> ", gridItems);
            itemsElaborated = gridItems;

            // Create a new grid instance
            loadGrid();
            
        } catch (error) {
            
            // Load error information
            console.log(error);
            errorGrid = error;

        }

        // Grid has ended preparation
        isGridGettingReady = false;

        return;
        
    }

    // Load grid on the page
    function loadGrid() {

        // Check if grid alread initialised and grid reference is ready
        if(GRID !== null || GRID_REF === null)
            return;
        
        // Check if token or apikey are present
        if(!token  && !apikey)
            return;

        // Check if items is a false value
        if(!items || !itemsElaborated)
            return;
        
        // Check if items is an array
        if(!Array.isArray(items))
            return

        // Check if array is empty
        if(items.length === 0)
            return;

        console.log("LOAD GRID");
        let container = getContainer();

        // Create a new grid instance
        GRID = new ErrorGrid({
            target: GRID_REF,
            props: {
                token,
                apikey,
                rowHeight,
                cols,
                fastStart,
                modifyMode,
                width,
                contextMenuCustom,
                dictionary,
                isGridCustomizable,
                items: itemsElaborated,
                parent: container,
            }
        });

        // Detect setup in the grid
        OFF_GRID_SETUP = GRID.$on("setup", e => {

            console.log("SETUP");
            itemsElaborated = e.detail.items;

        });

        // Detect update in the grid
        OFF_GRID_UPDATE = GRID.$on("update", e => {

            itemsElaborated = e.detail.items;

            dispatch("change");

            // Send an update (if is not modify mode)
            if(!modifyMode){
                skipUpdate = e.detail.isLocal;
                items = simplifyGrid(itemsElaborated);
                isGridUpdate = true;
                dispatch("update", items);
            }

        });

        // Detect modify request
        OFF_GRID_MODIFY = GRID.$on("modify", e => {

            optionsDataItem = e.detail;

        });

        // Detect screenshot request
        OFF_GRID_SCREENSHOT = GRID.$on("screenshot", e => {

            getScreen(e.detail);

        });

    }

    // Destroy the instance of the widget (if exist)
    function destroyGrid() {
        if(GRID !== null){

            // Turno off events
            if(OFF_GRID_SETUP !== null)
                OFF_GRID_SETUP();
            if(OFF_GRID_UPDATE !== null)
                OFF_GRID_UPDATE();
            if(OFF_GRID_MODIFY !== null)
                OFF_GRID_MODIFY();
            if(OFF_GRID_SCREENSHOT !== null)
                OFF_GRID_SCREENSHOT();

            // Destroy widget
            GRID.$destroy();

            // Reset variables
            GRID = null;
            OFF_GRID_SETUP = null;
            OFF_GRID_UPDATE = null;
            OFF_GRID_MODIFY = null;
            OFF_GRID_SCREENSHOT = null;

            console.log("GRID DESTROYED");
        }
    }

    // Load widget inside the grid
    async function prepareGrid(rawGrid) {

        if(itemsElaborated !== null)
            return itemsElaborated;

        console.log("PREPARE GRID");

        // Transform string into json
        let items = typeof(rawGrid) === "object" ? rawGrid : JSON.parse(rawGrid);

        let result = [];

        // Add the widget class
        for(let item of items){

            result.push(await prepareWidget(item));

        }

        return result;
    }

    // Prepare the widget with the missing informations
    async function prepareWidget(item) {
        let widgetInfo = await WidgetIndex.getWidgetInfo(item.propreties.WIDGET_ID);
        item = {
            ...item,
            [cols]: {
                ...item[cols],
                fixed: !modifyMode,
                resizable: modifyMode,
                draggable: modifyMode,
                max: widgetInfo.propreties.WIDGET_MAX_DIMENSION,
                min: widgetInfo.propreties.WIDGET_MIN_DIMENSION,
                customResizer: true
            },
            state: item.hasOwnProperty("state") ? item.state : widgetInfo.propreties.DEFAULT_CONFIGURATION,
            widget: widgetInfo.widget,
            propreties: widgetInfo.propreties
        };

        if(item.hasOwnProperty("state") && item.state && typeof(item.state) === "object" && !item.state.hasOwnProperty("_timer_refresh"))
            item.state._timer_refresh = -1;

        if(item.hasOwnProperty("state") && item.state && Object.keys(item.state).length-1 < Object.keys(widgetInfo.propreties.DEFAULT_CONFIGURATION).length){
            Object.keys(widgetInfo.propreties.DEFAULT_CONFIGURATION).forEach(k => {
                if(!item.state.hasOwnProperty(k))
                    item.state[k] = widgetInfo.propreties.DEFAULT_CONFIGURATION[k];
            });
        }

        return item;
    }

    // Get the container to use as reference
    function getContainer() {
        return parent ? parent : GRID_REF;
    }

    // Create a screenshot for a widget
    function getScreen(node, width=null, height=null) {
        img = null;
        showScreenshotDialog = true;
        document.querySelectorAll(".hide").forEach(node => {
            node.style.visibility = "hidden";
        });
        if(width)
            node.style.width = width;
        if(height)
            node.style.height = height;
        domtoimage.toPng(node)
        .then(function (dataUrl) {
            img = dataUrl;
        })
        .catch(function (error) {
            console.error('oops, something went wrong!', error);
        })
        .finally(() => {
            if(width)
                node.style.width = "100%";
            if(height)
                node.style.height = "100%";      
            document.querySelectorAll(".hide").forEach(node => {
                node.style.visibility = "visible";
            });     
        });
    }

    // Remove components from grid
    function simplifyGrid(grid) {

        if(!grid)
            return [];

        // Clone the grid
        let cloneItems = JSON.parse(JSON.stringify(grid));

        // Remove properties and widget component
        let items = cloneItems.map(item => {
            delete item.widget;
            // delete item.propreties; TODO: conservare l'id del widget invece delle properties
            return item;
        });

        return items;

    }

    // Add new items
    async function addNewItems() {
        if(newItems !== null && Array.isArray(newItems)){

            console.log("ADDING NEW ITEMS");

            if(GRID !== null){

                let newItemsElaborated = [];

                while(newItems.length > 0){

                    let item = newItems.pop();

                    try {
                        
                        // Find a new spot for the widget
                        let findOutPosition = gridHelp.findSpace(item, itemsElaborated, cols);

                        // Update the new item
                        item = {
                            ...item,
                            [cols]: {
                            ...item[cols],
                            ...findOutPosition,
                            },
                        };

                        newItemsElaborated.push(item);

                    } catch (error) {

                        console.log(error);

                    }

                }

                itemsElaborated = [...itemsElaborated, ...newItemsElaborated];

                console.log(itemsElaborated);

                // Update items
                GRID.$set({
                    items: itemsElaborated
                });

            } else {

                items = [...newItems];
                
                // Prepare the new grid
                prepareGrid(items)
                .then(gridItems => {

                    itemsElaborated = gridItems;

                    // Create a new grid instance
                    loadGrid();

                })
                .catch(e => {

                    // Load error information
                    errorGrid = e;

                })
                .finally(() => {

                    // Grid has ended preparation
                    isGridGettingReady = false;

                });

                // Send an update (if is not modify mode)
                if(!modifyMode){
                    isGridUpdate = true;
                    dispatch("update", items);
                }
            }

            newItems = null;

        }
    }

</script>

<!-- Grid container -->
<main bind:this={main}>

    <!-- Grid -->
    <div class="grid {animationGrid}" bind:this={GRID_REF}>

        <!-- Grid element is not ready -->
        {#if GRID === null}

            <div class="grid-info center-content">

                {#if (items !== null && !Array.isArray(items)) || errorGrid !== null}

                    <!-- Grid error -->
                    <div class="content-card">
                        <div class="pa-6 center-content">
                            <Icon size={64} path={mdiAlertCircle} />
                        </div>
                        {#if errorGrid !== null}
                            <div class="text-center">
                                {errorGrid}
                            </div>
                        {/if}
                    </div>

                {:else if (Array.isArray(items) && items.length === 0) || (Array.isArray(itemsElaborated) && itemsElaborated.length === 0)}

                    <!-- Grid empty -->
                    <div class="content-card">
                        <div class="pa-6 center-content">
                            <img src="/media/grape_pack/drawkit-grape-pack-illustration-7.svg" height="300" alt="Empty">
                        </div>
                        <div class="text-center">
                            {dictionary.getString("emptyGridError")}
                        </div>
                        <div class="center-content pt-3">
                            <slot name="empty"/>
                        </div>
                    </div>

                {:else}

                    <!-- Grid is loading -->
                    <ProgressCircular size="64" color="primary" indeterminate />

                {/if}

            </div>

        {/if}

    </div>

    <!-- Widget configurator -->
    <Configurator 
        active={optionsDataItem !== null && isGridCustomizable}
        state={optionsDataItem?.state} 
        widgetId={optionsDataItem?.propreties.WIDGET_ID}
        dict={dictionary}
        {apikey}
        {token} 
        on:saveState={(e) => {

            console.log("PROVOLONE", e.detail);
            
            optionsDataItem.state = e.detail;
            optionsDataItem = null;

            console.log("PRE-SAVE", itemsElaborated);

            if(!modifyMode){
                console.log("UPDATEEEEE");
                
                items = simplifyGrid(itemsElaborated);
                isGridUpdate = true;
                dispatch("update", items);
            }

        }}
    />

    <!-- Screenshot dialog -->
    <ScreenshotDialog image={img} bind:active={showScreenshotDialog} />

</main>

<style>

    /* Grid container */
    main {
        /* position: absolute; */
        width: 100%;
        height: auto;
        top: 0;
        left: 0;
    }

    /* Grid */
    main > .grid {
        /* position: absolute; */
        width: 100%;
        height: auto;
        top: 0;
        left: 0;
    }

    /* Grid */
    /* main > .grid-info {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
    } */

    /* Center content */
    .center-content {
        display: grid;
        place-items: center;
    }

    /* Content card */
    .content-card {
        display: flex;
        flex-direction: column;
        width: 100%;
        max-width: 350px;
        height: auto;
        padding: 6px;
    }

</style>