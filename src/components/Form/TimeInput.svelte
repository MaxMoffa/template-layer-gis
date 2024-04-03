<script>
    import { createEventDispatcher, onDestroy } from "svelte";
    import { getBackgroundCode, getColor, getColorInverted, theme } from "../../store/theme";
    import moment from "moment";

    export let size = "default";
    export let variant = false;
    export let outlined = false;
    export let block = false;
    export let rounded = false;
    export let placeholder;
    export let disabled = false;
    export let readonly = false;
    export let max, min;
    export let value;

    // Date format
    const DATE_FORMAT = "HH:mm";

    // Dispatcher
    const dispatch = createEventDispatcher();

    $: value, updateInputValue();

    // Input value
    let inputValue = moment( value ).format( DATE_FORMAT );

    // Theme handler
    let _theme = "light";
    const unsubscribeTheme = theme.subscribe(val => _theme = val);

    // On component destroy
    onDestroy(() => {

        // Unsubscribe to theme update
        unsubscribeTheme();

    });

    // Update value
    function updateValue(date) {

        // Get hours and minutes
        let [ hours, minutes ] = date.target.value.split(":");

        // Prepare new value
        let newValue = moment().set("hours", hours).set("minutes", minutes);

        // Update value
        value = newValue.format();

        // Dispatch change
        dispatch("change", value);

    }

    // Update input value
    function updateInputValue() {

        // Prepare new input value
        let newInputValue = moment( value ).format( DATE_FORMAT );

        // Check if they are the same
        if(inputValue === newInputValue)
            return;

        // Update value
        inputValue = newInputValue;

    }

</script>

<!-- Input -->
<input
    type="time"
    style="--color: {variant ? getBackgroundCode(_theme) : getColor(_theme)}; --focus-color: {getColorInverted(_theme)};"
    class="square-input size-{size}"
    bind:value={inputValue}
    {placeholder}
    {disabled}
    {readonly}
    {outlined}
    {rounded}
    {block}
    {max}
    {min}
    on:change={e => updateValue( e )}
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