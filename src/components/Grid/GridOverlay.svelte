<script>
    import { theme, getBackground } from '../../store/theme';
    import { Avatar, Button, ProgressCircular } from "svelte-materialify/src";
    import { onDestroy, createEventDispatcher } from 'svelte';

    // Event emitter
    const dispatch = createEventDispatcher();

    // Theme handler
    let _theme = "light";
    let unsubscribeTheme = theme.subscribe(val => _theme = val);

    export let activeLoading = false;
    export let activeError = false;
    export let activeEmpty = false;

    onDestroy(() => {
        unsubscribeTheme();
    });

</script>

<!-- Enable/Disable overlay -->
{#if activeLoading || activeEmpty || activeError}

    <!-- Grid overlay -->
    <main class="{getBackground(_theme)}">

        {#if activeLoading}
    
            <!-- Grid loading -->
            <div class="grid-info">
                <ProgressCircular size={64} indeterminate color="primary" />
            </div>  
            
        {:else if activeEmpty}

            <!-- Grid info -->
            <div class="grid-info">
        
                <!-- Error box -->
                <div class="error-box">
    
                    <!-- Avatar with danger sign -->
                    <div class="d-flex justify-center pb-6">
                        <img src="/media/grape_pack/drawkit-grape-pack-illustration-7.svg" height="300" alt="Empty">
                    </div>
    
                    <!-- Text message -->
                    <h6 class="text-h6 text-center pb-6">
                        Non c'è nessun widget su questa griglia
                    </h6>
    
                    <!-- Refresh grid button -->
                    <div class="d-flex justify-center">
                        <Button text rounded class="primary-color-text" on:click={() => {
                            
                            // Emitt add widget event
                            dispatch("addWidget");

                        }}>
                            Aggiungi un widget
                        </Button>
                    </div>
    
                </div>
    
            </div>    
    
        {:else if activeError}
    
            <!-- Grid info -->
            <div class="grid-info">
                
                <!-- Error box -->
                <div class="error-box">
    
                    <!-- Avatar with danger sign -->
                    <div class="d-flex justify-center pb-6">
                        <Avatar size={64} class="red white-text">
                            <h3 class="text-h3">
                                !
                            </h3>
                        </Avatar>
                    </div>
    
                    <!-- Text message -->
                    <h6 class="text-h6 text-center pb-6">
                        Sembra esserci un problema, prova a ricaricare la griglia
                    </h6>
    
                    <!-- Refresh grid button -->
                    <div class="d-flex justify-center">
                        <Button text rounded class="red-text" on:click={() => {
                            
                            // Emitt reload event
                            dispatch("reload");

                        }}>
                            Ricarica
                        </Button>
                    </div>

                    <!-- Reset grid button -->
                    <div class="d-flex justify-center">
                        <Button text rounded size="x-small" class="red-text" on:click={() => {
                            
                            // Emitt reset event
                            dispatch("reset");

                        }}>
                            Reset
                        </Button>
                    </div>
    
                </div>
    
            </div>    
    
        {/if}

    </main>

{/if}

<style>

    /* Grid overlay */
    main {
        position: absolute;
        top: 0;
        width: 100%;
        height: 100%;
        display: grid;
        place-items: center;
    }

    /* Grid info */
    main > .grid-info {
        width: 100%;
        height: auto;
        display: grid;
        place-items: center;
    }

    /* Error box */
    main > .grid-info > .error-box {
        width: 100%;
        max-width: 400px;
    }

</style>