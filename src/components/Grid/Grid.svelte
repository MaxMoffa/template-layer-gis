<svelte:window on:resize={updateGridAfterResize} />

<script>   
    import GridOverlay from "./GridOverlay.svelte";
    import { theme, getColor, getBackground, getColorInverted } from '../../store/theme';
    import * as WidgetIndex from "../../widgets/index";
    import Grid from "svelte-grid";
    import Card from '../WidgetCard.svelte';
    import gridHelp from "svelte-grid/build/helper/index.mjs";
    import Wrapper from '../Wrapper/Wrapper.svelte';
    import { Icon, Button, List, ListItem, ClickOutside, Overlay } from "svelte-materialify/src";
    import { mdiResizeBottomRight, mdiContentDuplicate, mdiDelete, mdiCog, mdiLock, mdiLockOpen } from "@mdi/js";
    import { onDestroy, createEventDispatcher, onMount } from "svelte";
    import Configurator from "../Configurator/Configurator.svelte";
    import ScreenshotDialog from "../ScreenshotDialog.svelte";
    import domtoimage from 'dom-to-image';
    import { goto } from "@roxi/routify";

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
    export let fastStart = true;
    export let gridName = "";

    console.log("PARENT", parent);

    // Event dispatcher
    const dispatch = createEventDispatcher();

    $: items, loadGridItems();
    $: newItems, addNewItems();
    $: modifyMode, switchMode();

    // Constants
    const COLS = [
        [ 3200, cols ],
    ];

    // Starting witdth
    let main;
    let width_main = null;

    // Timeout grid update resize
    let hideGrid = false;
    let _gridResizeUpdate = null;

    // Container
    let container;

    // Generate id
    const id = () => "_" + Math.random().toString(36).substr(2, 9);

    // Theme handler
    let _theme = "light";
    let unsubscribeTheme = theme.subscribe(val => _theme = val);

    // Grid items loaded
    let itemsLoaded = undefined;

    // Check if something changed
    let somethingChanged = false;

    // Contextual menu
    let isContextMenuVisible = null;
    let contextMenu;

    // Configurator
    let optionsDataItem = null;
    let parentDataItem = null;

    // Screenshot
    let showScreenshotDialog = false;
    let img = null;

    onMount(() => {

        // Parent reference
        const parent = getContainer();

        width_main = parent.offsetWidth;

        // Updates the rows height
        updateGridRowHeight(parent);

    });

    onDestroy(() => {

        // Unsubscribe to theme changes
        unsubscribeTheme();

        // Reset variables
        itemsLoaded = null;
        container = null;
        img = null;
        contextMenu = null;
        optionsDataItem = null;
        parentDataItem = null;
    });

    // Update the grid after a resize of the window
    function updateGridAfterResize() {

        // Skip if vertical resize
        if(width_main === getContainer().offsetWidth)
            return;

        // Update main width
        width_main = getContainer().offsetWidth;

        // Clear the old timeout (if exist)
        clearTimeout(_gridResizeUpdate);

        // Destroy grid while resizing the window
        hideGrid = true;

        // Update grid row height
        updateGridRowHeight(getContainer());

        // Create a new timeout
        _gridResizeUpdate = setTimeout(() => {
            hideGrid = false;
        }, 1000);

    }

    // Update rows height
    function updateGridRowHeight(parent=getContainer()) {
        let newValue = parent.clientHeight/8;
        newValue = newValue > 70 ? 70 : newValue;
        if(rowHeight !== newValue)
            rowHeight = newValue;
    }

    // Get the container to use as reference
    function getContainer() {
        return parent ? parent : container;
    }

    // Load grid items
    function loadGridItems() {

        // Check if items are ready
        if(!Boolean(items) || !Array.isArray(items)) {
            showLoading();
            return;
        }

        // Check if array is empty
        if(items.length === 0){
            itemsLoaded = [];
            return;
        }

        // Show loading
        showLoading();

        // Prepare grid items
        prepareGrid(items)
        .then(result => {

            console.log("GRID READY", items);

            // Show loaded grid
            showGrid(result);

        })
        .catch(e => {

            // Show error
            console.error("Grid LOADING", e);
            showError();

        });

    }

    // Load widget inside the grid
    async function prepareGrid(rawGrid) {
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

        // Check if item ha defined col number
        if(!item.hasOwnProperty(cols)) {

            item[cols] = {
                w: 1,
                h: 3,
                x: 0,
                y: pos
            }

        }

        item = {
            ...item,
            [cols]: {
                ...item[cols],
                // fixed: !modifyMode,
                resizable: modifyMode && !item[cols]?.fixed,
                draggable: modifyMode && !item[cols]?.fixed,
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

    // Show grid loading
    function showLoading() {
        itemsLoaded = undefined;
    }

    // Show grid error
    function showError() {
        itemsLoaded = null;
    }

    // Show grid error
    function showGrid(grid) {
        itemsLoaded = grid;
    }

    // Add new items to the grid
    function addNewItems() {

        // Check if newItems are valid
        if(!Boolean(newItems) || !Array.isArray(newItems) || newItems.length === 0)
            return;

        // Load new items
        loadNewItems(newItems)
        .then(result => {

            // Add new items
            itemsLoaded = [...itemsLoaded, ...result];

            // Register change
            registerChange();

        })
        .catch(e => {

            // Show error
            console.error("ADD NEW ITEMS", itemsLoaded);
            showError();

        });
        
    }

    // Load new items for the grid
    async function loadNewItems(newItems=[]) {

        // Count items not loaded
        let itemsNotLoaded = 0;
        
        // New items loaded
        let newItemsLoaded = [];

        // Iterate over new items raw
        while(newItems.length > 0){

            // Pick an item
            let item = newItems.pop();

            try {
                
                // Loading widget info
                let { propreties, widget } = await WidgetIndex.getWidgetInfo(item);

                // Define new item
                let newItem = {
                    [cols]: gridHelp.item({ 
                        x: 0,
                        y: 0,
                        max: propreties.WIDGET_MAX_DIMENSION,
                        min: propreties.WIDGET_MIN_DIMENSION,
                        fixed: !modifyMode,
                        resizable: modifyMode,
                        draggable: modifyMode,
                        customResizer: true     ,                   
                        ...propreties.WIDGET_DEFAULT_DIMENSION
                    }),
                    id: id(),
                    propreties,
                    widget,
                    state: propreties.DEFAULT_CONFIGURATION
                };

                // Find a new spot for the widget
                let findOutPosition = gridHelp.findSpace(newItem, itemsLoaded, cols);

                // Update the new item
                newItem = {
                    ...newItem,
                    [cols]: {
                        ...newItem[cols],
                        ...findOutPosition,
                    },
                };

                // Add new item
                newItemsLoaded = [...newItemsLoaded, newItem];

            } catch (error) {

                console.error("LOADING NEW ITEMS", error);
                itemsNotLoaded++;

            }

        }

        if(itemsNotLoaded > 0)
            console.log(`${itemsNotLoaded} item non caricati/o correttamente`)

        return newItemsLoaded;

    }

    // Check if minimize is required (during modify mode)
    function isMinimizeRequired(info) {
        if(!info?.h)
            return false;
        if(info.h < 3)
            return true;
        return false;
    }

    // Check if widget is cutomizable
    function isCustomizable(state) {
        return state && typeof(state) === "object";
    }

    // Get the status text for a widget (if exist)
    function getStatusText(state) {
        if(!state || typeof(state) !== "object")
            return "";
        if(!state.hasOwnProperty("_defaultStateKey"))
            return "";
        let p = state;
        state._defaultStateKey.every(v => {
            if(p && p.hasOwnProperty(v))
                p = p[v];
            else
                return false;
            return true;
        });
        if(typeof(p) === "string")
            return p;
        return "";
    }

    // Switch between modify mode and normal mode
    function switchMode() {

        // Check if items are loadede
        if(!itemsLoaded || !Array.isArray(itemsLoaded))
            return;

        // Switch mode
        itemsLoaded = itemsLoaded.map(item => {

            return  {
                ...item,
                [cols]: {
                    ...item[cols],
                    resizable: modifyMode && !item[cols].fixed,
                    draggable: modifyMode && !item[cols].fixed,
                },
            };

        });

        // Update change
        if(!modifyMode && somethingChanged) {
            syncGrid();
            somethingChanged = false;
        }

    }

    // Register changes
    function registerChange() {

        // Check if modify mode is enabled
        if(modifyMode){

            // Send change update
            dispatch("change");

            // Something changed
            somethingChanged = true;

        }else{

            // Sync grid
            syncGrid();

        }

    }

    // Simplify grid
    function gridSimplify(grid) {

        if(!grid)
            return [];

        // Clone the grid
        let cloneItems = JSON.parse(JSON.stringify(grid));

        // Remove properties and widget component
        cloneItems = cloneItems.map(item => {

            // Remeber widget id
            let widgetId = item.propreties.WIDGET_ID;

            // Delete all the other information
            delete item.widget;
            delete item.propreties;

            // Relocate widget id
            item.propreties = {
                WIDGET_ID: widgetId
            };

            return item;
        });

        return cloneItems;

    }

    // Sync grid with parent element
    function syncGrid() {

        console.log("PRE SIMPLIFY", itemsLoaded)

        // Simplify grid
        let newItems = gridSimplify(itemsLoaded);

        console.log("AFTER SIMPLIFY", newItems)

        // Send out event
        dispatch("sync", newItems);

    }

    // Show context menu
    function showContextMenu(item, e) {
        if(!contextMenuCustom)
            return;
        let p = getPosition(e.detail.e);
        contextMenu.style.top = p.y - 6 + "px";
        contextMenu.style.left = p.x - 90 + "px";
        isContextMenuVisible = {
            item,
            ref: e.detail.ref
        };
    }

    // Hide context menu
    function hideContextMenu() {
        isContextMenuVisible = null;
    }

    // Get position for context menu
    function getPosition(e) {
        var posx = 0;
        var posy = 0;

        if (!e) var e = window.event;
        
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
            pos.x = 6;
        else if(pos.x >= document.body.clientWidth - 128 - 6)
            pos.x = document.body.clientWidth - 128 - 6;

        // Check if out of screen on Y
        if(pos.y <= 0)
            pos.y = 6;
        else if(pos.y >= document.body.clientHeight - 186 - 6)
            pos.y = document.body.clientHeight - 186 - 6;

        return pos;
    }

    // Remove widget from grid
    function removeWidget(item) {
        itemsLoaded = itemsLoaded.filter((value) => value.id !== item.id);
        registerChange();
    }

    // Duplicate a widget inside the grid
    function duplicateWidget(item) {
        
        let newItem = {
            ...item,
            state: JSON.parse(JSON.stringify(item.state)),
            id: id()
        };
                
        // Find a new spot for the widget
        let findOutPosition = gridHelp.findSpace(newItem, itemsLoaded, cols);

        // Update the new item
        newItem = {
            ...newItem,
            [cols]: {
            ...newItem[cols],
            ...findOutPosition,
            },
        };

        itemsLoaded = [newItem, ...itemsLoaded];
        registerChange();

    }

    // Lock widget position
    function toogleWidgetLock(item) {    

        // Update fixed state
        item[cols].fixed = !item[cols]?.fixed;

        // Update draggable and resizable state
        item[cols] = {
            ...item[cols],
            resizable: modifyMode && !item[cols].fixed,
            draggable: modifyMode && !item[cols].fixed,
        },
        
        // Items
        itemsLoaded = itemsLoaded;

        // Register change
        registerChange();

    }

    // Modify a widget
    function modifyWidget(item, parent=null) {
        optionsDataItem = item;
        parentDataItem = parent;
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

</script>

<!-- Main container -->
<main class:container={parent === null} style={parent === null ? "height: 100% !important" : ""} bind:this={container}>

    <!-- Grid overlay, show the loading bar or the error page based on the itemsLoaded list -->
    <GridOverlay 
        activeError={!itemsLoaded} 
        activeLoading={itemsLoaded === undefined || hideGrid} 
        activeEmpty={itemsLoaded && Array.isArray(itemsLoaded) && itemsLoaded.length === 0}

        on:reset={() => {
            itemsLoaded = [];
            if(modifyMode)
                modifyMode = false;
            syncGrid();
        }}

        on:addWidget={() => {
            dispatch("addWidget");
        }}

        on:reload={() => {
            dispatch("reload");
        }}

    />

    <!-- Grid container -->
    <div class="grid-container" visible={Boolean(itemsLoaded) && Array.isArray(itemsLoaded) && itemsLoaded.length > 0}>
        <div class="grid" style="width: {width};">

            {#if !hideGrid && Boolean(itemsLoaded) && Array.isArray(itemsLoaded) && itemsLoaded.length}
            
                <!-- Grid -->
                <Grid 
                    on:pointerup={registerChange} 
                    bind:items={itemsLoaded} 
                    gap={[3, 3]}  
                    let:dataItem 
                    let:resizePointerDown
                    cols={COLS}
                    {rowHeight}
                    {fastStart}
                    fillSpace={false}
                >

                    <!-- Card -->
                    <Card background="{getColor(_theme)}" locked={modifyMode && dataItem[cols]?.fixed}>

                        {#if modifyMode}
                        
                            <!-- Modify mode content -->
                            <div class="modify" minimize={isMinimizeRequired(dataItem[cols])}>

                                <div>

                                    <span style="text-align: center;" class="ma-3">
                                        {dataItem.propreties.WIDGET_NAME}
                                    </span>

                                    {#if getStatusText(dataItem.state)}
                                    
                                        <span style="text-align: center;" class="ma-6 text-caption">
                                            {getStatusText(dataItem.state)}
                                        </span>

                                    {/if}

                                    {#if isCustomizable(dataItem.state)}

                                        <Button class="yellow white-text darken-3 text-darken-3 ma-1" depressed on:click={() => {
                                            modifyWidget(dataItem);
                                        }}>
                                            <Icon path={mdiCog} />
                                            {#if !isMinimizeRequired(dataItem[cols])}
                                                <span class="ml-3">
                                                    {dictionary.getString("modify")}
                                                </span>
                                            {/if}
                                        </Button>
                                        
                                    {/if}
                                        
                                    <Button class="primary-color ma-1" depressed on:click={() => {
                                        duplicateWidget(dataItem);
                                    }}>
                                        <Icon path={mdiContentDuplicate} />
                                        {#if !isMinimizeRequired(dataItem[cols])}
                                            <span class="ml-3">
                                                {dictionary.getString("duplicate")}
                                            </span>
                                        {/if}
                                    </Button>

                                    <Button class="red white-text ma-1" depressed on:click={() => {
                                        removeWidget(dataItem);
                                    }}>
                                        <Icon path={mdiDelete} />
                                        {#if !isMinimizeRequired(dataItem[cols])}
                                            <span class="ml-3">
                                                {dictionary.getString("remove")}
                                            </span>
                                        {/if}
                                    </Button>

                                    <Button class="ma-1" depressed on:click={() => {
                                        toogleWidgetLock(dataItem);
                                    }}>
                                        <Icon path={dataItem[cols]?.fixed ? mdiLock : mdiLockOpen} />
                                        {#if !isMinimizeRequired(dataItem[cols])}
                                            <span class="ml-3">
                                                {dictionary.getString(dataItem[cols]?.fixed ? "unlock" : "lock")}
                                            </span>
                                        {/if}
                                    </Button>

                                </div>

                            </div>

                            <!-- Check if item is resizable -->
                            {#if dataItem[cols]?.resizable}
                            
                                <!-- Resize handler -->
                                <div style="position: absolute; bottom: 0; right: 0; cursor: nwse-resize" class="resizer pa-1" on:pointerdown={resizePointerDown}>
                                    <Icon path={mdiResizeBottomRight} />
                                </div>

                            {/if}

                        {:else}

                            <!-- Widget wrapper -->
                            {#if optionsDataItem?.id !== dataItem?.id}
                            
                                <Wrapper 
                                    {token}
                                    {apikey}
                                    widgetId={dataItem.propreties.WIDGET_ID}
                                    lang={dictionary.getLang()}
                                    sessionID={`${window._gridSessionID}`}
                                    widget={dataItem.widget} 
                                    state={dataItem?.state ? dataItem.state : null}
                                    showContextualOptions={isGridCustomizable}
                                    disableContextMenu
                                    showOptions={false}
                                    on:saveState={(e) => {
                                        dataItem.state = e.detail;     
                                        if(isGridCustomizable)                               
                                            registerChange();
                                    }}
                                    on:changeOptions={(e) => {
                                        if(isGridCustomizable)
                                            modifyWidget(dataItem);
                                    }}
                                    on:changeChildOptions={(e) => {                                                                                
                                        if(isGridCustomizable){
                                            let w = {
                                                id: dataItem?.id, 
                                                ...e.detail
                                            };
                                            console.log("OPEN", w);
                                            
                                            modifyWidget(w, dataItem);
                                        }

                                    }}
                                    on:contextmenu={(e) => {
                                        showContextMenu(dataItem, e);
                                    }}
                                />

                            {/if}
                            

                        {/if}
                        
                    </Card>

                </Grid>

            {/if}

        </div>
    </div>

    <!-- context menu -->
    <div bind:this={contextMenu} use:ClickOutside class="context-menu elevation-2 rounded {getBackground(_theme)}" isVisible={isContextMenuVisible !== null} on:clickOutside={hideContextMenu}>
        <List dense>
            <ListItem disabled class="grey-text">
                {isContextMenuVisible ? isContextMenuVisible.item.propreties.WIDGET_NAME : ""}
            </ListItem>
            <ListItem on:click={() => {
                getScreen(isContextMenuVisible.ref.parentElement);
                isContextMenuVisible = null;
            }}>
                Screenshot
            </ListItem>
            {#if isGridCustomizable}
                <ListItem on:click={() => {

                    // Open widget page
                    $goto(`/widget/${isContextMenuVisible.item.propreties.WIDGET_ID}/${btoa( JSON.stringify({

                        state: isContextMenuVisible.item?.state ?? {},
                        grid: gridName,
                        id: isContextMenuVisible.item?.id

                    }) )}`);
                                            
                }}>
                    {dictionary.getString("open")}
                </ListItem>
                {#if isContextMenuVisible && isCustomizable(isContextMenuVisible.item.state)}
                    <ListItem on:click={() => {
                        modifyWidget(isContextMenuVisible.item);
                        isContextMenuVisible = null;
                    }}>
                        {dictionary.getString("modify")}
                    </ListItem>
                {/if}
                <ListItem on:click={() => {
                    duplicateWidget(isContextMenuVisible.item);
                    isContextMenuVisible = null;
                }}>
                    {dictionary.getString("duplicate")}
                </ListItem>
                <ListItem on:click={() => {
                    removeWidget(isContextMenuVisible.item);
                    isContextMenuVisible = null;
                }}>
                    {dictionary.getString("delete")}
                </ListItem>
            {/if}
        </List>
    </div>

    {#if isContextMenuVisible !== null}
        <div class="content-menu-overlay" on:contextmenu={e => e.preventDefault()}>
            <Overlay color={getColorInverted(_theme)} opacity={0.2} absolute active />
        </div>
    {/if}

    <!-- Widget configurator -->
    <Configurator 
        active={optionsDataItem !== null && isGridCustomizable}
        state={optionsDataItem?.state} 
        widgetId={optionsDataItem?.propreties?.WIDGET_ID}
        dict={dictionary}
        {apikey}
        {token} 
        on:saveState={(e) => {            
            
            // Update state

            // Check if is child
            if(parentDataItem !== null) {

                // Find widget state variable
                let wstate =  parentDataItem?.state.widgets.find(w => w.id === optionsDataItem.propreties.WIDGET_ID);
                
                // Update widget state
                wstate.state = e.detail;

            } else {

                // Direct update
                optionsDataItem.state = e.detail;

            }
            
            // Reset
            optionsDataItem = null;
            parentDataItem = null;

            // Register change
            registerChange();

        }}

        on:close={() => {
            optionsDataItem = null;
            parentDataItem = null;
        }}
    />

    <!-- Screenshot dialog -->
    <ScreenshotDialog image={img} bind:active={showScreenshotDialog} />

    <!-- Bottom space -->
    <div style="height: 128px;"></div>

</main>

<style>

    /* Main container */
    main {
        width: 100%;
        height: auto;
        top: 0;
        left: 0;
    }

    /* Grid container */
    main > .grid-container {
        width: 100%;
    }

    main > .grid-container[visible = false] {
        display: none;
    }

    /* Grid */
    main > .grid-container > .grid {
        width: 100%;
        height: auto;
        margin: 0 auto;
    }

    /* Modify mode content */

    .modify {
        width: 100%;
        height: 100%;
        display: grid;
        place-items: center;
    }

    .modify[minimize = true] > * {

        grid-auto-flow: column;
        
    }

    .modify > * {
        flex: 1;
        display: grid;
        justify-content: center;
        align-items: center;
    }

    :global(.s-item-group) {
        min-width: 0;
    }

    /* Context menu */
    .context-menu {
        width: 128px;
        position: fixed;
        z-index: 1000;
        display: none;
    }

    .context-menu[isVisible=true] {
        display: block;
    }

    .content-menu-overlay {
        position: fixed;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        z-index: 999;
    }

</style>