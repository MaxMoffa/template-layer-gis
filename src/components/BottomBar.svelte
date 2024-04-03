<script>
    import { Ripple, Icon } from 'svelte-materialify/src';
    import { mdiHome, mdiAccount, mdiViewDashboard } from '@mdi/js';
    import { theme, getColor } from '../store/theme';
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    let _theme = "light";
    theme.subscribe(val => _theme = val);

    export let classBar = "";
    export let activeColor = "teal";
    export let isActive = s => s === "";
    export let showTitle = true;
    export let showLarge = true;
    export let user = null;

    const items = [
        {name: "Home", path: "/index", icon: mdiHome, isAdmin: false},
        {name: "Dashboard", path: "/dash", icon: mdiViewDashboard, isAdmin: true},
        {name: "Utente", path: "/account", icon: mdiAccount, isAdmin: false}
    ]

    function changePage(item) {
        dispatch("change", item);
    }

    function getActiveColor(theme) {
        if(theme === "dark")
            return "white-text " + activeColor;
        return activeColor + "-text teal teal lighten-5";
    }

</script>

<main class="elevation-15 pa-1 {getColor(_theme)} {classBar}">

    {#each items as item}
    
        {#if !item.isAdmin || (user !== null && user.type === "Admin")}
        
            <div style={isActive(item.path) && showLarge ? "flex: 2" : ""} class="item pa-1" on:click={() => changePage(item)}>

                <div class="wrapper-content rounded-lg {isActive(item.path) ? getActiveColor(_theme) : ""}">

                    <div class="rounded-lg" style="width: 100%; height: 100%" use:Ripple={{centered: true}}>

                        <div class="content rounded">

                            <div>
                                <Icon class="{isActive(item.path) ? getActiveColor(_theme) : ""}" path={item.icon} />
                            </div>

                            {#if isActive(item.path) && showTitle}
                            
                                <div class="font-weight-light text-caption">
                                    {item.name}
                                </div>

                            {/if}

                        </div>

                    </div>

                </div>

            </div>

        {/if}

    {/each}

</main>

<style>

    main {
        position: absolute;
        width: 100%;
        height: 70px;
        bottom: 0;
        left: 0;
        display: flex;
        flex-direction: row;
    }

    main > .item {
        flex: 1;
        display: flex;
        transition: 0.3s ease flex;
        max-width: 500px;
        margin: 0 auto;
    }

    main > .item > .wrapper-content {
        flex: 1;
        transition: 0.3s ease background-color;
    }

    main > .item > .wrapper-content > div {
        display: grid;
        place-items: center;
    }

    main > .item > .wrapper-content > div > .content {
        display: grid;
        place-items: center;
        user-select: none;
    }

</style>