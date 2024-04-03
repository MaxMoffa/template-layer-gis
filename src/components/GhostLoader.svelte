<script>
    import { onDestroy } from 'svelte';
    import { getBackgroundInvertedCode, theme } from '../store/theme';

    // Theme handler
    let _theme = "light"
    const unsubscribeTheme = theme.subscribe(val => _theme = val);

    export let active = true;

    // On component destroy
    onDestroy(() => {

        // Unsubscribe to theme updates
        unsubscribeTheme();

    });

</script>

<!-- Check if is active -->
{#if active}

    <!-- Main loader container -->
    <main>

        <!-- Loader -->
        <div class="loader" style="background: linear-gradient(90deg, {getBackgroundInvertedCode(_theme)}00 10%, {getBackgroundInvertedCode(_theme)}33 50%, {getBackgroundInvertedCode(_theme)}00 100%);" />

    </main>

{/if}

<style>

    /* Main loader container */
    main {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }

    /* Loader */
    main > .loader {
        position: absolute;
        top: 0;
        left: -20%;
        width: 20%;
        height: 100%;
        animation-name: loaderAnimation;
        animation-duration: .5s;
        animation-iteration-count: infinite;
    }

    /* Animation for the loader element */
    @keyframes loaderAnimation {
        from { left: -20%; }
        to { left: 100%; }
    }

</style>