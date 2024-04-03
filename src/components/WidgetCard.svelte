<script>
    export let background = "";
    export let locked = false;
</script>

<main class="{background}" {locked}>

    <slot />

</main>

<style>
    main {
        height: 100%;
        width: 100%;
        overflow: hidden;
        border-radius: 6px;
        border: 1px solid var(--theme-dividers) !important;
    }
    main[locked = true]{
        border: 1px solid orange !important;
    }
</style>