<script>
    import { onDestroy } from "svelte";
    import { getBackground, getColor, theme } from "../../store/theme";

    // Inside class info
    let klass = '';

    export { klass as class };
    export let rounded = false;
    export let block = false;
    export let variant = false;
    export let disabled = false;

    // Theme handler
    let _theme = "light";
    const unsubscribeTheme = theme.subscribe(val => _theme = val);

    // On component destroy
    onDestroy(() => {

        // Unsubscribe to theme update
        unsubscribeTheme();

    });

</script>

<!-- Button container -->
<main class="{variant ? getBackground(_theme) : getColor(_theme)} {klass}" {rounded} {block}>

    <!-- Content -->
    <button {block} {disabled} on:focus on:blur on:click>

        <!-- Content -->
        <div class="content">

            <!-- Default slot -->
            <slot />

        </div>

    </button>

</main>

<style>

    /* Main container */
    main {
        height: fit-content;
        width: fit-content;
        border: 1px solid var(--theme-dividers) !important;
        border-radius: 6px;
        transition: .3s ease all;
        cursor: pointer;
    }

    /* Button, block */
    main[block = true], main > button[block = true] {
        width: 100%;
    }

    /* Button, rounded */
    main[rounded = true] {
        border-radius: 64px;
    }

    /* Content */
    main > button {
        padding: 3px 16px !important;
        user-select: none;
        font-family: 'Poppins';
        font-size: .9rem;
    }

    /* Chip animation ACTIVE */
    main:active {
        transform: scale(.97);
    }

    /* Verify if user input can hover */
    @media (hover: hover) {

        /* Chip animation HOVER */
        main:hover {
            border: 1px solid var(--primary) !important;
        }
        
    }

</style>