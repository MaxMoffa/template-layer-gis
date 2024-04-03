<script>

    export let vertical = false;

</script>

<!-- Divider -->
<div class="divider" {vertical} />

<style>

    /* Divider */
    .divider {
        background-color: var(--theme-dividers);
    }

    /* Divider horizontal */
    .divider[vertical = false] {
        width: 100%;
        height: 1px;
    }

    /* Divider vertical */
    .divider[vertical = true] {
        width: 1px;
        height: 100%;
    }

</style>