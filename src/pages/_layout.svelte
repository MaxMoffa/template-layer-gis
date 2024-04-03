<script>
    import { onDestroy } from "svelte";
    import DictDog from "../core/DictDog.svelte";
    import { theme, getBackground } from '../store/theme';

    // Theme state
    let _theme = "light";
    let unsubscribeTheme = theme.subscribe(val => _theme = val);

    // On layout destroy
    onDestroy(() => {

        // Unsubscribe to theme update
        unsubscribeTheme();

    });

</script>

<!-- Main platform container -->
<main class="{getBackground(_theme)}">

    <!-- 
        DICTIONARY LOADER
        - Load the dictionary object for each page
    -->
    <DictDog let:getDictionary>

        <slot 
            scoped={{ 
                getDictionary,
            }} 
        />

    </DictDog>

</main>

<style>

    /* Main platform container */
    main {
        position: relative;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        transform: translate(0);
    }

</style>