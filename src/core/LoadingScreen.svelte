
<script>
    import { ProgressCircular } from "svelte-materialify/src";
    import { theme, getBackground } from '../store/theme';
    import { onDestroy } from "svelte";

    export let active = true;

    // Theme state
    let _theme = "light";
    let unsubscribeTheme = theme.subscribe(val => _theme = val);

    // On loading screen destroy
    onDestroy(() => {

        // Unsubscribe to theme update
        unsubscribeTheme();

    });

</script>

<!-- Check if loading screen is active -->
{#if active}

    <!-- Loading screen -->
    <main class="{getBackground(_theme)}">

        <!-- Loading indicator -->
        <ProgressCircular indeterminate color="primary" />

    </main>

    
{/if}

<style>

    /* Verification loading */
    main {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: grid;
        place-items: center;
        z-index: 10000;
    }

</style>