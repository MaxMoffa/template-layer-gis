<script>

    import { Overlay, ClickOutside, AppBar, List, ListItem, Button, Icon } from 'svelte-materialify/src';
    import { mdiClose } from "@mdi/js";

    export let ask = false;

</script>

{#if ask}

    <div class="ask-container">
        <Overlay>

            <div class="dialog white rounded-lg pa-2"  use:ClickOutside on:clickOutside={() => ask = false}>

                <AppBar flat class="white">
                    <span slot="icon">
                        <Button icon on:click={() => ask = false}>
                            <Icon path={mdiClose} />
                        </Button>
                    </span>
                    <span slot="title">
                        Seleziona dati
                    </span>
                </AppBar>
        
        
                <List>

                    <ListItem>
                        Salerno
                        <span slot="subtitle">
                            Medie giornaliere dal 13/5/2022 al 20/5/2022
                        </span>
                        <span slot="append">  
                            <Button class="primary-color white-text" depressed rounded size="small" disabled>
                                Usa
                            </Button>
                        </span>
                    </ListItem>

                </List>

            </div>

        </Overlay>
    </div>

{/if}

<style>

    .ask-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }

    .dialog {
        max-height: 500px;
        overflow-y: auto;
    }

</style>