<script>
    
    import { onDestroy } from "svelte";
    import { StatusBarColor, setStatusBarColor } from "../../store/system";

    export let color = "red";

    // Last color befor component rendering
    const LAST_COLOR = $StatusBarColor;

    // Handle color updates
    $: color, setStatusBarColor( color );

    // On component destroy
    onDestroy(() => {

        // Set last status bar color
        setStatusBarColor( LAST_COLOR );

    });

</script>