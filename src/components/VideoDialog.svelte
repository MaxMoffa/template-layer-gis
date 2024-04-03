<script>
    import { Icon, Button, TextField } from 'svelte-materialify/src';
    import { mdiDownload, mdiClose, mdiShare } from '@mdi/js';
    import Overlay from './Overlay.svelte';
    import { getBackgroundInverted, getColor, theme } from '../store/theme';
    import { onDestroy } from 'svelte';
    import { sendNotification } from '../store/notification';

    export let video = null;
    export let controls = true;
    export let name = "video.mp4";

    // Theme color
    let _theme = "light";
    let unsubscribeTheme = theme.subscribe(val => _theme = val);

    // On dialog destroy
    onDestroy(() => {

        // Unsubscribe to theme update
        unsubscribeTheme();

    });

    // Download image
    async function downloadVideo() {

        // Download video
        let a = document.createElement("a");
        a.href = video;
        a.setAttribute("download", name);
        a.click();

        // Send notification
        sendNotification("Download del video iniziato");

    }

    // Close popup
    function close() {
        video = null;
    }

    // Check if browser can share
    function canShare() {

        return "share" in navigator && navigator.canShare({
            files: [
                new File([], name)
            ]
        });

    }

    // Share video
    async function shareVideo() {

        // Load video blob
        let blob = await (await fetch(video)).blob();

        // Prepare data to share
        const data = {
            files: [
                new File([blob], name, {
                    type: blob.type,
                }),
            ],
            title: 'Guarda questo video'
        };

        // Share video
        await navigator.share(data);

    }

</script>

<!-- Overlay -->
<Overlay active={video} disableClose>

    <!-- Popup -->
    <div class="popup rounded {getColor(_theme)}">

        <!-- Video preview -->
        <div class="video-preview rounded {getBackgroundInverted(_theme)}">

            <!-- Video -->
            <!-- svelte-ignore a11y-media-has-caption -->
            <video src={video} {controls} playsinline />

            <!-- Close button -->
            <div class="close-button pa-3">

                <!-- Button -->
                <Button depressed fab class="white black-text" size="small" on:click={close}>
                    <Icon path={mdiClose} />
                </Button>

            </div>

        </div>

        <!-- Video name -->
        <div class="pl-3 pr-3 pt-3">

            <!-- Textfield -->
            <TextField filled bind:value={name}>
                Nome video
            </TextField>

        </div>

        <!-- Actions -->
        <div class="d-flex pt-1 pb-1">

            <!-- Action -->
            <div class="flex-1 pl-2 pt-2 pb-2 {canShare() ? "pr-1" : "pr-2"}">

                <!-- Download button -->
                <Button class="primary-color white-text" block depressed on:click={downloadVideo}>
                    Scarica video
                    <Icon class="ml-2" path={mdiDownload} />
                </Button>

            </div>

            <!-- Check if browser can share -->
            {#if canShare()}
            
                <!-- Action -->
                <div class="flex-1 pl-1 pr-2 pt-2 pb-2">

                    <!-- Share button -->
                    <Button class="primary-text" block outlined on:click={shareVideo}>
                        Condividi
                        <Icon class="ml-2" path={mdiShare} />
                    </Button>
                    
                </div>

            {/if}

        </div>

    </div>

</Overlay>

<style>

    /* Popup */
    .popup {
        position: relative;
        width: 95%;
        max-width: 500px;
        height: auto;
    }

    /* Video preview */
    .popup > .video-preview {
        aspect-ratio: 16 / 9;
        overflow: hidden;
    }

    /* Video preview */
    .popup > .video-preview > .close-button {
        position: absolute;
        top: 0;
        left: 0;
    }

    /* Video preview */
    .popup > .video-preview > video {
        width: 100%;
        height: 100%;
    }

</style>