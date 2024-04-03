<script>
    export let error = null;
    export let onError = null;

    $: if ($error && onError) onError($error);
</script>

{#if $error}
    Unable to load
{:else}
    <slot />
{/if}