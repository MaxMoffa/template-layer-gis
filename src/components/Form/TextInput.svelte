<script>
    import { onDestroy } from "svelte";
    import { getBackgroundCode, getColor, getColorInverted, theme } from "../../store/theme";

    export let size = "default";
    export let variant = false;
    export let outlined = false;
    export let block = false;
    export let rounded = false;
    export let placeholder;
    export let disabled = false;
    export let readonly = false;
    export let value;

    // Theme handler
    let _theme = "light";
    const unsubscribeTheme = theme.subscribe(val => _theme = val);

    // On component destroy
    onDestroy(() => {

        // Unsubscribe to theme update
        unsubscribeTheme();

    });

</script>

<!-- Input -->
<input
    type="text"
    style="--color: {variant ? getBackgroundCode(_theme) : getColor(_theme)}; --focus-color: {getColorInverted(_theme)};"
    class="square-input size-{size}"
    bind:value={value}
    {placeholder}
    {disabled}
    {readonly}
    {outlined}
    {rounded}
    {block}
    on:change
    on:input
    on:keydown
    on:keyup
    on:keypress
    on:focus
    on:blur
/>

<style>

    /* Import input generic style */
    @import url("InputStyle.css");

    /* 
        Sizes 
    */

    /* Default size */
    .size-default {
        height: 32px !important;
        padding: 0 9px;
        font-size: 16px;
    }

    /* Large size */
    .size-large {
        height: 48px;
        padding: 0 9px;
        font-size: 16px;
    }

    /* Small size */
    .size-small {
        height: 28px;
        padding: 0 9px;
        font-size: 12px;
    }

    /* X Small size */
    .size-x-small {
        height: 24px;
        padding: 0 9px;
        font-size: 12px;
    }

</style>