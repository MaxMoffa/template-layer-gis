/*

    LAYER NEW
    - This layer shows the base map

    @state
    {
        mapStyle: "Basic"
    }

*/

// Imports
import { mdiTestTube } from "@mdi/js";
import Layer from "../Layer";

const DEFAULT_STATE = {
    mapStyle: "standard",
    enableMountains: false,
    theme: "light"
}

export default class NewLayer extends Layer {

    // Layer name
    _name = "New layer";
    _className= "NewLayer";
    _options = [
        {
            type: "checkbox",
            key: "enableExample",
            placeholder: "Input di esempio",
            shortcut: {
                position: "top-right",
                content: { type: "svg", value: mdiTestTube }
            },
            saveState: false
        }
    ];
    _savedLayers = [];
    _savedSources = {};
    _internalState = {};
    _internalActiveLayers = [];

    // Constructor
    constructor(id, map, state) {

        super(id, map, { ...DEFAULT_STATE, ...state }, {
            noLayer: true,
            subscribeTheme: true
        });

    }

    // @Override
    // Check if cache is enabled
    isCacheAvailable() {

        return false;

    }

    // @override
    // Check if layer can be locked
    isLocked() {
        return null;
    }

    // Refresh
    refresh() {

        // TODO: Handle layer refresh

    }

    // Render
    render() {

        // TODO: Handle first render

    }

    // On remove
    remove() {

        // TODO: Remove everything from the map

        // Call super
        super.remove();

    }

    // Destroy
    destroy() {

        // Call super
        super.destroy();

        // Reset
        this._savedSources = undefined;
        this._savedLayers = undefined;
        this._name = undefined;
        this._options = undefined;

        // TODO: Reset everything

    }

}