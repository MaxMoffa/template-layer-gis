<script>
    import { Icon, Ripple } from 'svelte-materialify/src';
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    export let title = "Esempio";
    export let icon = ""
    export let background = "#000";
    export let maxDimension = false;

    const click = () => {
        dispatch("click");
    }

    const getIcon = async (s) => {
        let icons = await import('@mdi/js');
        let icon;
        if(s)
            icon = icons[s];
        else 
            icon = icons["mdiLeaf"];
        icons = null;
        return icon;
    }

    const getBackground = color => {
        return `background: linear-gradient(180deg, ${color} 0%, rgba(0,0,0,0) 100%);`;
    };

</script>

<main class="elevation-1" on:click={click} use:Ripple style={`${maxDimension ? "width: 100% !important; margin: 0 !important; min-width: 0 !important" : ""}`}>

    <div class="preview" style={getBackground(background)}>

        {#await getIcon(icon) then path}
        
            <Icon {path} size={48} />

        {/await}

    </div>

    <div class="title title-text">
        {title}
    </div>

</main>

<style>

    main {
        width: 300px;
        min-width: 300px;
        max-width: 300px;
        height: 95%;
        border-radius: 6px;
        display: inline-flex;
        flex-direction: column;
        overflow: hidden;
        cursor: pointer;
        scroll-snap-align: center;
        margin: 0 32px;
        background-color: #f1f1f1;
        user-select: none;
    }

    .preview {
        flex: 3;
        border-radius: 6px 6px 0 0;
        display: grid;
        place-items: center;
    }

    .title {
        flex: 1;
        display: grid;
        place-items: center;
        font-size: 12px;
    }

</style>