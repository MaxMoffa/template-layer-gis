<script>
    import { createEventDispatcher, onDestroy } from "svelte";
    import { getBackground, theme } from "../../store/theme";
    import { Button, Chip, Icon } from "svelte-materialify/src";
    import { mdiClose, mdiQualityHigh, mdiQualityLow, mdiQualityMedium, mdiRecord, mdiStop } from "@mdi/js";
    import { fly, slide } from "svelte/transition";
    import { quintOut } from "svelte/easing";
    import MapRecorder from '../../utils/MapRecorder';
    import VideoDialog from '../../components/VideoDialog.svelte';
  import moment from "moment";

    export let map = null;
    export let active = false;
    export let padding = null;
    export let layers = [];

    // Handle update
    $: active, handleUpdate();
    $: layers, handleUpdate();

    // Dispatcher
    const dispatch = createEventDispatcher();

    // Constants
    const HIGH_QUALITY_BITRATE = 30000000;
    const MEDIUMN_QUALITY_BITRATE = 10000000;
    const LOW_QUALITY_BITRATE = 3000000;
    const POPUP_PADDING = 12;
    const POPUP_ELEMENTS_MARGIN = 8;
    const POPUP_WIDTH = 200;
	const PADDING = 9;
    const ROW_HEIGHT = 50;
    const ROUND_CORNERS_DIMENSION = 3;
    const LEGEND_MARGIN = 20;

    // Animations
    const MAPRECORDER_TRANSITION = {delay: 0, duration: 300, x: 0, y: 100, opacity: 0.5, easing: quintOut};
    const TIMEBLOCK_TRANSITION = {delay: 0, duration: 300, easing: quintOut, axis: 'x'};
    
    // Theme color
    let _theme = "light";
    let unsubscribeTheme = theme.subscribe(val => _theme = val);

    // Map recorder instance
    let mapRecorderInstance = null;

    // Time seconds
    let isRecording = false;

    // Video bitrate
    let videoBitRate = MEDIUMN_QUALITY_BITRATE;

    // Seconds
    let seconds = 0;

    // Timer
    let _timerSeconds = null;

    // Video blob url
    let videoBlobUrl = null;

    // Width and height
    let width, height;

    // Video file name
    let videoFileName = "video.mp4";

    // On map recorder destroy
    onDestroy(() => {
    
        // Destroy map recorder instance
        mapRecorderInstance?.destroy?.();

        // Stop timer
        stopTimer();

        // Unsubscribe to theme update
        unsubscribeTheme();

    });

    // Handle updates
    function handleUpdate() {

        // Check if active
        if(!active)
            return;

        // Check if istance is loaded
        if(mapRecorderInstance === null) {

            // Init recorder library
            mapRecorderInstance = new MapRecorder(map, (videoUrl, fileType) => {

                // Update filename
                videoFileName = "square_" + moment().format("DD_MM_YYYY_HH_mm") + "." + fileType;

                // Update video url blob
                videoBlobUrl = videoUrl;

            }, {
                videoBitsPerSecond: videoBitRate,
                padding: padding,
                drawOverlay: drawInfo
            });

        } 

    }

    // Start / Stop video recording
    async function toogleRecording() {

        // Toogle recording
        isRecording = !isRecording;

        // Dispatch recording event
        dispatch(isRecording ? "startRecording" : "endRecording");

        // Check recording status
        if(isRecording) {

            // Update canvas list
            mapRecorderInstance.updateCanvasList();

            // Start recorder
            mapRecorderInstance.startRecording();

            // Start timer
            startTimer();

        } else {

            // Stop recorder
            mapRecorderInstance.stopRecording();

            // Stop timer
            stopTimer();

        }

    }

    // Close map recorder
    function closeMapRecorder() {

        // Hide popup
        active = false;

    }

    // Start timer
    function startTimer() {

        // Start timer
        _timerSeconds = setInterval(() => seconds = seconds + 1, 1000);

    }

    // Stop timer
    function stopTimer() {

        // Stop timer
        clearInterval(_timerSeconds);

        // Reset seconds
        seconds = 0;

    }

    // Get time string
    function getTimeString(s) {

        // Check if s is less then a minute
        if(s < 60)
            return `${s} s`;

        // Return with minute
        return `${(s/60).toFixed()}:${s%60}`
            
    }

    // Draw info on the video
    function drawInfo(canvas) {

        // Get canvas context
		let ctx = canvas.getContext("2d");

        // Get canvas dimensions
        let { height } = canvas;

        // Legend to show
        let legends = [];
        layers.forEach(l => {

            // Get layer legend
            let legend = l.getLegend();

            // Check legend
            if(legend)
                legends.push({
                    ...legend,
                    name: l.getName()
                });

        });

        // Dimensions
        const popupHeight = ROW_HEIGHT * legends.length;
        let left = POPUP_PADDING + PADDING;
        let top = height - POPUP_PADDING - popupHeight + PADDING;

        // Draw rectangle
		ctx.fillStyle = 'white';
		ctx.roundRect(POPUP_PADDING, height - popupHeight - POPUP_PADDING, POPUP_WIDTH, popupHeight, [ROUND_CORNERS_DIMENSION]);
		ctx.fill();

        // Iterate over legends
        legends.forEach((l, i) => {
            
            // Draw legend and update top
            top = drawLegend(l, ctx, top, left);

            // Check if line separator is required
            if(i < legends.length - 1) {

                // Draw line separator
                ctx.beginPath();
                ctx.moveTo(left - PADDING, top - 10);
                ctx.lineTo(left + POPUP_WIDTH - PADDING, top-10);
                ctx.strokeStyle = "#e0e0e0";
                ctx.stroke();

            }
            
        });

    }

    // Draw a legend
    function drawLegend(legend, ctx, top, left) {

        // Draw text
		ctx.font = '12px Arial';
		ctx.fillStyle = '#000';
		ctx.fillText(legend.name, left, top + 8);
        ctx.fillText(legend.measureUnit, left + POPUP_WIDTH - PADDING * 2 - 4 - ctx.measureText(legend.measureUnit).width, top + 8);

        // Add top space
        top += 8 + POPUP_ELEMENTS_MARGIN;

        // Prepare gradient
		const gradient = ctx.createLinearGradient(left, 0, POPUP_WIDTH - PADDING * 2, 0);

        // Add color steps
        legend.colors.forEach((c,i) => {

            // Gradient position
            let p = (1 / legend.colors.length) * i;

            // Add color
            gradient.addColorStop(p, c);

        });

        // Set the fill style and draw a rectangle
        ctx.fillStyle = gradient;
        ctx.fillRect(left, top, POPUP_WIDTH - PADDING * 2, 15);

        // Check scale
        if(legend?.scale && Array.isArray(legend.scale) && legend.scale.length > 0) {

            // Draw scale over legend
            ctx.font = '10px Arial';
            ctx.fillStyle = 'white';
            ctx.strokeStyle = 'black';
            ctx.strokeText(legend.scale[0], left + 4, top + 11);
            ctx.fillText(legend.scale[0], left + 4, top + 11);
            ctx.strokeText(legend.scale[ legend.scale.length - 1 ], left + POPUP_WIDTH - PADDING * 2 - 4 - ctx.measureText(legend.scale[ legend.scale.length - 1 ]).width, top + 11);
            ctx.fillText(legend.scale[ legend.scale.length - 1 ], left + POPUP_WIDTH - PADDING * 2 - 4 - ctx.measureText(legend.scale[ legend.scale.length - 1 ]).width, top + 11);

        }

        return top + 15 + LEGEND_MARGIN;

    }

</script>

<!-- Check if should be active or not -->
{#if active}

    <!-- Main container -->
    <main class="{!width || width > 400 ? "pa-3" : "pb-3"}" bind:clientHeight={height} bind:clientWidth={width}>

        <!-- Recorder popup -->
        <div class="recorder-popup pa-1 {getBackground(_theme)} rounded-xl elevation-1" transition:fly|local={MAPRECORDER_TRANSITION}>

            <!-- Close button -->
            <div class="action">

                <!-- Button -->
                <Button rounded={!isRecording} text={!isRecording} icon={isRecording} class="{isRecording ? "" : "primary-text"}" on:click={closeMapRecorder}>
                    <Icon path={mdiClose} />

                    <!-- Check if is recording -->
                    {#if !isRecording && width > 400}
                        
                        <span class="pl-2">
                            Chiudi
                        </span>

                    {/if}

                </Button>

            </div>

            <!-- Divider -->
            <div class="action pl-1">
                <div class="divider" />
            </div>                            

            <!-- Check if time is higher then zero -->
            {#if isRecording}
            
                <!-- Time block -->
                <div class="time-block pl-1" in:slide|local={TIMEBLOCK_TRANSITION}>

                    <!-- Content -->
                    <Chip label class="primary-color white-text">
                        {getTimeString(seconds)}
                    </Chip>
        
                </div>

            {:else if width > 275}

                <!-- Action -->
                <div class="action pl-1">

                    <!-- Low quality -->
                    <Button icon active={videoBitRate === LOW_QUALITY_BITRATE} activeClass="primary-text" on:click={() => videoBitRate = LOW_QUALITY_BITRATE}>
                        <Icon path={mdiQualityLow} />
                    </Button>

                </div>

                <!-- Action -->
                <div class="action">

                    <!-- Medium quality -->
                    <Button icon active={videoBitRate === MEDIUMN_QUALITY_BITRATE} activeClass="primary-text" on:click={() => videoBitRate = MEDIUMN_QUALITY_BITRATE}>
                        <Icon path={mdiQualityMedium} />
                    </Button>

                </div>

                <!-- Action -->
                <div class="action">

                    <!-- High quality -->
                    <Button icon active={videoBitRate === HIGH_QUALITY_BITRATE} activeClass="primary-text" on:click={() => videoBitRate = HIGH_QUALITY_BITRATE}>
                        <Icon path={mdiQualityHigh} />
                    </Button>

                </div>

                <!-- Divider -->
                <div class="action pl-1">
                    <div class="divider" />
                </div>      

            {/if}

            <!-- Record button -->
            <div class="action pl-1">

                <!-- Button -->
                <Button rounded depressed text class="red-text" on:click={toogleRecording}>
                    <Icon path={isRecording ? mdiStop : mdiRecord} />
                    
                    <!-- Check screen width -->
                    {#if width > 400}
                        <span class="pl-2">
                            {isRecording ? "Ferma" : "Avvia"}
                        </span>
                    {/if}

                </Button>

            </div>

        </div>

    </main>

{/if}

<!-- Video preview -->
<VideoDialog 
    bind:video={videoBlobUrl}
    name={videoFileName}
    controls={true}
/>

<style>

    /* Main container */
    main {
        flex: 1;
        display: flex;
        align-items: end;
        justify-content: center;
    }

    /* Recorder popup */
    main > .recorder-popup {
        max-width: 90vw;
        width: auto;
        height: auto;
        pointer-events: all;
        overflow: hidden;
        display: table;
    }

    /* Recorder popup items */
    main > .recorder-popup > * {
        vertical-align: top;
        display: table-cell;
    }

    /* Divider */
    .divider {
        width: 1px;
        height: 36px;
        position: relative;
        background: var(--theme-dividers);
    }

    /* Time block */
    .time-block {
        height: 36px;
        display: flex !important;
        align-items: center;
        justify-content: center;
    }

</style>