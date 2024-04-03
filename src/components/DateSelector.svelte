<script>
    import moment from 'moment';
    import { Row, Col, Ripple, Button } from 'svelte-materialify/src';
    import { createEventDispatcher, onDestroy, onMount } from 'svelte';
    import { theme, getBackground } from '../store/theme';
    const dispatch = createEventDispatcher();

    let _theme = "light";
    let unsubscribeTheme = theme.subscribe(val => _theme = val);

    export let value = null;
    export let date = false;
    export let time = false;
    export let datetime = false;
    export let label = null;
    export let disabled = false;
    export let now = true;
    export let acceptString = false;
    export let min = null;
    export let max = null;

    if(date && time){
        datetime = true;
        date = false;
        time = false;
    }

    $: value, valueUpdate();

    let _date = getDate();
    let _time = getTime();
    let _datetime = getDateTime();
    let _autoRefresh = null;

    let hasDateValue = _date !== "";
    let hasTimeValue = _time !== "";
    let hasDatetimeValue = _datetime !== "";

    let nowSelected = false;

    onDestroy(() => {

        // Clear interval refresh
        clearInterval(_autoRefresh);

        // Unsubscribe to theme update
        unsubscribeTheme();

    });

    const update = (e) => {

        // Reset autoRefresh
        clearInterval(_autoRefresh);

        if(value)
            nowSelected = false;
        hasDateValue = Boolean(_date);
        hasTimeValue = Boolean(_time);
        hasDatetimeValue = Boolean(_datetime);

        if(date && time){
            if(hasDateValue && hasTimeValue) {
                let v = new Date(_date);
                let t = _time.split(":");
                v.setHours(t[0], t[1]);
                value = v;
            }else {
                value = null
            }
        }else if(date) {
            if(hasDateValue)
                value = new Date(_date);
            else 
                value = null;
        }else if(time) {
            if(hasTimeValue)
                value = _time;
            else
                value = null;
        }else if(datetime) {
            if(hasDatetimeValue)
                value = _datetime;
            else
                value = null;
        }

        dispatch("change", value);
    } 

    function getDate(v=value) {
        if(!v)
            return "";
        if(v === "today" || v === "now")
            return moment().format("YYYY-MM-DD");
        return moment(v).format("YYYY-MM-DD");
    }

    function getDateTime(v=value) {
        if(!v)
            return "";
        if(v === "today" || v === "now")
            return moment().format("YYYY-MM-DDTHH:mm");
        return moment(v).format("YYYY-MM-DDTHH:mm");
    }

    function getTime(v=value) {
        if(!v)
            return "";
        if(v === "today" || v === "now")
            return moment().format("HH:mm");
        return moment(v).format("HH:mm");
    }

    function setNow() {
        nowSelected = true;
        let d = new Date();
        if(acceptString)
            value = "today";
        else
            value = d;
        _date = getDate(d);
        _time = getTime(d);
        _datetime = getDateTime(d);
        hasDateValue = Boolean(_date);
        hasTimeValue = Boolean(_time);
        hasDatetimeValue = Boolean(_datetime);
        dispatch("change", value);
    }

    function isInsideRange(min, max) {
        let result = true;
        let now = moment();
        if(min)
            result = moment(min).isBefore(now);
        if(max)
            result = moment(max).isAfter(now);
        return result;
    }

    function isNotToday(val) {
        if(!val)
            return true;
        if(val === "today")
            return false;
        return moment(val).isSame(moment());
    }

    function valueUpdate() {
        _date = getDate();
        _time = getTime();
        _datetime = getDateTime();

        hasDateValue = _date !== "";
        hasTimeValue = _time !== "";
        hasDatetimeValue = _datetime !== "";

        // Check if is now
        if(value === "today" || value === "now") {

            // Set auto refresh interval
            _autoRefresh = setInterval(() => {

                // Update all
                _date = getDate();
                _time = getTime();
                _datetime = getDateTime();

            }, 1000);

        } else {

            // Clear interval, no longer required
            clearInterval(_autoRefresh);

        }

    }

</script>

{#if label}
    <div class="text-caption pb-2 pl-1">
        {label}
    </div>
{/if}

<div isDark={_theme === "dark"} class="selectorContent {getBackground(_theme)} grey-text text-lighten-1" use:Ripple>
    <Row style="height: 100%" class="ma-0 pa-0">
        {#if date}
            <Col class="ma-0 pa-0">
                <input isDark={_theme === "dark"} disabled={disabled} {min} {max} type="date" class="pl-2 pt-4 pb-4 pr-2 mb-0 grey-text text-darken-1" bind:value={_date} on:change={update} hasValue={hasDateValue} />
            </Col>
        {/if}
        {#if time}
            <Col class="ma-0 pa-0" cols={date ? 3 : undefined}>
                <input isDark={_theme === "dark"} disabled={disabled} {min} {max} type="time" class="pl-2 pt-4 pb-4 pr-2 mb-0 text-center grey-text text-darken-1" bind:value={_time} on:change={update} hasValue={hasTimeValue} />
            </Col>
        {/if}
        {#if datetime}
            <Col class="ma-0 pa-0">
                <input isDark={_theme === "dark"} disabled={disabled} {min} {max} type="datetime-local" class="pl-2 pt-4 pb-4 pr-2 mb-0 grey-text text-darken-1" bind:value={_datetime} on:change={update} hasValue={hasDatetimeValue} />
            </Col>
        {/if}
        {#if now && !nowSelected && isInsideRange(min, max) && isNotToday(value)}
            <Col cols={"auto"} class="ma-0 pa-0 primary-color-text">
                <div class="selector pa-2" style="width: 100%; height: 100%; display: grid; place-items: center">
                    <Button {disabled} outlined depressed on:click={setNow}>
                        {time || datetime ? "Ora" : "Oggi"}
                    </Button>
                </div>
            </Col>
        {/if}
    </Row>
</div>

<style>

    .selectorContent {
        height: 64px;
        margin-bottom: 8px;
        border-radius: 4px 4px 0 0;
    }

    .selectorContent:hover {
        background-color: rgba(0,0,0,.1) !important;
    }

    .selectorContent:hover[isDark = true] {
        background-color: rgba(255,255,255,.1) !important;
    }

    input, .selector {
        width: 100%;
        height: 100% !important;
        outline: 0;
        border: 0;
        border-color: var(--theme-text-fields-border);
        border-style: solid;
        border-width: 0 0 thin 0;
        transition: 0.3s ease color;
        cursor: pointer;
    }

    input:focus {
        color: #000 !important;
    }

    input[hasValue = true] {
        color: #000 !important;
    }

    input:focus[isDark = true] {
        color: #fff !important;
    }

    input[hasValue = true][isDark = true] {
        color: #fff !important;
    }

</style>