<script>

    // Static variable
    let _static = false;
    let _class = "";

    export let active = false;
    export let disabled = false;
    export let size = "default";
    export { _static as static };
    export { _class as class};

</script>

<!-- List item -->
<div class="list-item {_class}" static={_static}>

    <!-- Button -->
    <button {active} disabled={disabled || _static} on:click>

        <!-- Content -->
        <div class="content size-{size}">

            <!-- Check if there is something in the prepend slot -->
            {#if $$slots?.prepend}

                <!-- Content -->
                <div class="prepend">
                    
                    <!-- Action slot -->
                    <slot name="prepend" />

                </div>

            {/if}

            <!-- Info -->
            <div class="info">
                
                <!-- Title -->
                <div class="title">
                    <slot />
                </div>

                <!-- Check if there is a subtitle -->
                {#if $$slots?.subtitle}

                    <!-- Content -->
                    <div class="subtitle">
                        
                        <!-- Action slot -->
                        <slot name="subtitle" />

                    </div>

                {/if}

            </div>

            <!-- Check if there is something in the append slot -->
            {#if $$slots?.append}

                <!-- Content -->
                <div class="append">
                    
                    <!-- Action slot -->
                    <slot name="append" />

                </div>

            {/if}

        </div>

        <!-- Check if item is selected -->
        {#if active}
            
            <!-- Active selector -->
            <div class="active-selector" />

        {/if}

    </button>

</div>

<style>

    /* List item button */
    .list-item > button {
        position: relative;
        overflow: hidden;
        width: 100%;
        transition: .2s ease all;
        border: 1px solid transparent;
        border-radius: 3px;
    }

    /* List item button STATIC */
    .list-item[static = true] > button {
        pointer-events: none;
    }

   /* List item button content STATIC */
    .list-item[static = true] > button > .content {
        pointer-events: auto;
    }

    /* List item button ACTIVE */
    .list-item > button[active = true] {
        color: var(--primary);
    }

    /* Content */
    .content {
        display: flex;
        flex-direction: row;
    }

    /* Info */
    .info {
        flex: 1;
        text-align: left;
        display: flex;
        flex-direction: column;
    }

    /* Info childs */
    .info > * {
        flex: 1;
        display: flex;
        align-items: center;
    }

    /* Info subtitle */
    .info > .subtitle {
        font-size: .8rem;
    }

    /* List item default append, prepend */
    .append, .prepend {
        display: flex;
        align-items: center;
        gap: inherit;
    }

    /* Active selector */
    .active-selector {
        border-radius: 3px;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: var(--primary);
        opacity: .2;
        pointer-events: none;
    }

    /* 
        Sizes 
    */

    /* Large size */
    .size-large {
        padding: 12px;
        gap: 12px;
    }

    /* Default size */
    .size-default {
        padding: 9px;
        gap: 9px;
    }

    /* Small size */
    .size-small {
        padding: 6px;
        gap: 6px;
    }

    /* X Small size */
    .size-small {
        padding: 3px;
        gap: 3px;
    }

    /* 
        Animations
    */

    /* Button animation ACTIVE */
    .list-item > button:active:not(:disabled) {
        transform: scale(.96);
    }

    /* Verify if user input can hover */
    @media (hover: hover) {

        /* Button animation HOVER */
        .list-item > button:hover:not(:disabled) {
            color: var(--primary);
            border: 1px solid var(--primary);
            opacity: .6;
        }
        
    }

</style>