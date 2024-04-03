<script>

    import { Icon, List, ListItem, Button, ClickOutside } from 'svelte-materialify/src';
    import { mdiCog, mdiDelete, mdiContentDuplicate, mdiResizeBottomRight } from '@mdi/js';
    import gridHelp from "svelte-grid/build/helper/index.mjs";
    import { onMount, onDestroy } from "svelte";
    import Grid from "svelte-grid";
    import Card from '../WidgetCard.svelte';
    import Wrapper from '../Wrapper/Wrapper.svelte';
    import { createEventDispatcher } from 'svelte';
	import LangUtils from '../../utils/lang_utils';
    import { theme, getColor, getBackground } from '../../store/theme';
  import { goto } from '@roxi/routify';

    // Dispatch a custom event
    const dispatch = createEventDispatcher();

    // Theme handler
    let _theme = "light";
    let unsubscribeTheme = theme.subscribe(val => _theme = val);

    export let token = null;
    export let apikey = null;
    export let items = [];
    export let rowHeight = 70;
    export let cols = 10;
    export let fastStart = true;
    export let modifyMode = false;
    export let width = "80%";
    export let parent = null;
    export let contextMenuCustom = true;
    export let dictionary =  new LangUtils("en", {}); 
    export let isGridCustomizable = true;

    // Grid variables
    const id = () => "_" + Math.random().toString(36).substr(2, 9);
    const COLS = [
        [ 3200, cols ],
    ];
    let container;
    let ITEMS = [];

    // Widget params default
    let params;

    // Contextual menu
    let isContextMenuVisible = null;
    let contextMenu;

    let ID = null;

    $: modifyMode, updateItems();
    $: items, updateItems();

    // When grid gets mounted
    onMount(() => {

        ID = id();

        console.log(ID);

        console.log("ON MOUNT GRID");

        // Parent reference
        const parent = getContainer()

        // Updates the rows height
        updateGridRowHeight(parent);

        // Detect scroll event on grid
        getContainer().addEventListener("scroll", hideContextMenu);

        // Load widget params
        params = {
            showOptions: false,
            parent
        };

        // Detect if grid need to use token or apikey
        if(token !== null)
            params.token = token;
        else
            params.apikey = apikey;
            
        ITEMS = items;

        // Setup items on main grid
        dispatch("setup", {
            items: ITEMS,
        });
        
    });

    // Update items state or number
    function updateItems() {

        console.log(ITEMS);

        if(ITEMS.length === 0 && items.length === 0)
            return;

        // Update if is not modify mode and new items are added
        if(!modifyMode && ITEMS.length !== items.length)
            dispatch("update", {items});

        // Update items
        ITEMS = items;

        // Setup items on main grid
        dispatch("setup", {
            items: ITEMS,
        });

        console.log("UPDATE GRID ERRROR", ID);

    }

    // When grid gets destroyed
    onDestroy(() => {

        // Unsubscribe to theme updates
        unsubscribeTheme();

        // Remove scroll listener
        getContainer().removeEventListener("scroll", hideContextMenu);

        // Reste variabili
        ITEMS = null;
        items = null;
        container = null;
        parent = null;
        contextMenu = null;
    
    });

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

    // Update the grid
    function updateGrid(local=false) {
        console.log("UPDATE DATA GRID");
        dispatch("update", {
            items: ITEMS,
            isLocal: false
        });
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

    // Show context menu
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

        return {
            x: posx,
            y: posy
        }
    }

    // Duplicate a widget inside the grid
    function duplicateWidget(item) {
        let newItem = {
            ...item,
            state: JSON.parse(JSON.stringify(item.state)),
            id: id()
        };
                
        // Find a new spot for the widget
        let findOutPosition = gridHelp.findSpace(newItem, ITEMS, cols);

        // Update the new item
        newItem = {
            ...newItem,
            [cols]: {
            ...newItem[cols],
            ...findOutPosition,
            },
        };

        ITEMS = [newItem, ...ITEMS];
        updateGrid();
    }

    // Modify a widget
    function modifyWidget(item) {
        dispatch("modify", item);
    }

    // Remove widget from grid
    function removeWidget(item) {
        ITEMS = ITEMS.filter((value) => value.id !== item.id);
        updateGrid();
    }

    // Request a screenshot to the core grid
    function getScreen(ref) {
        dispatch("screenshot", ref);
    }

    // Check if minimize is required (during modify mode)
    function isMinimizeRequired(info) {
        if(!info?.h)
            return false;
        if(info.h < 3)
            return true;
        return false;
    }

</script>

<main class:container={parent === null} style={parent === null ? "height: 100% !important" : ""} bind:this={container}>

    <!-- Header -->
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
                <ListItem on:click={() => {
                    
                    // Open widget page
                    $goto(`/widget/${isContextMenuVisible.item.propreties.WIDGET_ID}/${btoa( JSON.stringify( isContextMenuVisible.item?.state ?? {} ) )}`);
                    
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

    <!-- Grid container -->
    <div class="grid-container" style="width: {width}">

        <!-- Grid -->
        <Grid 
            on:pointerup={updateGrid} 
            bind:items={ITEMS} 
            gap={[3, 3]} 
            rowHeight={rowHeight} 
            let:dataItem 
            cols={COLS} 
            let:resizePointerDown
            {fastStart}
        >

            <!-- Card -->
            <Card background="{getColor(_theme)}">

                <!-- Check grid mode -->
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
                        showContextualOptions={isGridCustomizable}
                        disableContextMenu
                        on:saveState={(e) => {
                            dataItem.state = e.detail;                                    
                            updateGrid(true);
                        }}
                        on:changeOptions={(e) => {
                            modifyWidget(dataItem);false
                        }}
                        on:changeChildOptions={(e) => {
                            modifyWidget(e.detail);
                        }}
                        on:contextmenu={(e) => {
                            showContextMenu(dataItem, e);
                        }}
                        {...params}
                    />

                {/if}

            </Card>

        </Grid>

    </div>

</main>

<style>

    main {
        width: 100%;
        height: auto;
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