/*

    Map Video Recorder
    - This util record multiple map canvas

*/

// Default maprecorder configuration
const MAPRECORDER_CONFIG = {
    videoBitsPerSecond: 30000000,
    mimeType: 'video/webm',
    type: 'video/webm',
    frameRate: 30,
}

export default class MapRecorder {

    // Recording status
    isRecording = false;

    constructor(map, callback, options={}) {

        // Set map
        this._map = map;

        // Set callback
        this._callback = callback;

        // Set options
        this._options = { ...MAPRECORDER_CONFIG, ...options };

        // Check video codec type compatibility
        if (!MediaRecorder.isTypeSupported(this._options.mimeType)) {
            
            // Set default type 
            this._options.type = "video/webm";
            this._options.mimeType = "video/webm";

            // Warning
            console.warn("The provided mime type is not compatible with this browser");

        }

        // Load watermark
        this._watermark = new Image();
        this._watermark.src = "/favicon-32x32.png";

        // Update canvas list
        // this.updateCanvasList();

    }

    // Update canvas list
    updateCanvasList() {

        // Init / Reset canvas list
        this._canvasList = [];

        // Init / Reset chunks
        this._chunks = [];

        // Get map canvas
        for(const c of this._map.getCanvasContainer().children) {

            // Add canvas context to the list
            this._canvasList.push( c );

        };

        // Setup output canvas
        this._outputCanvas = document.createElement("canvas");

        // Check if there is at least a canvas
        if(this._canvasList.length > 0) {

            // Set output canvas width
            this._outputCanvas.width = this._canvasList[0].width;

            // Set output canvas height
            this._outputCanvas.height = this._canvasList[0].height;

            // Set padding if required
            if(this?._options?.padding) {

                // Apply width padding
                this._outputCanvas.width -= this._options.padding.left - this._options.padding.right;

                // Apply height padding
                this._outputCanvas.height -= this._options.padding.top - this._options.padding.bottom;

            }

            // Correct dimensions for H264 conversion
            if(this._outputCanvas.width % 2 !== 0) {
            
                // Remove one pixel for even width
                this._outputCanvas.width -= 1;

            }

            // Correct dimensions for H264 conversion
            if(this._outputCanvas.height % 2 !== 0) {

                // Remove one pixel for even width
                this._outputCanvas.height -= 1;

            }

        }

        // Get context
        this._outputCanvas.getContext('2d');

        // Prepare media recorder options
        let options = {
            videoBitsPerSecond: this._options.videoBitsPerSecond,
        };

        // Check if mime type is compatible
        if(MediaRecorder.isTypeSupported(this._options.mimeType)) {
            options.mimeType = this._options.mimeType;
        }

        // Setup media recorder
        this._mediaRecorder = new MediaRecorder( this._outputCanvas.captureStream( this._options.frameRate ), options);

        // Add event listener for "dataavailable"
        this._mediaRecorder.ondataavailable = event => {

            // Check event data size
            if (event.data.size > 0)
                this._chunks.push(event.data);
            
        };

        // Add event listener for "error"
        this._mediaRecorder.onerror = e => {

            // Log error
            console.error(e);

        }

        // Add event listener for "stop"
        this._mediaRecorder.onstop = () => {

            // Call callback
            this._callback( this.getVideo(), "webm" );

        }

    }

    // Draw all input canvas on the output canvas
    async draw() {

        // Output canvas context
        let outputCtx = this._outputCanvas.getContext("2d");

        // Draw background
        outputCtx.fillStyle = "#abcdef";
        outputCtx.fillRect(0, 0, this._outputCanvas.width, this._outputCanvas.height);

        // Calculate padding
        let paddingLeft = this._options?.padding?.left || 0;
        let paddingTop = this._options?.padding?.top || 0;

        // Iterate over canvas list
        this._canvasList.forEach(canvas => {

            // Draw canvas on the output canvas
            outputCtx.drawImage(canvas, -paddingLeft, -paddingTop);

        })

        // Check if watermark is loaded
        if(this._watermark) {

            // X coordinate
            let dx = this._outputCanvas.width - this._watermark.width - 16;

            // Y coordinate
            let dy = this._outputCanvas.height - this._watermark.height - 16;

            // Draw watermark
            outputCtx.drawImage(this._watermark, dx, dy);

        }

        // Check if dynamic watermark is present
        if(typeof(this._options?.drawOverlay) === "function") {

            // Load dynamic watermark
            this._options?.drawOverlay(this._outputCanvas);

        }

        // Check if is recording
        if(this.isRecording) {

            // Request animation frame
            this._animationFrameRequestID = requestAnimationFrame(this.draw.bind(this));

        }

    }

    // Get recorded video
    getVideo() {

        // Crea un URL per il video registrato
        let blob = new Blob(this._chunks, { type: this._options.type });

        // Return video blob url
        return URL.createObjectURL(blob);

    }

    // Start video recording
    async startRecording() {

        // Check if is recording
        if(this.isRecording)
            return;

        // Reset chunks
        this._chunks = [];

        // Update recording status
        this.isRecording = true;

        // Start drawing output canvas
        this._animationFrameRequestID = requestAnimationFrame(this.draw.bind(this));

        // Start recording
        this._mediaRecorder.start();

    }

    // Stop video recording
    async stopRecording() {

        // Check if is recording
        if(!this.isRecording)
            return;

        // Stop request animation frame
        cancelAnimationFrame(this._animationFrameRequestID);

        // Update recording status
        this.isRecording = false;

        // Stop recording
        this._mediaRecorder.stop();

    }

    // Destroy
    destroy() {

        // Stop recording
        this.stopRecording();

        // Reset variables
        this._map = undefined;
        this._canvasList = undefined;
        this._options = undefined;
        this._animationFrameRequestID = undefined;
        this._chunks = undefined;
        this._mediaRecorder = undefined;
        this._outputCanvas = undefined;
        
    }

}