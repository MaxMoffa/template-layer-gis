<script>

    import { Icon, Ripple } from "svelte-materialify/src";
    import { theme, getBackground, getColor } from "../../store/theme";
    import { onDestroy } from "svelte";

    // Theme handler
    let _theme = "light";
    const unsubscribeTheme = theme.subscribe(val => _theme = val);

    export let icon;
    export let name = "Widget";
    export let description;
    export let id;
    export let disabled = false;

    // On component destroy
    onDestroy(() => {

        // Unsubscribe to theme update
        unsubscribeTheme();

    });

</script>

<!-- Main container -->
<main>

    <!-- Card -->
    <button class="card {getBackground(_theme)}" {disabled} use:Ripple on:click>

        <!-- Icon container -->
        <div class="icon-container {getColor(_theme)}">

            <!-- Check if ID is provided -->
            {#if id}

                <!-- Image preview -->
                <div class="image-preview">

                    <!-- Picture tag -->
                    <picture draggable="false">
    
                        <!-- Sources -->
                        <source draggable="false" srcset="/media/widget_cover/{id}.webp" type="image/webp">
                        <source draggable="false"srcset="/media/widget_cover/{id}.jpg" type="image/jpeg">
                        <img draggable="false" alt="{name} preview" src="/media/widget_cover/{id}.jpg">
    
                    </picture>
    
                </div>
                
            {/if}

            <!-- Icon -->
            <Icon path={ icon } size={48} />

        </div>

        <!-- Name container -->
        <div class="name-container">

            <!-- Name -->
            <span>
                {name}
            </span>

        </div>

        <!-- Check if description is available -->
        {#if description}
        
            <!-- Description container -->
            <div class="description-container">

                <!-- Description -->
                <span>
                    {description}
                </span>
    
            </div>

        {/if}

    </button>

</main>

<style>

    /* Widget card */
    main > .card {
        width: 100%;
        border: 1px solid var(--theme-dividers) !important;
        border-radius: 6px;
        overflow: hidden;
        transition: .2s ease all;
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -o-user-select: none;
        user-select: none;
    }

    /* Widget card */
    main > .card:hover {
        transform: scale(1.02);
    }

    /* Widget card, icon container */
    main > .card > .icon-container {
        position: relative;
        padding: 48px 3px;
        border-bottom: 1px solid var(--theme-dividers) !important;
        border-radius: 6px 6px 0 0;
        overflow: hidden;
    }

    /* Widget card, icon container, image preview */
    main > .card > .icon-container .image-preview {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        opacity: .4;
        filter: blur(3px);
    }

    /* Widget card, name container */
    main > .card > .name-container {
        padding: 9px;
        font-family: 'Poppins';
        text-align: left;
        font-weight: bold;
    }

    /* Widget card, description container */
    main > .card > .description-container {
        padding: 0 9px 9px 9px;
        font-size: .8rem;
        text-align: left;
        font-weight: thin;
    }

</style>