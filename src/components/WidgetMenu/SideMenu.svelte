<script>

    import { createEventDispatcher, onDestroy } from 'svelte';
    import { getColor, theme } from '../../store/theme';
    import Overlay from '../Overlay.svelte';
    import SearchElement from '../SearchElement/SearchElement.svelte';
    import { dictionary, getDictionary } from '../../store/dictionary';
    import { fly } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';
    import { user } from '../../store/user';
    import { GOLD_WIDGET_LIST, SILVER_WIDGET_LIST } from '../../widgets/index';
    import * as MDI from '@mdi/js';
    import { Button, Icon } from 'svelte-materialify/src';
    import WidgetCard from './WidgetCard.svelte';
    import { StatusBar } from '../StatusBar';

    // Dispatcher
    const dispatch = createEventDispatcher();

    export let active = true;

    // Theme handler
    let _theme = "light";
    const unsubscribeTheme = theme.subscribe(val => _theme = val);

    // Dictionary handler
    let dict = null;
    const unsubscribeDictionary = dictionary.subscribe(val => dict = getDictionary( val ));

    // User handler
    let _user = null;
    const unsubscribeUser = user.subscribe(val => _user = val);

    // Query
    let query = "";

    // On component destroy
    onDestroy(() => {

        // Unsubscribe to theme update
        unsubscribeTheme();

        // Unsubcribe to dictionary update
        unsubscribeDictionary();

        // Unsubscribe to user update
        unsubscribeUser();

    });

    // Get widget list
    function getWidgetList(userType) {
            
        // Check if is silver
        if(userType === "Silver")
            return SILVER_WIDGET_LIST;

        // Check if is gold or platinum
        if(userType === "Gold" || userType === "Platinum")
            return GOLD_WIDGET_LIST;

        // Fallback
        return [];

    }

    // Get widget icon
    function getWidgetIcon(icon) {

        // Return icon
        return MDI?.[icon];

    }

</script>

<!-- Overlay -->
<Overlay opacity={.6} bind:active>

    <!-- Status bar -->
    <StatusBar color={ getColor(_theme) } />

    <!-- Side menu -->
    <main class="{getColor(_theme)}" in:fly={{ delay: 0, duration: 300, x: 500, y: 0, opacity: 0.5, easing: quintOut }}>

        <!-- Top bar -->
        <div class="top-bar">

            <!-- Close button -->
            <div class="action">
                
                <!-- Button -->
                <Button icon on:click={() => active = false}>
                    <Icon path={MDI.mdiClose} />
                </Button>

            </div>

            <!-- Title -->
            <div class="title">
                Widgets
            </div>

        </div>

        <!-- Search bar -->
        <div class="search-bar">

            <!-- Search element -->
            <SearchElement variant bind:query block placeholder={ dict?.getString("searchWidget") } />

        </div>

        <!-- Content -->
        <div class="content">

            <!-- Iterate over widget list -->
            {#each getWidgetList( _user?.type ) as widget}
            
                <!-- Check if should be visible -->
                {#if query === "" || (dict?.getString( widget.id ) || widget.id)?.toLowerCase?.()?.includes?.( query?.toLowerCase() )}
                
                    <!-- Widget card container -->
                    <div class="widget-card-container">

                        <!-- Widget card -->
                        <WidgetCard
                            id={widget.id}
                            icon={getWidgetIcon( widget.icon )}
                            name={dict?.getString( widget.id )}
                            description={dict?.getString( widget.id + "Description" )}
                            on:click={() => {

                                // Dispatch add widget event
                                dispatch("addWidget", widget.id);

                                // Close side menu
                                active = false;

                            }}
                        />

                    </div>

                {/if}

            {/each}

        </div>

    </main>

</Overlay>

<style>

    /* Side menu */
    main {
        position: fixed;
        top: 0;
        right: 0;
        height: 100%;
        width: 100%;
        max-width: 400px;
        display: flex;
        flex-direction: column;
        border-left: 1px solid var(--theme-dividers) !important;
    }

    /* Top bar */
    main > .top-bar {
        display: flex;
        padding: 9px;
    }

    /* Action */
    main > .top-bar > .action {
        display: grid;
        place-items: center;
    }

    /* Title */
    main > .top-bar > .title {
        flex: 1;
        font-family: 'Poppins';
        padding-left: 9px;
        display: flex;
        align-items: center;
        font-size: 1.2rem;
    }

    /* Search bar */
    main > .search-bar {
        padding: 16px;
    }

    /* Content */
    main > .content {
        flex: 1;
        overflow-x: hidden;
        overflow-y: scroll;
        padding-bottom: 16px;
        border-top: 1px solid var(--theme-dividers) !important;
    }

    /* Widget card container */
    .widget-card-container {
        padding: 16px 16px 0 16px;
    }

    /* Media query */
    @media screen and (max-width: 500px) {

        /* Side menu */
        main {
            max-width: 500px;
        }

    }

</style>