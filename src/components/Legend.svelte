<script>
    import { Tooltip, Ripple, Icon } from 'svelte-materialify/src';
    import { blur } from 'svelte/transition';
    import { mdiPalette } from '@mdi/js';
    import { createEventDispatcher, onDestroy, onMount } from 'svelte';
    
    const dispatch = createEventDispatcher();

    export let limits = {};
    export let legend = [];
    export let active = true;
    export let collapsable = false;
    export let value = null;
    export let classActive = "";
    export let classCollapsed = "";
    export let expand = false;
    export let vertical = false;

    let visible = false;

    $: active, update();

    onMount(() => {
        visible = true;
    });

    onDestroy(() => {
        visible = null;
    });

    let limitsLevel = Object.keys(limits);

    function getPercentage(value, limits) {
        let percentage = (value * 100) / limits.max;
        percentage = percentage > 100 ? 100 : percentage;  
        return percentage
    }

    function update() {
        if(!collapsable)
            return;
        visible = false;
        setTimeout(() => {
            visible = true;
        }, 1000);
    }

    function getBackground(legend) {
        let s = "";
        let p = 0;
        let increment = 100 / legend.length;

        legend.forEach(c => {
            s += `${c} ${p}%,`;
            p += increment;
        });

        s = s.substring(0, s.length-1);

        return `linear-gradient(${vertical ? "45deg" : "90deg"}, ${s})`;
    }

    function toogle() {
        active= !active;
        dispatch("change", active);
    }

</script>

<main {vertical} style={expand ? "width: 100% !important; height: 100% !important" : ""} class="elevation-2 rounded {active ? classActive : classCollapsed}" on:click={toogle} isActive={active || !collapsable}>
    {#if visible}
        <div {vertical} transition:blur|local="{{amount: 10}}" style={`background: ${getBackground(legend)}`} use:Ripple>
            {#if active || !collapsable}
                {#if value && limits}
                    <div class="value-indicator" style={`left: ${getPercentage(value, limits)}%`}>
                        <div></div>
                    </div>
                {/if}
                {#each limitsLevel as level, i}
                    <div class="level">
                        <Tooltip top>
                            <span class="white-text font-weight-black">
                                {limits[level]}
                            </span>
                            <span slot="tip">{level}</span>
                        </Tooltip>
                    </div>
                {/each}
            {:else}
                <div class="btn-closed primary-color">
                    <Icon size={24} path={mdiPalette} class="white-text" />
                </div>
            {/if}
        </div>
    {/if}
</main>

<style type="scss">

    @import '../theme/_material-theme.scss';

    main {
        width: 200px;
        height: 32px;
        overflow: hidden;
        cursor: pointer;
        transition: 1s ease all;
        font-size: 12px;
    }

    main[vertical=true] {
        width: 32px;
        height: 200px;
    }

    main[isActive=false] {
        background-color: $primary-color;
        display: grid;
        place-items: center;
        width: 32px;
    }

    main[isActive=false][vertical=true] {
        display: grid;
        place-items: center;
        height: 32px;
    }

    main > div {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: row-reverse;
    }

    main > div[vertical=true] {
        flex-direction: column;
    }

    main > div > .level {
        flex: 1;
        display: grid;
        place-items: center;
    }

    main span {
        user-select: none;
    }

    .btn-closed {
        width: 32px;
        height: 32px;
        display: grid;
        place-items: center;
        cursor: pointer;
        transition: 1s all;
    }

    .value-indicator {
        position: absolute;
        width: auto;
        height: 100%;
        display: grid;
        place-items: center;
    }

    .value-indicator > div {
        width: 6px;
        height: 80%;
        border-radius: 6px;
        border: 2px solid #fff;
    }

</style>