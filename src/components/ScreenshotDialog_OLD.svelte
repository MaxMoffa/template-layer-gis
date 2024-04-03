<script>
    import { Icon, Button, ProgressCircular } from 'svelte-materialify/src';
    import { mdiDownload, mdiContentCopy, mdiClose } from '@mdi/js';
    import Overlay from './Overlay.svelte';
    import { getColor, theme } from '../store/theme';
    import { onDestroy } from 'svelte';
    import { sendNotification } from '../store/notification';

    export let image = null;
    export let active = false;
    export let name = "screenshot.jpg";

    // Theme color
    let _theme = "light";
    let unsubscribeTheme = theme.subscribe(val => _theme = val);

    // On dialog destroy
    onDestroy(() => {

        // Unsubscribe to theme update
        unsubscribeTheme();

    });

    // Download image
    function save() {
        let a = document.createElement("a");
        a.href = image || video;
        a.setAttribute("download", name);
        a.click();

        // Send notification
        sendNotification("Download dell'immagine iniziato");
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

    function close() {
        image = null;
        active = false;
    }

    function isCopySupported(name) {
        if(name.includes("gif") || name.includes("mp4") || name.includes("webm"))
            return false;
        return true;
    }

</script>

<Overlay bind:active>

    <div class="popup rounded pa-3 {getColor(_theme)}">

        {#if image}
            <div class="image-container">
                <!-- svelte-ignore a11y-img-redundant-alt -->
                <img class="rounded" src={image} alt="image to copy" />
            </div>
        {:else}
            <div class="loading pt-16 pb-16">
                <ProgressCircular indeterminate color="accent" />
            </div>
        {/if}

        <!-- Actions -->
        <div class="d-flex pt-3">

            <!-- Action container -->
            <div class="action-container pr-1">

                <!-- Close button -->
                <Button outlined block class="red-text" on:click={close}>
                    Chiudi
                </Button>          

            </div>

            <!-- Check if picture clipboard is compatible -->
            {#if typeof(ClipboardItem) === "function" && isCopySupported(name)}

                <!-- Action container -->
                <div class="pl-1 pr-1">

                    <!-- Copy button -->
                    <Button disabled={!image} outlined depressed class="primary-text" on:click={copyImage}>
                        <Icon path={mdiContentCopy} />
                    </Button>

                </div>

            {/if}

            <!-- Action container -->
            <div class="action-container pl-1">

                <!-- Download button -->
                <Button disabled={!image} depressed block class="primary-color white-text" on:click={save}>
                    <Icon path={mdiDownload} class="mr-2" />
                    Scarica
                </Button>

            </div>

        </div>

    </div>

</Overlay>

<style>

    .popup {
        width: 95%;
        max-width: 500px;
        height: auto;
    }

    .image-container {
        display: grid;
        place-items: center;
    }

    img, video {
        width: 100%;
        height: auto;
        object-fit: contain;
        max-height: 50vh;
    }

    .loading {
        display: grid;
        place-items: center;
    }

    .action-container {
        flex: 1;
    }

</style>