<script>
    import { mdiClose } from '@mdi/js';
    import { createEventDispatcher, onDestroy } from 'svelte';
    import { AppBar, Button, Card, CardActions, CardSubtitle, CardTitle, Icon } from 'svelte-materialify/src';
    import { quintOut } from 'svelte/easing';
    import { fade, fly } from 'svelte/transition';
    import { theme, getColor, getColorInverted, getBackground } from '../../store/theme';

    export let active = false;
    export let activeLayers = [];

    // Dispatcher
    const dispatch = createEventDispatcher();

    // Theme color
    let _theme = "light";
    let unsubscribeTheme = theme.subscribe(val => _theme = val);

    // Appbar
    let flat = true;

    // Layers
    const layers = [
        {
            name: "Air Quality",
            id: "AirQuality",
            title: "Qualità dell'aria",
            subtitle: "Questo layer ti consente di osservare la qualità dell'aria su una mappa",
            cover: "/media/layers/airQuality_layer.png"
        },
        {
            name: "Base map",
            id: "BaseMap",
            title: "Background",
            subtitle: "Questo layer ti consente di cambiare la tipologia di mappa visualizzata, in modo tale da utilizzare quella più adatto a te",
            cover: "/media/layers/baseMap_layer.png"
        },
        {
            name: "Sensors",
            id: "Sensors",
            title: "Dispostivi",
            subtitle: "Questo layer ti consente di visualizzare tutti i dispostivi collegati al tuo account",
            cover: "/media/layers/sensors_layer.png"
        },        
        {
            name: "Wind",
            id: "Wind",
            title: "Vento",
            subtitle: "Questo layer ti consente di visualizzare l'andamento del vento in tutto il mondo",
            cover: "/media/layers/wind_layer.jpg"
        }
    ]

    // On layer selector destroy
    onDestroy(() => {

        // Unsubscribe to theme update
        unsubscribeTheme();

    });

    // Scroll handler
    function scrollHandler(e) {
        
        // Check scroll position
        if(e.target.scrollTop > 0)
            flat = false;
        else
            flat = true;

    }

    // Dispatch add event
    function dispatchAddEvent(id) {
        
        // Dispatch add
        dispatch("add", id);

        // Close selector
        active = false;

    }

</script>

<!-- Check if layer selector is active -->
{#if active}

    <!-- Main container -->
    <main>

        <!-- Background overlay -->
        <div class="background {getColorInverted(_theme)}" transition:fade />

        <!-- Content -->
        <div class="content">

            <!-- Popup -->
            <div class="popup rounded {getBackground(_theme)} elevation-1" transition:fly="{{delay: 0, duration: 300, x: 0, y: 500, opacity: 0, easing: quintOut}}">

                <!-- Appbar container -->
                <div class="appbar-container">

                    <!-- Appbar -->
                    <AppBar {flat} class="{getBackground(_theme)}">

                        <!-- Close button -->
                        <span slot="icon">

                            <!-- Button -->
                            <Button icon on:click={() => active = false}>

                                <!-- Icon -->
                                <Icon path={mdiClose} />

                            </Button>

                        </span>

                        <!-- Title -->
                        <span slot="title">
                            Layers
                        </span>

                    </AppBar>

                </div>

                <!-- List -->
                <div class="list pa-3" on:scroll={scrollHandler}>

                    <!-- Check if all layers are rendered -->
                    {#if layers.length === activeLayers.length}
                    
                        <!-- No layer to add -->
                        <div class="text-center pt-9">
                            Nessun layer da aggiungere
                        </div>

                    {/if}

                    <!-- Iterate over layers -->
                    {#each layers as layer}
                    
                        <!-- Check if layer is active -->
                        {#if !activeLayers.includes(layer.name)}

                            <!-- Layer card -->
                            <Card class="mb-3">

                                <!-- Layer cover -->
                                <img class="cover-layer" src={layer.cover} alt="background" />
        
                                <!-- Title -->
                                <CardTitle>
                                    {layer.title}
                                </CardTitle>
        
                                <!-- Subtitle -->
                                <CardSubtitle>
                                    {layer.subtitle}
                                </CardSubtitle>
    
                                <!-- Actions -->
                                <CardActions>
    
                                    <!-- Add layer button -->
                                    <Button text size="small" on:click={() => dispatchAddEvent(layer.id)}>
                                        Aggiungi alla mappa
                                    </Button>
    
                                </CardActions>
    
                            </Card>
                            
                        {/if}

                    {/each}

                </div>


            </div>

        </div>

    </main>

{/if}

<style>

    /* Main container */
    main {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        z-index: 3;
    }

    /* Background */
    main > .background {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        opacity: .3;
    }

    /* Content */
    main > .content {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        display: grid;
        place-items: center;
    }

    /* Popup */
    main > .content > .popup {
        width: auto;
        width: 90%;
        max-width: 400px;
        height: 90%;
        max-height: 600px;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    /* Popup list */
    main > .content > .popup > .list {
        flex: 1;
        overflow-y: auto;
    }

    /* Layer cover */
    .cover-layer {
        width: 100%;
        height: 100px;
        object-fit: cover;
        user-select: none;
    }

</style>