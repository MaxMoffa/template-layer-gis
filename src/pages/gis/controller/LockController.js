import { mdiLock, mdiLockOpen } from "@mdi/js";

export default class LockController {

    constructor(layers=[], startingValue=false) {
        this._isLocked = startingValue;
        this._loadedLayer = [];

        // Start listener
        this.updateLayerListeners(layers);
    }

    // On button creation
    onAdd(map) {
        this._map = map;
        this._container = document.createElement('div');
        this._container.className = 'maplibregl-ctrl maplibregl-ctrl-group mapboxgl-ctrl mapboxgl-ctrl-group';
        this._container.style = "font-size: 100%; color: #000000; line-height: 1; overflow: hidden";

        // Load children
        this._container.appendChild( this.getButton() );
        
        return this._container;
    }
      
    // On button remove
    onRemove() {

        // Remove listeners
        this.removeLayerListeners();

        // Reset
        this._loadedLayer = undefined;
        this._isLocked = undefined;
        this._layers = undefined;
    }

    // Set lock state
    setLockState(newState) {

        // Update lock state
        this._isLocked = newState;

        // Refresh button
        this.loadButton();

        // Update layers lock
        this.updateLayerLock();

    }

    // Update layer listeners
    updateLayerListeners(newLayers=null) {

        console.log("UPDATE LAYER LISTENERS", newLayers);

        // Update layers
        if(newLayers !== null && Array.isArray(newLayers))
            this._layers = newLayers;

        // Layers to maintain during clear process
        let dontRemove = [];

        // Iterate over layers
        this._layers.forEach(l => {

            // Check if layer is lockable
            if(l?.isLocked() === null)
                return;

            // Check if layer is listening
            if(this._loadedLayer.includes(l.id)) {
                dontRemove.push(l.id);
                return;
            }

            // Start listening
            l?.on("lockChange", l.bind(this.checkLock, this));

            // Add layer to loaded list
            this._loadedLayer.push(l.id);

            // Add to dontRemove list
            dontRemove.push(l.id);

        });
        
        // Clear old layers
        this._loadedLayer = this._loadedLayer.filter(lid => dontRemove.includes(lid));

    }

    // Remove layer listeners
    removeLayerListeners() {

        // Iterate over layers
        this._layers.forEach(l => {

            // Check if layer is lockable
            if(l?.isLocked() === null)
                return;

            // Check if layer is listening
            if(!this._loadedLayer.includes(l.id))
                return;

            // Start listening
            l?.off("lockChange", this.removeLock);

        });

        // Reset
        this._loadedLayer = [];

    }

    // Update layers lock state
    updateLayerLock() {

        // Iterate over layers
        this._layers.forEach(l => {

            // Check if layer is lockable
            if(l?.isLocked() === null)
                return;

            // Update layer lock state
            l.setLockState(this._isLocked);

        });

    }

    // Remove lock
    checkLock() {

        // Default lock state
        this._isLocked = true;

        // Iterate over layers
        for(let l of this._layers) {

            // Check if layer is lockable
            if(l?.isLocked() === null)
                continue;

            // Check if layers are locked
            if(!l?.isLocked()) {

                // Update lock state
                this._isLocked = false;

                // Skip for
                break;

            }

        };

        // Refresh button
        this.loadButton();

    }

    // Load button
    loadButton() {

        // Replace child
        this._container.replaceChildren( this.getButton() );

    }

    // Get button
    getButton() {

        // Create button
        let b = document.createElement("button");

        // Switch between open and close
        if(this._isLocked) {

            // Set button text to the primary color
            b.className = "primary-color-text";

        }

        // Set icon
        let icon = this._isLocked ? mdiLock : mdiLockOpen;

        // Icon size
        let size = "20px";

        // Set icon
        b.innerHTML = `<svg width="${size}" height="${size}" viewbox="0 0 24 24"><path d="${icon}"></path></svg>`;

        // Set on click handler
        b.onclick = () => this.setLockState( !this._isLocked );

        return b;

    }

}