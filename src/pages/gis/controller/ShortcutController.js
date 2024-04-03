export default class ShortcutController {

    constructor(controllers, layer) {
        this._controllers = controllers;
        this._layer = layer;
        
        // Detect state change
        layer.on("stateChange", layer.bind(this.refreshButton, this));

    }

    // On button creation
    onAdd(map) {
        this._map = map;
        this._container = document.createElement('div');
        this._container.className = 'maplibregl-ctrl maplibregl-ctrl-group mapboxgl-ctrl mapboxgl-ctrl-group';
        this._container.style = "font-size: 100%; color: #000000; line-height: 1; overflow: hidden";
        
        // Load controllers
        this.loadControllers();
        
        return this._container;
    }
      
    // On button remove
    onRemove() {

        // Remove event listener
        this._layer.off("stateChange", this.refreshButton);

        this._container.parentNode.removeChild(this._container);
        this._map = undefined;
        this._controllers = undefined;
        this._layer = undefined;
        this._container = undefined;
    }

    // Refresh button
    refreshButton() {

        // Remove old controllers
        this._container.replaceChildren();

        // Load controllers
        this.loadControllers();

    }

    // Load children
    loadControllers() {

        // Iterate over controllers
        this.getControllers().forEach(c => {

            // Load controller
            this._container.appendChild( c );

        })

    }

    // Get controllers
    getControllers() {

        // Controllers button
        return this._controllers.map(controller => {

            // Get controller button
            return this.getControllerButton(controller);

        })

    }

    // Get button
    getControllerButton(config) {

        // Create button
        let b = document.createElement("button");

        // Toogle color
        if(config.type === "checkbox") {

            // Check if checkbox is checked
            if(this._layer.getState()[config.key]) {

                // Set button text to the primary color
                b.className = "primary-color-text";

            }

        }
        
        // Set content
        let content = (typeof(config.shortcut?.content) === "function" ? config.shortcut?.content(this._layer.getState()) : config.shortcut?.content) || "?";
        
        // Switch between content types
        if(typeof(content) === "object") {

            // Switch between content types
            switch(content.type) {

                case "text": {
                    b.innerHTML = content.value;
                    break;
                }

                case "node": {
                    b.appendChild(content.value);
                    break;
                }

                case "svg": {
                    let size = "22px"
                    b.innerHTML = `<svg width="${size}" height="${size}" viewbox="0 0 24 24"><path d="${content.value}"></path></svg>`
                }

            }

        } else {

            // Check if content is a string
            if(typeof(content) === "string"){

                b.innerHTML = content;

            } else {

                b.appendChild(content);

            }

        }

        // Set click handler
        b.onclick = () => {

            // Switch type
            switch(config.type) {

                // Boolean button
                case "checkbox": {

                    // Old value
                    let oldValue = this._layer.getState()[config.key];

                    // Set state
                    this._layer.setState(config.key, !oldValue);

                    break;

                };

                // Select button
                case "select": {

                    // Open option
                    this._layer.openOption(config);

                    break;

                };

            }

        };

        return b;

    }

}