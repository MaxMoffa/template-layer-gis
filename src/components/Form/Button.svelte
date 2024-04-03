<script>
    import { onDestroy } from "svelte";
    import { getBackgroundCode, getColor, getColorInverted, theme } from "../../store/theme";

    // Inside class info
    let klass = '';

    export { klass as class };
    export let rounded = false;
    export let block = false;
    export let variant = false;
    export let text = false;
    export let icon = false;
    export let outlined = false;
    export let size = "default";
    export let disabled = false;
    export let ref = null;
    export let href = null;

    // Theme handler
    let _theme = "light";
    const unsubscribeTheme = theme.subscribe(val => _theme = val);

    // On component destroy
    onDestroy(() => {

        // Unsubscribe to theme update
        unsubscribeTheme();

    });

</script>

<!-- Check if there is an href -->
{#if href === null}

    <!-- Button -->
    <button bind:this={ref} style="--color: {variant ? getBackgroundCode(_theme) : getColor(_theme)}; --focus-color: {getColorInverted(_theme)};" class="btn {klass} size-{size}" {rounded} {block} {text} {icon} {outlined} {disabled} on:focus on:blur on:click>

        <!-- Slot container -->
        <span class="center-container">

            <!-- Fake child TRICK -->
            <span />

            <!-- Slot container -->
            <div class="slot-container">

                <!-- Default slot -->
                <slot>
                    Button
                </slot>

            </div>

        </span>

    </button>

{:else}

    <!-- Button -->
    <a bind:this={ref} style="--color: {variant ? getBackgroundCode(_theme) : getColor(_theme)}; --focus-color: {getColorInverted(_theme)};" class="btn {klass} size-{size}" {href} {rounded} {block} {text} {icon} {outlined} {disabled} on:focus on:blur>

        <!-- Slot container -->
        <span class="center-container">

            <!-- Fake child TRICK -->
            <span />

            <!-- Default slot -->
            <slot>
                Button
            </slot>

        </span>

    </a>
    
{/if}

<style>

    /* Button */
    .btn {
        user-select: none;
        font-family: 'Poppins';
        outline-color: var(--primary);
        border-radius: 6px;
        border: 1px solid var(--theme-dividers) !important;
        display: inline;
        transition: .2s ease all;
        background-color: var(--color);
        cursor: pointer;
        text-decoration: none;
        color: inherit;
    }

    /* Center container */
    .btn > .center-container {
        display: flex;
        align-items: center;
    }

    /* Slot container */
    .btn > .center-container > .slot-container {
        display: flex;
        flex: 1;
        justify-content: center;
        gap: 9px;
    }

    /* Button DISABLED */
    .btn:disabled {
        cursor: not-allowed;
    }

    /* Button BLOCK */
    .btn[block=true] {
        width: 100%;
    }

    /* 
        Rounded 
    */

    /* Text */
    .btn[rounded = true] {
        border-radius: 32px;
    }

    /* 
        Text 
    */

    /* Text */
    .btn[text = true] {
        background: unset !important;
        border-color: transparent !important;
    }


    /* 
        Icon 
    */

    /* Icon */
    .btn[icon = true] {
        background: unset !important;
        border-color: transparent !important;
        padding: 0 !important;
    }

    /* 
        Outlined 
    */

    /* Outline */
    .btn[outlined = true] {
        border: 1px solid var(--focus-color) !important;
    }

    /* 
        Sizes 
    */

    /* Default size */
    .size-default {
        height: 32px !important;
        padding: 0 9px;
        font-size: 16px;
    }

    /* Default size ICON */
    .size-default[icon = true] {
        width: 32px;
        height: 32px;
    }

    /* Large size */
    .size-large {
        height: 48px;
        padding: 0 9px;
        font-size: 16px;
    }

    /* Large size ICON */
    .size-large[icon = true] {
        width: 48px;
        height: 48px;
    }

    /* Small size */
    .size-small {
        height: 28px;
        padding: 0 9px;
        font-size: 12px;
    }

    /* Small size ICON */
    .size-small[icon = true] {
        width: 28px;
        height: 28px;
    }    

    /* X Small size */
    .size-x-small {
        height: 24px;
        padding: 0 9px;
        font-size: 12px;
    }

    /* X Small size ICON */
    .size-x-small[icon = true] {
        width: 24px;
        height: 24px;
    }

    /* 
        Animations
    */

    /* Button animation ACTIVE */
    .btn:active:not(:disabled) {
        transform: scale(.96);
    }

    /* Verify if user input can hover */
    @media (hover: hover) {

        /* Button animation HOVER */
        .btn:hover:not(:disabled) {
            border: 1px solid var(--focus-color) !important;
        }
        
    }

</style>