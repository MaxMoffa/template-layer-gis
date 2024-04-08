<svelte:window on:resize={updateViewedSelectors} />

<script>
    import { Button, Divider, Icon } from "svelte-materialify/src";
    import Overlay from "../../components/Overlay.svelte";
    import { theme, getBackground } from "../../store/theme";
    import { createEventDispatcher, onDestroy, onMount } from "svelte";
    import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
    import { mdiArrowRight, mdiCheck, mdiClose } from "@mdi/js";
    import CalendarSelector from "./CalendarSelector.svelte";
    import TimeSelector from "./TimeSelector.svelte";
    import moment from "moment";

    // Dispatcher
    const dispatch = createEventDispatcher();

    // Theme color
    let _theme = "light";
    let unsubscribeTheme = theme.subscribe(val => _theme = val);

    export let active = false;
    export let value = new Date();
    export let startsWithSunday = false;
    export let twelveHours = false;
    export let date = false;
    export let time = false;
    export let datetime = false;
    export let now = true;
    export let min = null;
    export let max = null;

    // Update selectorValue
    $: active, updateSelectorValue();

    // Animations
    const POPUP_ANIMATION = { x: 0, y: 300, duration: 300, delay: 0, opacity: 0, easing: quintOut };

    // Max dimension
    const MAX_DIMENSION = 550;

    // Viewed selectors
    let viewedSelectors = 2;

    // Selector selectorValue
    let selectorValue = moment(value).toDate();

    // Popup width
    let width;

    // On mount
    onMount(() => {

        // Update viewed selectors
        updateViewedSelectors();

    });

    // On dialog destroy
    onDestroy(() => {

        // Unsubscribe to theme update
        unsubscribeTheme();

    });

    // Update viewed selector
    function updateViewedSelectors() {

        // Set new value
        viewedSelectors = ((date && time) || datetime) && document.body.clientWidth < MAX_DIMENSION ? 1 : 3;

    }

    // Update selector value
    function updateSelectorValue() {
        
        // Check if active
        selectorValue = moment(value).toDate();

        // Update viewed selectors
        updateViewedSelectors();

    }

    // Close dialog
    function close() {
        
        // Hide popup
        active = false;

    }

    // Set date
    function setDate() {

        // Check viewed selector
        if(viewedSelectors < 2) {

            // Next selector
            viewedSelectors += 1;
        
            return;

        }
        
        // Assign new value
        value = moment(selectorValue).toDate();

        // Dispatch change
        dispatch("change", moment(selectorValue).toDate());

        // Close dialog
        close();

    }

</script>

<!-- Overlay -->
<Overlay bind:active={active}>

    <!-- Date popup -->
    <div class="date-popup {getBackground(_theme)} rounded elevation-1" bind:clientWidth={width} transition:fly={POPUP_ANIMATION} minimized={viewedSelectors !== 3 || (!date && !datetime)}>

        <!-- Controllers -->
        <div class="controllers">

            <!-- Show calendar -->
            {#if (date || datetime) && viewedSelectors !== 2}
            
                <!-- Calendar controller -->
                <div class="controller">

                    <!-- Calendar selector -->
                    <CalendarSelector bind:value={selectorValue} {startsWithSunday} {min} {max} {now} />
    
                </div>

            {/if}

            <!-- Show divider -->
            {#if (datetime || (date && time)) && viewedSelectors === 3}

                <!-- Divider -->
                <div class="divider" />
                
            {/if}

            <!-- Show clock -->
            {#if (time || datetime) && viewedSelectors > 1}

                <!-- Calendar controller -->
                <div class="controller">

                    <!-- Calendar selector -->
                    <TimeSelector bind:value={selectorValue} {twelveHours} />
                    
                </div>
                
            {/if}

        </div>

        <!-- Divider -->
        <Divider />

        <!-- Actions -->
        <div class="d-flex">

            <!-- Cancel container -->
            <div class="pa-3" style="flex: 1">
                <Button rounded block outlined depressed class="primary-text" on:click={() => active = false} on:click={close}>
                    
                    <!-- Check dimension -->
                    {#if width < 300}

                        <!-- Icon -->
                        <Icon path={mdiClose} />

                    {:else}

                        <!-- Text -->
                        Annulla

                    {/if}
                    
                </Button>
            </div>

            <!-- Confirm container -->
            <div class="pa-3" style="flex: 1">
                <Button rounded block depressed class={"primary-color white-text"}  on:click={setDate}>
                    
                    <!-- Check dimension -->
                    {#if width < 300}

                        <!-- Icon -->
                        <Icon path={viewedSelectors < 2 ? mdiArrowRight : mdiCheck} />

                    {:else}

                        <!-- Text -->
                        {viewedSelectors < 2 ? "Avanti" : "Imposta"}

                    {/if}

                </Button>
            </div>

        </div>

    </div>

</Overlay>

<style type="css">

    /* Date popup */
    .date-popup {
        width: 90%;
        max-width: 500px;
        width: auto;
        height: auto;
    }

    /* Date popup minimized */
    .date-popup[minimized = true] {
        width: 90%;
    }

    /* Date popup minimized controller */
    .date-popup[minimized = true] > .controllers{
        display: grid;
        place-items: center;
    }

    /* Controllers */
    .date-popup > .controllers {
        width: auto;
        height: 369px;
        padding: 0;
    }

    /* Controllers divider */
    .date-popup > .controllers > .divider {
        width: 1px;
        height: 100%;
        display: block;
        background-color: var(--theme-dividers);
        display: inline-block;
    }

    /* Controllers */
    .date-popup > .controllers > .controller {
        display: inline-block;
        height: 100%;
        vertical-align: top;
    }

</style>