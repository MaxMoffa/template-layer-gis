<script>

    import { Icon, Ripple } from 'svelte-materialify/src';
    import { createEventDispatcher } from 'svelte';
    import { theme, getColor } from '../store/theme';

    // Theme info
    let _theme = "light";
    theme.subscribe(val => _theme = val);

    const dispatch = createEventDispatcher();

    export let name = "Geomap";
    export let icon = "mdiAccessPoint";
    export let subtitle = null;
    export let color = "#673ab7"

    const click = () => {
        dispatch("click");
    }

    const getIcon = async (s) => {
        let icons = await import('@mdi/js');
        if(s)
            return icons[s];
        return icons.mdiLeaf;
    }

    const getBackground = color => {
        return `background: linear-gradient(180deg, ${color} 0%, ${getColor(_theme)} 100%);`;
    };

</script>

<main class="rounded-lg elevation-1 {getColor(_theme)}" on:click={click} use:Ripple>

    <div class="icon pt-16 pb-16" style={getBackground(color)}>
        {#await getIcon(icon) then icon} 
            <Icon size={64} path={icon} />
        {/await}
    </div>
    
    <div class="text-subtitle-2 pl-6 pt-4 pb-2 green-text">
        {#if subtitle}
            {subtitle}
        {/if}
    </div>

    <div class="name pl-6 pb-6">
        {name}
    </div>

</main>

<style>

    main {
        width: 100%;
        height: auto;
        cursor: pointer;
    }

    main > .icon {
        width: 100%;
        height: auto;
        display: grid;
        place-items: center;
    }

    main > .name {
        user-select: none;
    }

</style>