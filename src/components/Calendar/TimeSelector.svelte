<script>
    import moment from "moment";
    import { onMount } from "svelte";

    export let value = null;

    // TODO: Bisogna implementare
    let twelveHours = false;

    // On time selector mount
    onMount(() => {

        // Scroll to selected values
        scrollToValue();

    })

    // Get hour list
    function getHoursList(twelveHours) {

        // Generate array
        return [...Array( twelveHours ? 12: 24 ).keys()].reverse().map(h => {

            return {
                name: h,
                value: moment(value).hour(h).toDate()
            }

        });

    }

    // Get minutes list
    function getMinutesList() {

        // Generate array
        return [...Array(60).keys()].reverse().map(m => {

            return {
                name: m,
                value: moment(value).minute(m).toDate()
            }

        });

    }

    // Scroll to selected value
    function scrollToValue() {

        // Iterate over items
        document.querySelectorAll(".selected").forEach(item => {

            // Scroll into view
            item.scrollIntoView({
                block: "start"
            });

        });

    }

    // Set new value
    function setValue(newValue, e) {

        // Update new value
        value = newValue;
        
        // Scroll into view
        e.target.scrollIntoView({
            block: "start",
            behavior: "smooth"
        });

    }

</script>

<!-- Main time selector -->
<main>

    <!-- Selectors -->
    <div class="selectors">

        <!-- Selector -->
        <div class="selector">

            <!-- Iterate over hours -->
            {#each getHoursList(twelveHours, value) as h}
                
                <!-- Check if selected -->
                {@const selected = moment(value).isSame(h.value, "hour")}

                <!-- List item -->
                <div class="item rounded {selected ? "selected" : ""}" {selected} on:keyup on:click={e => setValue(h.value, e)}>

                    <!-- Hour value -->
                    <div class="text">
                        {h.name}
                    </div>

                </div>

            {/each}

        </div>

        <!-- Selector -->
        <div class="selector">

            <!-- Iterate over hours -->
            {#each getMinutesList(value) as m}

                <!-- Check if selected -->
                {@const selected = moment(value).isSame(m.value, "minute")}

                <!-- List item -->
                <div class="item rounded {selected ? "selected" : ""}" {selected} on:keyup on:click={e => setValue(m.value, e)}>

                    <!-- Minute value -->
                    <div class="text">
                        {m.name}
                    </div>

                </div>

            {/each}

        </div>

    </div>

</main>

<style lang="css">

    /* Main calendar container */
    main {
        max-width: 100%;
        height: 368px;
        display: flex;
        flex-direction: column;
        width: 100%;
    }

    /* Selectors */
    main > .selectors {
        height: 100%;
    }

    /* Controller */
    .selectors > .selector {
        display: inline-block;
        width: auto;
        height: 100%;
        overflow-y: auto;
        scroll-snap-type: y mandatory;
        scrollbar-width: none;
    }

    /* Controller item */
    .selectors > .selector > .item {
        display: block;
        user-select: none;
        transition: .3s ease all;
        overflow: hidden;
        text-align: center;
        margin: 3px;
        scroll-snap-align: center;
        scroll-margin-top: 60px;
    }

    /* Text value */
    .selectors > .selector > .item > .text {
        padding: 16px 24px;
    }

    /* Controller item clickable */
    .selectors > .selector > .item[selected = false] {
        cursor: pointer;
    }

    /* Controller item selected */
    .selectors > .selector > .item[selected = true] {
        color: #ffffff;
        background-color: var(--primary);
    }

    /* Controller item clickable hover */
    .selectors > .selector > .item:hover[selected = false] {
        background: rgba(0,0,0,.1);
    }

    /* Controller item clickable hover */
    .selectors > .selector > .item:active[selected = false] {
        background: rgba(0,0,0,.3);
    }

    /* Controller scrollbar */
    .selectors > .selector::-webkit-scrollbar {
        width: 0;
    }

</style>