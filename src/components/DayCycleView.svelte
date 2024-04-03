<script>
    import { onDestroy } from "svelte";
    import { getColor, theme } from "../store/theme";
    import moment from "moment";

    export let alba = "Fri, 23 Jun 2023 05:28:00 GMT";
    export let tramonto = "Fri, 23 Jun 2023 20:36:00 GMT";
    export let fullwidth = false;
    export let isToday = false;

    // Seconds in a day
    const secondsInDay = 3600 * 24;

    // Theme handler
    let _theme = "light";
    const unsubscribeTheme = theme.subscribe(val => _theme = val);

    // Container width
    let containerWidth;

    // On component destroy
    onDestroy(() => {

        // Unsubscribe to theme update
        unsubscribeTheme();

    });

    // Get today width
    function getTodayWidth(width) {

        // Init today date
        let date = moment();

        // Get start
        let start = date.clone().startOf("day");

        // Calculate seconds
        let seconds = moment.duration(date.diff(start)).as("seconds");

        // x : width = seconds : seconds in day
        return width * seconds / secondsInDay;
        
    }

    // Get date width
    function getDateWidth(_date) {

        // Init today date
        let date = moment(_date);

        // Get start
        let start = date.clone().startOf("day");

        // Calculate seconds
        let seconds = moment.duration(date.diff(start)).as("seconds");

        // x : 100% = seconds : seconds in day
        return 100 * seconds / secondsInDay;

    }

    // Get linear gradient for day
    function getDayGradient(alba, tramonto) {


        // Return backround style for linear gradient
        return `background: linear-gradient(90deg, #0d47a1 ${getDateWidth(alba) - 5}%, #fbc02d ${getDateWidth(alba)}%, #fbc02d ${getDateWidth(tramonto)}%, #0d47a1 ${getDateWidth(tramonto) + 5}%);`;

    }

</script>

<!-- Day Cycle container -->
<main bind:clientWidth={containerWidth} class="{getColor(_theme)} {fullwidth ? "" : "pa-2"}" {fullwidth}>

    <!-- Day gradient -->
    <div class="day-gradient {fullwidth ? "" : "rounded-lg"}" style="{getDayGradient(alba, tramonto)}" />

    <!-- Check if is today -->
    {#if isToday}

        <!-- Center line -->
        <div class="center-line {getColor(_theme)}"></div>
        
        <!-- Hour dot -->
        <div class="hour-dot {getColor(_theme)}" style="left: calc({getTodayWidth(containerWidth)}px - 14px); border: 3px solid {getColor(_theme)} !important"></div>

    {/if}

</main>

<style>

    /* Day Cycle container */
    main {
        position: relative;
        flex: 1;
        width: 100%;
        height: 170px;
        overflow: hidden;
    }

    /* Day Cycle container, fullwidth */
    main[fullwidth = true] {
        height: 50px;
    }

    /* Day gradient */
    main > .day-gradient {
        width: 100%;
        height: 100%;
    }

    /* Center line */
    main > .center-line {
        position: absolute;
        width: 100%;
        height: 4px;
        top: calc(50% - 2px);
    }

    /* Hour dot */
    main > .hour-dot {
        position: absolute;
        width: 25px;
        height: 25px;
        top: calc(50% - 14px);
        border-radius: 50%;
    }

</style>