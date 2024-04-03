<script>
    import { fade, fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
    import { theme, getBackground, getColor } from '../store/theme';
    import drag from './drag';

    // Theme info
    let _theme = "light";
    theme.subscribe(val => _theme = val);

    export let title = "Seleziona data";
    export let active = true;
    export let classTitle = "";

    const dragOptions = {
        minHeight: 0,
        clickToOpen: false,
    };

    const fromY = document.body.clientHeight + 500;

    function drawerChange(e) {
        active = e.detail.isOpen;
    }

</script>

{#if active}

    <main>

        <div transition:fade="{{delay: 100, duration: 500}}" class="background {getBackground(_theme)}" on:click={() => active = false}></div>

        <div class="bottom-container elevation-6 rounded-t {getColor(_theme)}" use:drag={dragOptions} on:change={drawerChange} transition:fly="{{delay: 100, duration: 500, x: 0, y: fromY, opacity: 0.5, easing: quintOut}}">

            <div class="title text-h6 pa-3 {classTitle}">
                {title}
            </div>

            <div class="content pa-3">

                <slot />

            </div>

        </div>

    </main>

{/if}

<style>

    main {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 3000;
    }

    main > .background {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        opacity: 0.5;
    }

    main > .bottom-container {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        max-width: 500px;
    }

    main .title {
        pointer-events: none;
    }

</style>