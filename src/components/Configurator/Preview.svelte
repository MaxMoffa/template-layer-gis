<script>
    import Wrapper from "../Wrapper/Wrapper.svelte";

    export let widgetId = null;
    export let state = null;
    export let token = null;
    export let apikey = null;
    export let lang = "en";

</script>

<!-- Widget preview container -->
<main class="rounded-lg elevation-1">

    <!-- Check if widget id is loaded -->
    {#if widgetId && state}

        <!-- Widget wrapper -->
        {#key state}
        
            <Wrapper 
                {widgetId}
                {token}
                {apikey}
                {lang}
                state={state}
                showContextualOptions={false}
                showOptions={false}
            />


        {/key}

    {:else}

        <!-- Generic error -->
        <div class="no-widget-id">
            <span>
                Ops! Sembra esserci un problema
            </span>
        </div>

    {/if}
</main>

<style>

    main {
        width: 90%;
        max-width: 800px;
        aspect-ratio: 4 / 3;
        display: flex;
        overflow: hidden;
        transform: translate(0);
    }

    .no-widget-id {
        flex: 1;
        display: grid;
        place-items: center;
        user-select: none;
    }

    @media screen and (max-width: 1200px) {

        main {
            width: 60%;
        }

    }

    @media screen and (max-width: 650px) {

        main {
            width: 90%;
        }

    }

</style>