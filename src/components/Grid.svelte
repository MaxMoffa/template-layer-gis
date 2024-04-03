<svelte:window on:resize={resizeGrid} />

<script>

    import { Icon, List, ListItem, Button, ProgressCircular, ClickOutside } from 'svelte-materialify/src';
    import { mdiCog, mdiDelete, mdiContentDuplicate, mdiResizeBottomRight } from '@mdi/js';
    import gridHelp from "svelte-grid/build/helper/index.mjs";
    import * as WidgetIndex from "../widgets/index";
    import { onMount, onDestroy } from "svelte";
    import Grid from "svelte-grid";
    import Card from './WidgetCard.svelte';
    import Wrapper from './Wrapper.svelte';
    import WidgetOptions from './widgetOptions.svelte';
    import { createEventDispatcher } from 'svelte';
    import domtoimage from 'dom-to-image';
	import LangUtils from '../utils/lang_utils';
    import ScreenshotDialog from './ScreenshotDialog.svelte';
    import { theme, getColor, getBackground } from '../store/theme';
    import Configurator from './Configurator/Configurator.svelte';
    const dispatch = createEventDispatcher();

    export let token = null;
    export let apikey = null;
    export let items = [];
    export let rowHeight = 70;
    export let cols = 10;
    export let fastStart = true;
    export let modifyMode = false;
    export let width = "80%";
    export let isContentVisible = false;
    export let parent = null;
    export let itemsId = null;
    export let contextMenuCustom = true;
    export let dictionary =  new LangUtils("en", {}); 
    export let isGridCustomizable = true;

    let oldModifyMode = modifyMode;
    let oldItemsId = itemsId;
    let oldItemsLength = items.length;
    let updateWidget = false;

    let _theme = "light";
    let unsubscribeTheme = theme.subscribe(val => _theme = val);

    if(parent)
        parent.addEventListener("scroll", hideContextMenu);

    $: items, update();
    $: modifyMode, updateModifyMode();

    // Grid variables
    const id = () => "_" + Math.random().toString(36).substr(2, 9);
    const COLS = [
        [ 3200, cols ],
    ];
    let container;
    let _items = [];

    // Content variables
    let optionsDataItem = null;

    // Widget params default
    let params;
    
    // Context menu
    let contextMenu;
    let isContextMenuVisible = null;

    // Screenshot
    let img = null;
    let showScreenshotDialog = false;

    // Resize timer
    let grid_resize_timer;

    onMount(() => {

        updateGridRowHeight();

        // Load widget params
        params = {
            showOptions: false,
            parent: getContainer(),
        };
        if(token !== null)
            params.token = token;
        else
            params.apikey = apikey;

        if(items.length > 0){

            // Load grid
            initGrid();

        } else {
            isContentVisible = true;
        }

    });

    onDestroy(() => {
        if(parent)
            parent.removeEventListener("scroll", hideContextMenu);
        unsubscribeTheme();
    });

    function hideContextMenu() {
        isContextMenuVisible = null;
    }

    // Update after modify mode change
    function updateModifyMode() {
        if(isGridCustomizable)
            update();
        else
            modifyMode = false;
    }

    // Core,update
    function update() {
        isContextMenuVisible = null;
        console.log(itemsId + " === " + oldItemsId);
        if(itemsId === null || itemsId !== oldItemsId){
            oldItemsId = itemsId;
            initGrid();
        }else if(oldItemsLength === items.length-1){
            oldItemsLength = items.length;
            prepareWidget(items[0])
            .then(result => {
                _items = [result, ..._items];
                if(modifyMode)
                    updateGrid();
            });
        }else if(modifyMode !== oldModifyMode){
            oldModifyMode = modifyMode;
            updateGridState();
        }else {
            updateWidget = true;
            setTimeout(() => {
                updateWidget = false;
            }, 0);
        }
    }

    // Init the grid
    function initGrid() {
        prepareGrid(items)
        .then(result => {
            _items = result;
        })
        .catch(e => {
            console.log(e);
            _items = [];
        })
        .finally(() => {
            reloadGrid();
            isContentVisible = true;
        });
    }

    // Update the grid state
    function updateGridState() {
        _items = _items.map(w => {
            w[cols].fixed = !modifyMode;
            w[cols].resizable = modifyMode;
            w[cols].draggable = modifyMode;
            return w;
        })
    }

    // Dispatch the update event
    function updateGrid() {

        console.log("UPDATE");

        let cloneItems = JSON.parse(JSON.stringify(_items));
        items = cloneItems.map(item => {
            delete item.widget;
            return item;
        });
        oldItemsLength = items.length;
        dispatch("update", items);
    }

    // Reload grid
    function reloadGrid() {
        isContentVisible = false;
        setTimeout(() => {
            // Set new session id
            window._gridSessionID = id();
            isContentVisible = true;
        }, 0);
    }

    // Check if widget is cutomizable
    function isCustomizable(state) {
        return state && typeof(state) === "object";
    }

    // Load widget inside the grid
    async function prepareGrid(rawGrid) {

        // Transform string into json
        let items = typeof(rawGrid) === "object" ? rawGrid : JSON.parse(rawGrid);

        let result = [];

        // Add the widget class
        for(let item of items){

            result.push(await prepareWidget(item));

        }

        return result;
    }

    // Remove widget from grid
    function removeWidget(item) {
        _items = _items.filter((value) => value.id !== item.id);
        updateGrid();
    }

    // Update rows height
    function updateGridRowHeight() {
        let newValue = getContainer().clientHeight/8;
        rowHeight = newValue > 70 ? 70 : newValue;
    }

    function getContainer() {
        return parent ? parent : container;
    }

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

    function duplicateWidget(item) {
        let newItem = {
            ...item,
            state: JSON.parse(JSON.stringify(item.state)),
            id: id()
        };
                
        // Find a new spot for the widget
        let findOutPosition = gridHelp.findSpace(newItem, items, cols);

        // Update the new item
        newItem = {
            ...newItem,
            [cols]: {
            ...newItem[cols],
            ...findOutPosition,
            },
        };

        _items = [newItem, ..._items];
        updateGrid();
    }

    function showContextMenu(item, e) {
        if(!contextMenuCustom)
            return;
        let p = getPosition(e.detail.e);
        contextMenu.style.top = p.y - 6 + "px";
        contextMenu.style.left = p.x - 64 + "px";
        isContextMenuVisible = {
            item,
            ref: e.detail.ref
        };
    }

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

        return {
            x: posx,
            y: posy
        }
    }

    function getScreen(node, width=null, height=null) {
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
            showScreenshotDialog = true;
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

    function resizeGrid() {
        isContentVisible = false;
        if(grid_resize_timer)
            clearTimeout(grid_resize_timer);
        grid_resize_timer = setTimeout(() => {
            updateGridRowHeight();
            isContentVisible = true;
        }, 0);
    }

</script>

<!-- Main -->
<main class:container={parent === null} style={parent === null ? "height: 100% !important" : ""} bind:this={container} on:scroll={() => isContextMenuVisible = null}>

    <!-- header -->

    {#if parent === null}
        <div style="height: 32px;"></div>
    {/if}

    <!-- context menu -->
    <div bind:this={contextMenu} use:ClickOutside class="context-menu elevation-2 rounded {getBackground(_theme)}" isVisible={isContextMenuVisible !== null} on:clickOutside={() => isContextMenuVisible = null}>
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
                {#if isContextMenuVisible && isCustomizable(isContextMenuVisible.item.state)}
                    <ListItem on:click={() => {
                        optionsDataItem = isContextMenuVisible.item;
                        modifyMode = true;
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

    <!-- Show/Hide content (for reload) -->
    {#if isContentVisible}
    
        <!-- Check if there are items -->
        {#if _items.length === 0}

            <!-- No items -->
            <div class="no-data-grid">
                <div>
                    <div>
                        <img src="./media/grape_pack/drawkit-grape-pack-illustration-7.svg" height="300" alt="Empty">
                    </div>
                    <div>
                        {dictionary.getString("emptyGridError")}
                    </div>
                    <div>
                        <slot name="empty"/>
                    </div>
                </div>
            </div>

        {:else}

            <div class="grid-container" style="width: {width}">

                <!-- Grid -->
                <Grid 
                    on:pointerup={updateGrid} 
                    bind:items={_items} 
                    gap={[3, 3]} 
                    rowHeight={rowHeight} 
                    let:dataItem 
                    cols={COLS} 
                    scroller={getContainer()} 
                    let:resizePointerDown
                    {fastStart}
                >

                    <!-- Card -->
                    <Card background="{getColor(_theme)}">

                        <!-- Check grid mode -->
                        {#if updateWidget}
                            <!-- EMPTY -->
                        {:else if modifyMode}

                            <!-- Modify mode content -->
                            <div class="modify">

                                <div>

                                    <span style="text-align: center;" class="mb-3">
                                        {dataItem.propreties.WIDGET_NAME}
                                    </span>

                                    <span style="text-align: center;" class="mb-6 text-caption">
                                        {getStatusText(dataItem.state)}
                                    </span>

                                    {#if isCustomizable(dataItem.state)}

                                        <Button class="yellow white-text darken-3 text-darken-3 mb-1" depressed on:click={() => optionsDataItem = dataItem}>
                                            <Icon path={mdiCog} class="mr-3" />
                                            {dictionary.getString("modify")}
                                        </Button>
                                        
                                    {/if}

                                    <Button class="primary-color mb-1" depressed on:click={() => duplicateWidget(dataItem)}>
                                        <Icon path={mdiContentDuplicate} class="mr-3" />
                                        {dictionary.getString("duplicate")}
                                    </Button>

                                    <Button class="red white-text" depressed on:click={() => removeWidget(dataItem)}>
                                        <Icon path={mdiDelete} class="mr-3" />
                                        {dictionary.getString("remove")}
                                    </Button>
                                </div>

                            </div>

                            <div style="position: absolute; bottom: 0; right: 0; cursor: nwse-resize" class="resizer pa-1" on:pointerdown={resizePointerDown}>
                                <Icon path={mdiResizeBottomRight} />
                            </div>
                            
                        {:else}

                            <!-- Widget wrapper -->
                            <Wrapper 
                                widgetId={dataItem.propreties.WIDGET_ID}
                                lang={dictionary.getLang()}
                                sessionID={`${window._gridSessionID}`}
                                widget={dataItem.widget} 
                                state={dataItem.hasOwnProperty("state") ? dataItem.state : null}
                                parent={getContainer()}
                                showContextualOptions={isGridCustomizable}
                                disableContextMenu
                                on:saveState={(e) => {
                                    dataItem.state = e.detail;                                    
                                    updateGrid();
                                }}
                                on:changeOptions={(e) => {
                                    optionsDataItem = dataItem;
                                    modifyMode = true;
                                }}
                                on:changeChildOptions={(e) => {
                                    optionsDataItem = e.detail;
                                    modifyMode = true;
                                }}
                                on:contextmenu={(e) => showContextMenu(dataItem, e)}
                                {...params}
                            />

                        {/if}

                    </Card>

                </Grid>

            </div>

        {/if}

    {:else}

        <div class="loading">

            <ProgressCircular indeterminate color="primary" />

        </div>

    {/if}

    <!-- {#if optionsDataItem !== null && isGridCustomizable}

        <WidgetOptions 
            widget={optionsDataItem.widget} 
            {apikey}
            {token} 
            state={optionsDataItem.state} 
            name={optionsDataItem.propreties.WIDGET_NAME}
            background={optionsDataItem.propreties.BACKGROUND}
            configuration={optionsDataItem.propreties.CONFIGURATION}
            widgetId={optionsDataItem.propreties.WIDGET_ID}
            {dictionary}
            on:saveState={(e) => {
                optionsDataItem.state = e.detail;
                updateGrid();
                optionsDataItem = null;
                updateWidget = true;
                setTimeout(() => {
                    updateWidget = false;
                }, 0);
            }}
            on:close={() => {
                optionsDataItem = null;
            }}
        />

    {/if} -->

    <Configurator 
        active={optionsDataItem !== null && isGridCustomizable}
        state={optionsDataItem.state} 
        widgetId={optionsDataItem.propreties.WIDGET_ID}
        dict={dictionary}
        name={optionsDataItem.propreties.WIDGET_NAME}
        background={optionsDataItem.propreties.BACKGROUND}
        configuration={optionsDataItem.propreties.CONFIGURATION}
        {apikey}
        {token} 
        on:saveState={(e) => {
            optionsDataItem.state = e.detail;
            updateGrid();
            optionsDataItem = null;
            updateWidget = true;
            setTimeout(() => {
                updateWidget = false;
            }, 0);
        }}
    />

    <ScreenshotDialog image={img} bind:active={showScreenshotDialog} />

</main>

<style>

    main {
        width: 100%;
        height: auto;
        overflow-y: auto;
    }

    /* No items */

    .no-data-grid {
        width: 100%;
        height: auto;
        display: grid;
        place-items: center;
        padding: 64px 0;
    }

    .no-data-grid > div {
        width: 300px;
        height: auto;   
    }

    .loading {
        width: 100%;
        height: auto; 
        display: grid;
        place-items: center;  
        padding: 64px 0;
    }

    .no-data-grid > div > div{
        width: 100%;
        text-align: center;
        padding: 8px 0;
    }

    /* Modify mode content */

    .modify {
        width: 100%;
        height: 100%;
        display: grid;
        place-items: center;
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

    /* Grid */

    .grid-container {
        width: 100%;
        margin: 0 auto;
        padding-bottom: 128px;
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

</style>