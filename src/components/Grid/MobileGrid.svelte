<script>
  
    import WidgetPreview from "../WidgetPreview.svelte";
    import { goto } from "@roxi/routify";
    import Wrapper from "../Wrapper/Wrapper.svelte";
    import Button from "../Form/Button.svelte";
    import Icon from "../Icon/index.svelte";
    import { mdiArrowDown, mdiArrowUp, mdiCog, mdiContentDuplicate, mdiDelete, mdiWidgets } from "@mdi/js";
    import ContextualMenu from "../../core/ContextualMenu.svelte";
    import Configurator from "../Configurator/Configurator.svelte";
    import { loadedDictionary } from "../../store/dictionary";
    import { createEventDispatcher } from "svelte";
    import gridHelp from "svelte-grid/build/helper/index.mjs";
    import { sendNotification } from "../../store/notification";
    import * as WidgetIndex from "../../widgets/index";

    export let items = null;
    export let newItems = null;
    export let modifyMode = false;
    export let isGridCustomizable = true;
    export let grid = null;
    export let token = null;
    export let disableWidgetClick = false;

    // Handle mode swith
    $: modifyMode, switchMode();
    $: newItems, addNewItems();

    // Generate id
    const id = () => {

        // Init id
        let id;

        do {

            // Update id
            id = "_" + Math.random().toString(36).substring(2, 9);

        } while( (items.find(val => val.id === id)) !== undefined );

        // Return id
        return id;

    };

    // Dispatcher
    const dispatch = createEventDispatcher();

    // Dictionary
    const dict = $loadedDictionary;

    // Grid numbers
    const COLS = 10;
    const COL_WIDTH = 2200 / 10;
    const ROW_HEIGHT = 70;

    // Configure widget
    let configureWidget = null;

    // Contextual menu
    let contextualMenuContext = null;
    
    // Something changed
    let somethingChanged = false;

    // Get widget status text
    function getStatusText(state) {

        // Verify if state is valid
        if(!state || typeof(state) !== "object")
            return "";

        // Verify if state has status text key
        if(!state.hasOwnProperty("_defaultStateKey"))
            return "";

        // Get a state pointer
        let p = state;

        // Iterate over defautl state key
        state._defaultStateKey.every(v => {

            // Check if p has v key
            if(p && p.hasOwnProperty(v))
                p = p[v];
            else
                return false;

            // Fallback
            return true;

        });

        // Check if p is a string
        if(typeof(p) === "string")
            return p;

        // Return fallback
        return "";
    }

    // Open map context menu
    function openWidgetContextMenu(widget) {

        // Set event
        contextualMenuContext = {
            title: dict?.getString( widget.propreties.WIDGET_ID ),
            backgroundOpacity: .6,
            options: isGridCustomizable ? 
            [

                // Open widget view
                {
                    name: dict?.getString("open"),
                    callback: () => {

                        // Open widget page
                        $goto(`/widget/${widget.propreties.WIDGET_ID}/${btoa( JSON.stringify({

                            state: widget?.state ?? {},
                            grid: selectedGrid,
                            id: widget.id

                        }) )}`);

                    }
                },

                // Modify widget
                {
                    name: dict?.getString("modify"),
                    callback: () => {

                        // Open configurator
                        configureWidget = widget;

                    }
                },

                // Duplicate widget
                {
                    name: dict?.getString("duplicate"),
                    callback: () => {

                        // Duplicate widget
                        duplicateWidget(widget);

                    }
                },

                // Remove widget
                {
                    name: dict?.getString("remove"),
                    callback: () => {

                        // Remove widget
                        removeWidget(widget.id);

                    }
                }

            ]

            :

            [
                // Open widget view
                {
                    name: dict?.getString("open"),
                    callback: () => {

                        // Open widget page
                        $goto(`/widget/${widget.propreties.WIDGET_ID}/${btoa( JSON.stringify({

                            state: widget?.state ?? {},
                            grid: selectedGrid,
                            id: widget.id

                        }) )}`);

                    }
                }
            ]
        }

    }

    // Move widget up
    function moveUp(i) {

        // Check if is first element
        if(i === 0)
            return;

        // Save selected item
        let selectedItem = items[i];

        // Move other element
        items[i] = items[i-1];

        // Reset selected item
        items[i-1] = selectedItem;

        // Register change
        registerChange();

    }

    // Move widget down
    function moveDown(i) {

        // Check if is first element
        if(i === (items.length - 1))
            return;

        // Save selected item
        let selectedItem = items[i];

        // Move other element
        items[i] = items[i+1];

        // Reset selected item
        items[i+1] = selectedItem;

        // Register change
        registerChange();

    }

    // Remove element from grid
    function removeWidget(id) {

        // Remove widget from grid
        items = items.filter((value) => value.id !== id);

        // Register change
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
        let findOutPosition = gridHelp.findSpace(newItem, items, COLS);

        // Update the new item
        newItem = {
            ...newItem,
            [COLS]: {
            ...newItem[COLS],
            ...findOutPosition,
            },
        };

        // Update grid
        items = [newItem, ...items];


        // Register change
        registerChange();

    }

    // Simplify grid
    function gridSimplify(grid) {

        // Check if grid is a valid 
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

    // Save grid
    function syncGrid() {

        console.log("MOBILE SYNC");

        // Dispatch sync grid
        dispatch("sync", gridSimplify( items ));

        // Reset something changed
        somethingChanged = false;

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


    // Switch between modify mode and normal mode
    function switchMode() {

        console.log("SWITCH MODE", modifyMode, somethingChanged);

        // Check if is not modify mode and something changed
        if(!modifyMode && somethingChanged) {

            // Sync grid
            syncGrid();

        }

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
            items = [...items, ...result];

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
                    [COLS]: gridHelp.item({ 
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
                let findOutPosition = gridHelp.findSpace(newItem, items, COLS);

                // Update the new item
                newItem = {
                    ...newItem,
                    [COLS]: {
                        ...newItem[COLS],
                        ...findOutPosition,
                    },
                };

                // Add new item
                newItemsLoaded = [...newItemsLoaded, newItem];

            } catch (error) {

                // Log error
                console.error("LOADING NEW ITEMS", error);

                // Count not loaded widget
                itemsNotLoaded++;

            }

        }

        // Verify items not loaded
        if(itemsNotLoaded > 0) {

            // Notify user
            sendNotification( dict?.getString("errorGeneric") );

            // Log error
            console.error(`${itemsNotLoaded} item non caricati/o correttamente`)

        }

        return newItemsLoaded;

    }

</script>


<!-- Main container -->
<main>

    <!-- Iterate over widget list -->
    {#each items as widget, i}

        <!-- Width and height -->
        {@const {w, h} = widget[COLS]}

        <!-- Widget status -->
        {@const widgetStatus = getStatusText(widget?.state)}

        <!-- Widget update handler -->
        {#key widget}

            <!-- Widget container -->
            <div class="widget-container">

                <!-- Load grid data -->
                <WidgetPreview w={w * COL_WIDTH} h={h * ROW_HEIGHT} disableClickableLayer={modifyMode} on:click={() => {

                    // Check if disable widget click
                    if(disableWidgetClick)
                        return;

                    // Open widget page
                    $goto(`/widget/${widget.propreties.WIDGET_ID}/${btoa( JSON.stringify({

                        state: widget?.state ?? {},
                        grid,
                        id: widget.id

                    }) )}`);

                }} on:longClick={({ detail }) => {

                    // Check if disable widget click
                    if(disableWidgetClick)
                        return;

                    // Prevent default
                    detail.preventDefault();

                    // Vibrate
                    navigator?.vibrate?.(75);

                    // Open context menu
                    openWidgetContextMenu(widget);

                }}>

                    <!-- Handle modify mode -->
                    {#if !modifyMode}
                    
                        <!-- Check if widget configuration is open -->
                        {#if configureWidget !== widget}
                        
                            <!-- Widget wrapper -->
                            <Wrapper 
                                widgetId={widget.propreties.WIDGET_ID}
                                lang={dict?.getLang() || "en"}
                                state={widget.hasOwnProperty("state") ? widget.state : null}
                                showContextualOptions={true}
                                token={token}
                                showOptions={false}
                                on:saveState={(e) => {

                                    // Update state
                                    widget.state = e.detail;

                                    // Register change
                                    registerChange();

                                }}
                                on:changeOptions={(e) => {
                                    
                                    // Configure widget
                                    configureWidget = widget;
                                    
                                }}
                                on:contextmenu={(e) => {
                                    
                                    // Show context menu
                                    openWidgetContextMenu( widget );
                                    
                                }}
                            />

                        {/if}

                    {:else}

                        <!-- Modification later -->
                        <div class="widget-modify-container" in:blur|local>

                            <!-- Content -->
                            <div class="content">

                                <!-- Widget name -->
                                <div class="text-center">
                                    {dict?.getString( widget.propreties.WIDGET_ID )}
                                </div>

                                <!-- Check widget status -->
                                {#if widgetStatus}
                                
                                    <!-- Widget status -->
                                    <div class="text-center primary-text">
                                        {widgetStatus}
                                    </div>

                                {/if}

                                <!-- Check if grid is customizable -->
                                {#if isGridCustomizable}

                                    <!-- Modify button -->
                                    <Button class="yellow white-text darken-3 text-darken-3 ml-1 mr-1 mb-1 mt-2" depressed on:click={() => {

                                        // Configure widget
                                        configureWidget = widget;

                                    }}>
                                        <Icon path={mdiCog} />
                                        <span class="ml-3">
                                            {dict?.getString("modify")}
                                        </span>
                                    </Button>
                                    
                                    <!-- Duplicate button -->
                                    <Button class="primary-color white-text ma-1" depressed on:click={() => {

                                        // Duplicate widget
                                        duplicateWidget(widget);

                                    }}>
                                        <Icon path={mdiContentDuplicate} />
                                        <span class="ml-3">
                                            {dict?.getString("duplicate")}
                                        </span>
                                    </Button>

                                    <!-- Remove button -->
                                    <Button class="red white-text ma-1" depressed on:click={() => {

                                        // Remove widget
                                        removeWidget(widget.id);

                                    }}>
                                        <Icon path={mdiDelete} />
                                        <span class="ml-3">
                                            {dict?.getString("remove")}
                                        </span>
                                    </Button>

                                    <!-- Position handler -->
                                    <div class="d-flex">

                                        <!-- Top -->
                                        <div class="flex-1 pa-1">

                                            <!-- Button -->
                                            <Button block outlined class="primary-text" disabled={i === 0} on:click={() => moveUp(i)}>
                                                <Icon path={mdiArrowUp} />
                                            </Button>

                                        </div>

                                        <!-- Bottom -->
                                        <div class="flex-1 pa-1">

                                            <!-- Button -->
                                            <Button block outlined class="primary-text" disabled={i === (items.length - 1)} on:click={() => moveDown(i)}>
                                                <Icon path={mdiArrowDown} />
                                            </Button>

                                        </div>

                                    </div>

                                {/if}

                            </div>

                        </div>

                    {/if}

                </WidgetPreview>

            </div>

        {/key}

        
        
    {/each}

    <!-- Check if grid is empty -->
    {#if items.length === 0}

        <!-- Empty grid container -->
        <div class="empty-grid-container pt-16 d-flex align-center justify-center">

            <!-- Box -->
            <div class="pl-2 pr-2">

                <!-- Icon -->
                <div class="d-flex align-center justify-center">
                    <Icon path={mdiWidgets} />
                </div>

                <!-- Action -->
                <div class="pl-8 pr-8 pt-4 text-center">
                    {dict?.getString("canCustomizeWidget")}
                </div>

            </div>

        </div>
        
    {/if}

</main>

<!-- Configurator -->
<Configurator
    on:saveState={({ detail }) => {

        // Iterate over widget grid items
        for(const widget of items) {

            // Check if id is the same
            if(widget.id === configureWidget.id) {

                // Update state
                widget.state = detail;

                // Break for cycle
                break;

            }

        }

        // Register change
        registerChange();

    }}
    on:close={() => {

        // Close configurator
        configureWidget = false;

    }}
    active={configureWidget}
    widgetName={configureWidget?.propreties?.WIDGET_NAME}
    widgetId={configureWidget?.propreties?.WIDGET_ID}
    state={configureWidget?.state}
    {dict}
    token={token}
/>

<!-- Contextual menu -->
<ContextualMenu 
    bind:context={contextualMenuContext}
    screenPadding={{ bottom: 72 }}
    width={"90%"}
/>

<style>

    /* Main container page */
    main {
        width: 100%;
        height: auto;
    }

    /* Widget container */
    main > .widget-container {
        padding-bottom: 12px;
    }

    /* Widget modification container */
    main .widget-modify-container {
        width: 100%;
        height: 100%;
        display: grid;
        place-items: center;
        user-select: none;
    }

    /* Items */
    main .widget-modify-container > * {
        flex: 1;
        display: grid;
        justify-content: center;
        align-items: center;
    }

</style>