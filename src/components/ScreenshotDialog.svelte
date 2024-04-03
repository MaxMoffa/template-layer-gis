<script>
    import { Icon, Button } from 'svelte-materialify/src';
    import { mdiClose, mdiShare, mdiContentCopy } from '@mdi/js';
    import Overlay from './Overlay.svelte';
    import { getBackground, getBackgroundInverted, theme } from '../store/theme';
    import { onDestroy } from 'svelte';
    import { sendNotification } from '../store/notification';

    export let image = null;
    export let name = "screenshot.jpg";
    export let alt = "Immagine generata automaticamente";

    // Theme color
    let _theme = "light";
    let unsubscribeTheme = theme.subscribe(val => _theme = val);

    // On dialog destroy
    onDestroy(() => {

        // Unsubscribe to theme update
        unsubscribeTheme();

    });

    // Download image
    async function downloadImage() {

        // Image download
        let a = document.createElement("a");
        a.href = image;
        a.setAttribute("download", name);
        a.click();

        // Send notification
        sendNotification("Download dell'immagine iniziato");

    }

    // Close popup
    function close() {
        image = null;
    }

    // Check if browser can share
    function canShare() {
        
        return "share" in navigator && navigator.canShare({
            files: [
                new File([], name)
            ]
        });

    }

    // Copy image to clipoboard
    function copyImage() {
        
        // Write image to clipboard
        navigator.clipboard.write([new ClipboardItem({'image/png' : dataURItoBlob(image)})])
        .then(() => {

            // Send notification
            sendNotification("Immagine copiata nella clipboard");

        });

    }

    // Share video
    async function shareImage() {

        // Load image blob
        let blob = dataURItoBlob(image);

        // Prepare data to share
        const data = {
            files: [
                new File([blob], name, {
                    type: blob.type,
                }),
            ],
            title: 'Guarda questa immagine da Square'
        };

        // Share video
        await navigator.share(data);

    }

    // Convert dataURI to blob
    function dataURItoBlob(dataURI) {
        // convert base64 to raw binary data held in a string
        // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
        var byteString = atob(dataURI.split(',')[1]);

        // separate out the mime component
        var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

        // write the bytes of the string to an ArrayBuffer
        var ab = new ArrayBuffer(byteString.length);

        // create a view into the buffer
        var ia = new Uint8Array(ab);

        // set the bytes of the buffer to the correct values
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }

        // write the ArrayBuffer to a blob, and you're done
        var blob = new Blob([ab], {type: mimeString});
        return blob;

    }

    // Check if copy is supported
    function isCopySupported(name) {

        // Check if browser has a clipboard item
        if(typeof(ClipboardItem) !== "function")
            return false;

        // Check file format
        if(name?.includes("gif"))
            return false;
        
        // Fallback 
        return true;
    }

</script>

<!-- Overlay -->
<Overlay bind:active={image}>

    <!-- Popup -->
    <div class="popup rounded {getBackground(_theme)}">

        <!-- Video preview -->
        <div class="image-preview rounded {getBackgroundInverted(_theme)}">

            <!-- Video -->
            <img src={image} alt={alt} />

            <!-- Close button -->
            <div class="close-button pa-3">

                <!-- Button -->
                <Button depressed fab class="white black-text" size="small" on:click={close}>
                    <Icon path={mdiClose} />
                </Button>

            </div>

        </div>

        <!-- Actions -->
        <div class="d-flex pt-1 pb-1">

            <!-- Action -->
            <div class="flex-1 pl-2 pt-2 pb-2 {canShare() ? "pr-1" : "pr-2"}">

                <!-- Download button -->
                <Button class="primary-color white-text" block depressed on:click={downloadImage}>
                    Scarica
                </Button>

            </div>

            <!-- Check if browser can share -->
            {#if canShare()}
            
                <!-- Action -->
                <div class="pl-1 {isCopySupported() ? "pr-1" : "pr-2"} pt-2 pb-2">

                    <!-- Share button -->
                    <Button class="primary-text" block outlined on:click={shareImage}>
                        <Icon path={mdiShare} />
                    </Button>
                    
                </div>

            {/if}

            <!-- Check if browser can copy -->
            {#if isCopySupported()}
    
                <!-- Action -->
                <div class="pl-1 pr-2 pt-2 pb-2">

                    <!-- Share button -->
                    <Button class="primary-text" block outlined on:click={copyImage}>
                        <Icon path={mdiContentCopy} />
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
        overflow: hidden;
    }

    /* Video preview */
    .popup > .image-preview {
        aspect-ratio: 16 / 9;
        overflow: hidden;
        display: flex;
    }

    /* Video preview */
    .popup > .image-preview > .close-button {
        position: absolute;
        top: 0;
        left: 0;
    }

    /* Video preview */
    .popup > .image-preview > img {
        flex: 1;
        object-fit: contain;
    }

</style>