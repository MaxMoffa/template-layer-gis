<script>
    import { createEventDispatcher, onDestroy } from 'svelte';
    import { getBackground, getColor, theme } from '../store/theme';
    import { Icon } from 'svelte-materialify/src';

    // Create event dispatcher
    const dispatch = createEventDispatcher();

    // Theme handler
    let _theme = "light";
    const unsubscribeTheme = theme.subscribe(val => _theme = val);

    export let options = [
        {
            name: "Pippo",
            value: "pippo"
        },
        {
            name: "Pluto",
            value: "pluto"
        }
    ];
    export let selected = options[0].key;
    export let disabled = false;
    export let variant = false;

    // On component destroy
    onDestroy(() => {

        // Unsubscribe to theme update
        unsubscribeTheme();

    });

    // Update selected value
    function update(value) {

        // Update selected value
        selected = value;

        // Dispatch change to parent component
        dispatch("change", value);

    }

</script>

<!-- Main container -->
<main>

    <!-- Iterate over options -->
    {#each options as option,i}

        <!-- Check if is selected -->
        {@const active = selected === option.value}
    
        <!-- Option -->
        <button {disabled} class="option {active ? option?.class ?? "primary-color white-text" : `${variant ? getBackground(_theme) : getColor(_theme)}`}" index={i < options.length - 1 ? i : "end"} {active} on:click={() => update(option.value)}>
            
            <!-- Check if there is a name -->
            {#if option?.name}
                
                <!-- Name -->
                <span>
                    {option.name}
                </span>

            {/if}

            <!-- Check if there is an icon -->
            {#if option?.icon}
        
                <!-- icon -->
                <span class="{option?.name ? "ml-1" : ""}">
                    <Icon class="{active ? "primary-color white-text" : ""}" path={option.icon} />
                </span>

            {/if}

        </button>

    {/each}

</main>

<style>

    /* Main container */
    main {
        border-radius: 6px;
        border: 1px solid var(--theme-dividers);
        display: flex;
        user-select: none;
        overflow: hidden;
    }

    /* Option */
    main > .option {
        flex: 1;
        padding: 12px 6px;
        border-left: .5px solid var(--theme-dividers);
        border-right: .5px solid var(--theme-dividers);
        transition: .2s ease all;
    }

    /* Option HOVER */
    main > .option:hover[active=false]:not(:disabled) {
        opacity: .4;
    }

    /* Option label */
    main > .option > span {
        opacity: .8;
        font-family: 'Poppins';
        font-weight: bold;
    }

    /* First option */
    button[index="0"] {
        border-left: unset !important;
    }

    /* Last option */
    button[index="end"] {
        border-right: unset !important;
    }

</style>