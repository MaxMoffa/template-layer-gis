<script>
	import { Ripple, Dialog, ListItem, Button } from 'svelte-materialify/src';
    import { url } from '@roxi/routify'

    export let APP_NAME;
    export let USER_EMAIL;

    const USER = "user", APP = "app";

    let active = false;
    let MENU_ID = APP;
    let BAR_ITEM_CLASS = "bar-item" + (USER_EMAIL ? "" : " disabled");

    function showMenu(ID) {
        MENU_ID = ID;
        active = true;
    }

    function logout() {
        localStorage.clear();
        window.location.reload();
    }
</script>

<main id="action-bar" class="generic-card">

    <div>
        <!-- app info and update -->
        <div class="bar-item">
            <div class="grid-container">
                <a class="app-name special" use:Ripple={{ centered: true }} href={$url('..')}>
                    <img src="./media/sqd_icon.png" alt="">
                </a>
            </div>
        </div>    
    </div>

    <div class="btn-group">
        <!-- shop -->
        <div class="bar-item">
            <div class="grid-container">
                <a class="general" use:Ripple={{ centered: true }} href={$url('../shop')}>
                    Buy data
                </a>
            </div>
        </div>

        <div class={"bar-item disabled"}>
            <div class="grid-container">
                <a class="general" use:Ripple={{ centered: true }}>
                    Marketplace
                </a>
            </div>
        </div>

        <div class={"bar-item disabled"}>
            <div class="grid-container">
                <a class="general" use:Ripple={{ centered: true }}>
                    Technology
                </a>
            </div>
        </div>

        <div class={"bar-item disabled"}>
            <div class="grid-container">
                <a class="general" use:Ripple={{ centered: true }}>
                    Contact us
                </a>
            </div>
        </div>
    </div>

    <div>
        <!-- user settings -->
        {#if USER_EMAIL}
            <div class="bar-item user-item">
                <div class="grid-container">
                    <span class="special" use:Ripple={{ centered: true }} on:click={() => showMenu(USER)}>
                        {USER_EMAIL}
                    </span>
                </div> 
            </div>
        {:else}
            <div class="bar-item user-item">
                <div class="grid-container">
                    <a class="special" use:Ripple={{ centered: true }} href={$url('./login')}>
                        Log-in/Sign-up
                    </a>
                </div> 
            </div>
        {/if}
    </div>

    <div id="dialog-menu" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; z-index: 1002; pointer-events: none">
        <Dialog class="pa-4 elevation-2" bind:active>
            
            {#if MENU_ID === APP}

                <img class="app-icon" src="./media/sense_square.png" alt="logo">

                <ListItem>
                    Versione
                    <span slot="append">
                        1.0 ß
                    </span>
                </ListItem>

                <ListItem>
                    <Button style="width: 100%" disabled> Verifica aggiornamenti </Button>   
                </ListItem>

            {:else if MENU_ID === USER}
            
                <ListItem>
                    <span class="text-h6">
                        Utente
                    </span>
                </ListItem>

                <ListItem>
                    Email
                    <span slot="append">
                        {USER_EMAIL}
                    </span>
                </ListItem>

                <ListItem>
                    <Button style="width: 100%" on:click={logout.bind(this)}> Logout </Button>   
                </ListItem>

            {/if}
            
        </Dialog>
    </div>

</main>

<style>

    main {
        flex: 2;
        overflow-y: hidden;
        overflow-x: auto;
        background-color: #333333;
        -moz-user-select: none;
        -webkit-user-select: none;
        display: grid;
        grid-auto-flow: column;
        overflow-x: auto;
        white-space: nowrap;
        color: #fff;
    }

    main .bar-item{
        display: inline-block;
        width: max-content;
        height: 100%;
        cursor: pointer;
        padding: 0 6px;
    }

    main .bar-item .grid-container {
        width: 100%;
        height: 100%;
        display: grid;
        place-items: center;
    }

    main .bar-item .general:hover{
        color: #000;
        background-color: #fff;
    }

    main .bar-item .special:hover{
        background-color: #bdbdbd;
    }

    main .bar-item .general{
        padding: 6px 16px;
        min-width: 64px;
        text-align: center;
        border-radius: 50px;
        border: 1px solid #fff;
        font-size: 18px;
    }

    main .bar-item .special{
        min-width: 64px;
        text-align: center;
        border-radius: 16px;
    }

    main .bar-item img{
        display: block;
        width: 32px;
        margin: 0 auto;
    }

    main .bar-item .app-name{
        font-weight: 700;
    }

    .disabled {
        cursor: not-allowed !important;
    }

    .disabled span {
        color: #757575;
    }

    #dialog-menu .app-icon{
        width: 100%;
        max-width: 200px;
        height: auto;
        display: block;
        margin: 0 auto;
    }

    .user-item {
        float: right;
    }

    .btn-group {
        display: grid;
        grid-auto-flow: column;
        overflow-x: auto;
        white-space: nowrap;
    }

</style>