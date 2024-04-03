export default class GenericController {

    constructor(icon, callback) {
        this._callback = callback;
        this._icon = icon;
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

        // Reset
        this._container = undefined;
        this._callback = undefined;
        this._icons = undefined;

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

        // Icon size
        let size = "20px";

        // Set icon
        b.innerHTML = `<svg width="${size}" height="${size}" viewbox="0 0 24 24"><path d="${this._icon}"></path></svg>`;

        // Set on click handler
        b.onclick = this._callback;

        return b;

    }

}