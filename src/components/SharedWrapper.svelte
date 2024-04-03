<script>

    import { Divider, Chip } from 'svelte-materialify/src';
    import Wrapper from '../components/Wrapper.svelte';

    // Widgets
    export let widgetLeft = null;
    export let widgetRight = null;
    export let divider = 5;

    async function loadWidget(id) {
        return null;
    }

</script>

<main>

    <div class="content">

        <div class="widget-1 pr-2" style="flex: {divider};">

            <div class="widget-content rounded-sm grey">

                {#if widgetLeft}

                    {#await loadWidget(widgetLeft.id) then widget}
                    
                        <Wrapper />

                    {/await}

                {:else}

                    <div class="no-widget-selected">

                        <div class="content">
                            <div>
                                Seleziona il widget sinistro
                            </div>
                            <div class="mt-3">
                                <Chip class="primary-color" link>
                                    Seleziona
                                </Chip>
                            </div>
                        </div>
        
                    </div>

                {/if}
                
            </div>
    
        </div>
    
        <div class="pt-6 pb-6">
            <Divider vertical />
        </div>
    
        <div class="widget-2 pl-2" style="flex: {10-divider};">

            <div class="widget-content rounded-sm grey">

                {#if widgetRight}

                    {#await loadWidget(widgetRight.id) then widget}
                    
                        <Wrapper />
                        
                    {/await}

                {:else}

                    <div class="no-widget-selected">

                        <div class="content">
                            <div>
                                Seleziona il widget destro
                            </div>
                            <div class="mt-3">
                                <Chip class="primary-color" link>
                                    Seleziona
                                </Chip>
                            </div>
                        </div>
        
                    </div>

                {/if}
                
            </div>
    
        </div>

    </div>

    <div class="shared-value pt-2">
        <Chip label class="primary-color" link>
            ITCAMBAT134567
        </Chip>
    </div>

</main>

<style>

    main {
        display: flex;
        flex-direction: column;
        height: 600px;
    }

    main > .content {
        display: flex;
        flex-direction: row;
        flex: 1;
    }

    main > .content > .widget-1 {
        flex: 1;
    }

    main > .content > .widget-2 {
        flex: 1;
    }

    main > .shared-value {
        display: grid;
        place-items: center;
    }

    main .widget-content {
        width: 100%;
        height: 100%;
        overflow: auto;
    }

    main .no-widget-selected {
        width: 100%;
        height: 100%;
        display: grid;
        place-items: center;
    }

    main .no-widget-selected > .content > div {
        display: grid;
        place-items: center;
    }

</style>