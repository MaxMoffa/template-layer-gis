<script>

    let klass = '';
    export { klass as class };
    export let size = '24px';
    export let width = size;
    export let height = size;
    export let viewWidth = '24';
    export let viewHeight = '24';
    export let rotate = 0;
    export let spin = false;
    export let path;

</script>

<!-- Icon tag -->
<i class="{klass} " style="--icon-rotate: {rotate}" {spin}>

    <!-- Check path -->
    {#if path}

        <!-- SVG tag -->
        <svg
            xmlns="http://www.w3.org/2000/svg"
            {width}
            {height}
            viewBox="0 0 {viewWidth} {viewHeight}">

            <!-- Path -->
            <path 
                d={path} 
            />

        </svg>

    {/if}

</i>

<style>

    /* Icon */
    i {
        transform: rotate( var(--icon-rotate) );
        line-height: 1;
        letter-spacing: normal;
        text-transform: none;
        display: inline-flex;
        font-feature-settings: 'liga';
        justify-content: center;
        position: relative;
        align-items: center;
        text-indent: 0;
        vertical-align: middle;
        cursor: inherit;
        user-select: none;
        direction: ltr;
        transition: 0.3s cubic-bezier(0.25, 0.8, 0.5, 1), visibility 0s;
    }

    /* Sping animation */
    i[spin = true] {
        animation: infinite icon-spin linear 1s;
    }

    /* Icon spin animation keyframes */
    @keyframes icon-spin {

        /* Starting keyframe */
        from {
            transform: rotate(0deg);
        }

        /* Ending keyframe */
        to {
            transform: rotate(360deg);
        }

    }

</style>
