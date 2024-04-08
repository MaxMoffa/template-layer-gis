<script>

    import moment from "moment";
    import { Button, Divider, Icon } from "svelte-materialify/src";
    import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
    import { mdiArrowLeft, mdiArrowRight } from "@mdi/js";
    
    export let value = null;
    export let startsWithSunday = false;
    export let min = null;
    export let max = null;
    export let now = false;

    // Constants
    const ANIMATION_TIME = 100;
    const CALENDAR_ANIMATION = { x: -200, y: 0, duration: ANIMATION_TIME, delay: 0, easing: quintOut };
    const LIST_ANIMATION = { x: 200, y: 0, duration: ANIMATION_TIME, delay: 0, easing: quintOut };
    const SWIPE_OFFSET = 35;

    // Show select list
    let showSelectList = false;

    // Viewed value
    let yearMonthReference = moment(value).toDate();

    // Swipe position
    let touchstartX = null;

    // Get year string
    function getYearString(date) {
        
        return moment(date).format("YYYY");

    }

    // Get year string
    function getMonthString(date) {
        
        return moment(date).format("MMMM");

    }

    // Get week day letters
    function getDayLetters(startsWithSunday) {

        // Check if start with sunday
        if(startsWithSunday){

            // Return the library list
            return moment.weekdaysMin();

        } else {

            // Load list
            let l = moment.weekdaysMin();

            // Take first element
            let fl = l.splice(0, 1);

            // Return elaborated list
            return [...l, fl];

        }
    }

    // Get day of the week
    function getDayOfTheWeek(date) {
        
        // Check if starts with sunday
        if(startsWithSunday) {

            // Return the day out of the library
            return moment(date).day();

        } else {

            // Day of the week starting from sunday
            let ds = moment(date).day();

            // Return with correction
            return ds - 1 < 0 ? 6 : ds - 1; 

        }

    }

    // Generate weeks
    function generateWeeks(date, min, max) {
        
        // Date selector and set first day of the month
        let dateSelector = moment(date).set("date", 1);

        // Days
        let days = [];
        let week = [];

        // Set initial padding
        for(let i=0; i < getDayOfTheWeek(dateSelector); i++)
            week.push(null);

        // Iterate over days of the month
        while(dateSelector.isSame(date, "month")) {
        
            // Push date into array
            week.push({
                name: dateSelector.format("D"),
                value: dateSelector.toDate(),
                disabled: (min && moment(dateSelector).isBefore(min, "day")) || (max && moment(dateSelector).isAfter(max, "day"))
            });

            // Check if week is full
            if(week.length === 7) {

                // Add week to days
                days = [ ...days, week ];

                // Reset week
                week = [];

            }

            // Add a day
            dateSelector = dateSelector.add(1, "days");
        
        }

        // Remove one day
        dateSelector = dateSelector.subtract(1, "days");

        // Set final padding
        for(let i=getDayOfTheWeek(dateSelector)+1; i < 7; i++)
            week.push(null);

        // Add last week to days if not empty
        if(week.length !== 0)
            days = [ ...days, week ];

        return days;
    }

    // Generate year and month lsit
    function generateList(granularity) {

        // Check if months
        if(granularity === "months") {

            return moment.months().map((v, i) => {

                return {
                    name: v,
                    value: moment(value).month(i)
                }

            });

        } else {

            // Result array
            let result = [];

            // Iterate over years
            for (let i=moment().year() + 3; i >= 1971; i--) {
                
                // Add year to list
                result.push({
                    name: i,
                    value: moment(value).year(i)
                })
                            
            }

            // Return result
            return result;

        }

    }

    // Detect wheel scroll on calendar
    function wheelScrollCalendar({ deltaX, deltaY }) {
        
        // Check if scroll is positive or negative
        if(deltaX > 0 || deltaY > 0) {

            // Previous month date
            yearMonthReference = moment(yearMonthReference).subtract(1, "month").toDate()

        } else if(deltaX < 0 || deltaY < 0) {

            // Next month date
            yearMonthReference = moment(yearMonthReference).add(1, "month").toDate()

        }
        
    }

    // Start swipe detection
    function swipeStart(e) {
        
        // Save start
        touchstartX = e.changedTouches[0].screenX;

    }

    // End swipe detection
    function swipeEnd(e) {

        // Check if touch position start is a number
        if(typeof(touchstartX) !== "number")
            return;

        // Touch end
        let touchendX = e.changedTouches[0].screenX;

        console.log(Math.abs(touchendX - touchstartX), "OFFSET");

        // Check offset
        if(Math.abs(touchendX - touchstartX) < SWIPE_OFFSET)
            return;

        // Check if swipe left or right
        if (touchendX < touchstartX) {

            // Next month date
            yearMonthReference = moment(yearMonthReference).add(1, "month").toDate();
            
        } else if (touchendX > touchstartX) {

            // Previous month date
            yearMonthReference = moment(yearMonthReference).subtract(1, "month").toDate();

        }
        
    }

</script>

<!-- Main calendar container -->
<main>
    
    <!-- Controller -->
    <div class="controller">

        <!-- Check if calendar view or list -->
        {#if showSelectList === "months"}

            <!-- List -->
            <div class="controller-list pa-1" in:fly={{ ...LIST_ANIMATION, delay: ANIMATION_TIME }} out:fly={LIST_ANIMATION}>

                <!-- Iterate over list -->
                {#each generateList(showSelectList) as item, i}

                    <!-- Item button -->
                    <Button rounded depressed class="ma-2" active={moment(yearMonthReference).isSame(item.value, "month")} activeClass="primary-color white-text" on:click={() => {

                        // Set month
                        yearMonthReference = moment(yearMonthReference).month(item.value.month()).toDate();

                        // Back to calendar
                        showSelectList = false;

                    }}>
                        {item.name}
                    </Button>

                {/each}

            </div>

        {:else if showSelectList === "years"}

            <!-- List container -->
            <div class="year-list controller-list pa-1" in:fly={{ ...LIST_ANIMATION, delay: ANIMATION_TIME }} out:fly={LIST_ANIMATION}>

                <!-- List -->
                <div>

                    <!-- Iterate over list -->
                    {#each generateList(showSelectList) as item, i}

                        <!-- Item button -->
                        <Button rounded depressed class="ma-2" active={moment(yearMonthReference).isSame(item.value, "year")} activeClass="primary-color white-text" on:click={() => {
                            
                            // Set month
                            yearMonthReference = moment(yearMonthReference).year(item.value.year()).toDate();
    
                            // Back to calendar
                            showSelectList = false;
    
                        }}>
                            {item.name}
                        </Button>
    
                    {/each}

                </div>

            </div>

        {:else}
        
            <!-- Calendar view -->
            <div class="calendar-view pa-1" in:fly|local={{ ...CALENDAR_ANIMATION, delay: ANIMATION_TIME }} out:fly|local={CALENDAR_ANIMATION} on:wheel={wheelScrollCalendar} on:touchstart={swipeStart} on:touchend={swipeEnd}>

                <!-- Year and month button container -->
                <div class="d-flex">

                    <!-- Month -->
                    <Button text size="large" class="primary-text" on:click={() => showSelectList = "months"}>
                        {getMonthString(yearMonthReference)}
                    </Button>
    
                    <!-- Spacer -->
                    <span style="flex-grow: 1;"></span>
    
                    <!-- Year -->
                    <Button text size="large" class="primary-text" on:click={() => showSelectList = "years"}>
                        {getYearString(yearMonthReference)}
                    </Button>
    
                </div>
    
                <!-- Week table letters -->
                <div class="week-table pt-3">
    
                    <!-- Iterate over week day letters -->
                    {#each getDayLetters(startsWithSunday) as l}
    
                        <!-- Letter -->
                        <div class="day">
                            <div class="text">
                                {l}
                            </div>
                        </div>
                        
                    {/each}
    
                </div>

                <!-- Divider -->
                <Divider class="ma-2" />

                <!-- Calendar -->
                <div class="pb-3">
    
                    <!-- Iterate over month week -->
                    {#each generateWeeks(yearMonthReference, min, max) as week}
    
                        <!-- Week -->
                        <div class="week-table">
    
                            <!-- Iterate over week days -->
                            {#each week as day, i}
    
                                <!-- Check if is real day -->
                                {#if day}

                                    <!-- Day of the week -->
                                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                                    <div class="day rounded" today={moment().isSame(day.value, "days")} disabled={day.disabled} selected={moment(value).isSame(day.value, "days")} on:click={() => {
                                        
                                        // Check if disabled
                                        if(!day.disabled)
                                            value = day.value;
                                        
                                    }}>

                                        <!-- Value -->
                                        <div class="text">
                                            {day?.name || ""}
                                        </div>

                                        <!-- Backdrop -->
                                        <div class="backdrop rounded" />

                                    </div>
                                
                                {:else}

                                    <!-- Empty day -->
                                    <div class="day" />

                                {/if}

                            {/each}
    
                        </div>
                        
                    {/each}
    
                </div>

            </div>

        {/if}

    </div>

    <!-- Month switch -->
    <div class="month-switch pl-1 pr-1">

        <!-- Previous month container -->
        <div class="action">
            
            <!-- Previous month -->
            <Button icon size="x-small" on:click={() => {

                // Previous month date
                yearMonthReference = moment(yearMonthReference).subtract(1, "month").toDate()

            }}>
                <Icon size={16} path={mdiArrowLeft} />
            </Button>

        </div>

        <!-- Spacer -->
        <span style="flex-grow: 1;"></span>

        <!-- Now button container -->
        <div class="action">

            <!-- Check if should be visible -->
            {#if now}

                <!-- Now button -->
                <Button size="x-small" text rounded class="primary-text" on:click={() => value = yearMonthReference = moment().toDate()}>
                    Oggi
                </Button>

            {/if}

        </div>

        <!-- Spacer -->
        <span style="flex-grow: 1;"></span>

        <!-- Next month container -->
        <div class="action">
    
            <!-- Next month -->
            <Button icon size="x-small" on:click={() => {

                // Previous month date
                yearMonthReference = moment(yearMonthReference).add(1, "month").toDate()

            }}>
                <Icon size={16} path={mdiArrowRight} />
            </Button>

        </div>

    </div>
    
</main>

<style lang="css">

    /* Main calendar container */
    main {
        width: 90vw;
        max-width: 300px;
        height: auto;
    }

    /* Month switch */
    .month-switch {
        height: 24px;
        display: flex;
    }

    /* Month switch action */
    .month-switch > .action {
        height: 100%;
        display: grid;
        place-items: center;
    }

    /* Date popup controller */
    main > .controller {
        height: 345px;
        overflow: hidden;
    }

    /* Date popup controller list */
    main .controller-list {
        height: 100%;
        overflow-x: hidden;
        overflow-y: auto;
    }

    /* Days table */
    .week-table {
        display: flex;
        flex-direction: row;
    }

    /* Days table day */
    .week-table > .day {
        flex: 1;
        display: block;
        user-select: none;
        transition: .3s ease all;
        overflow: hidden;
        text-align: center;
        padding: 1px;
    }

    /* Days table day disabled */
    .week-table > .day[disabled = true] {
        opacity: .3;
    }

    /* Days table day */
    .week-table > .day > .text {
        padding: 5px;
    }

    /* Days table day clickable */
    .week-table > .day[selected = false] {
        cursor: pointer;
    }

    /* Days table day selected */
    .week-table > .day[selected = true] {
        color: var(--primary);
    }

    /* Days table day selected */
    .week-table > .day[today = true] {
        color: var(--primary);
    }

    /* Days table day backdrop selected */
    .week-table > .day[selected = true] > .backdrop {
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        transform: translate(0, -100%);
        background-color: var(--primary);
        opacity: .2;
    }

    /* Days table day clickable hover */
    .week-table > .day:hover[selected = false] {
        background: rgba(0,0,0,.1);
    }

    /* Days table day clickable hover */
    .week-table > .day:active[selected = false] {
        background: rgba(0,0,0,.3);
    }

    /* Month list */
    .year-list {
        display: flex;
        justify-content: center;
    }

    /* Month list child */
    .year-list > div {
        width: 256px;
    }

</style>