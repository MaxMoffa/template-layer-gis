<script>
    
    import { mdiAlertCircle } from "@mdi/js";  
    import { Icon } from "svelte-materialify/src";

    export let absolute = false;
    export let flex = false;
    export let text = "";
    
</script>

<!-- Main container -->
<main {absolute} {flex}>

    <!-- Info container -->
    <div class="info-container">

        <!-- Icon container -->
        <div class="icon-container">

            <!-- Slot for icon -->
            <slot name="icon">

                <!-- Icon fallback -->
                <Icon class="red-text" path={mdiAlertCircle} size={48} />

            </slot>

        </div>

        <!-- Text container -->
        <div class="text-container red-text">
        
            <!-- Slot for text -->
            <slot name="text">
                {text}
            </slot>

        </div>

    </div>

</main>

<style>

    /* Main container */
    main {
        display: flex;
        flex-direction: column;
        justify-content: center;
    }

    /* Main container absolute */
    main[absolute = true] {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
    }

    /* Main container flex */
    main[flex = true] {
        flex: 1;
    }

    /* Info container */
    main > .info-container {
        align-items: center;
        justify-content: center;
    }

    /* Icon container */
    main > .info-container > .icon-container {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px 0;
    }

    /* Text container */
    main > .info-container > .text-container {
        text-align: center;
    }

</style>