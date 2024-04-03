/*

    LAYER BaseMap
    - This layer shows the base map

    @state
    {
        mapStyle: "Basic"
    }

*/

// Imports
import { mdiImageFilterHdr, mdiMap } from "@mdi/js";
import Layer from "../Layer";
import { getMapStyleList, getStyleUrl } from '../../utils/MapUtils';

const DEFAULT_STATE = {
    mapStyle: "standard",
    enableMountains: false,
    theme: "light"
}

export default class BaseMap extends Layer {

    // Layer name
    _name = "Base map";
    _className= "BaseMap";
    _options = [
        {
            type: "select",
            key: "mapStyle",
            placeholder: "Stile mappa",
            items: [...getMapStyleList(), { name: "Satellite raster", value: "satellite-minimal" }],
            cols: 12,
            shortcut: {
                position: "top-right",
                content: { type: "svg", value: mdiMap }
            }
        },
        {
            type: "checkbox",
            key: "enableMountains",
            placeholder: "Mostra rilievi",
            shortcut: {
                position: "top-right",
                content: { type: "svg", value: mdiImageFilterHdr }
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

    // @Override
    // Await till the layer is rendered
    onceRendered() {

        return new Promise((resolve, reject) => {

            // Load event
            this.getMapInstance().once("styledata", () => {

                resolve();

            });

        });

    }

    // @override
    isLocked() {
        return null;
    }

    // Get style url
    getStyleUrl(name) {
        
        return getStyleUrl(name, "tilejson", this._state.theme);

    }

    // Save layers and sources
    backupLayers() {

        // Get style
        let s = this.getMapInstance().getStyle();

        // Check if style is valid
        if(!s)
            return;

        // Iterate over layers to save
        s.layers.forEach(layer => {

            // Parse ID to check
            let idChecker = layer.id.split("_")[0];

            // Check layer
            if(!Layer._activeLayer.includes(idChecker) && !this._internalActiveLayers.includes(idChecker))
                return;

            // Save source
            if(layer.source)
                this._savedSources[layer.source] = this.getMapInstance().getSource(layer.source).serialize();
       
            // Save layer
            this._savedLayers.push(layer);

        });

    }

    // Restore layers and sources
    restoreLayers(e) {

        // Check if is raster
        // if(this._state.mapStyle === "satellite-minimal")
        //     return;

        // Restore sources
        Object.entries(this._savedSources).forEach(([id, source]) => {

            // Add source
            if(!this.getMapInstance().getSource(id))
                this.getMapInstance().addSource(id, source);
        });
    
        // Restore layers
        this._savedLayers.forEach((layer) => {

            // Add layer
            if(!this.getMapInstance().getLayer(layer.id))
                this.getMapInstance().addLayer(layer);

        });

        // Reset
        this._savedSources = {};
        this._savedLayers = [];

        // Stop loading
        super.stopLoading();

    }



    // Update map style
    updateStyle() {

        // Remove mountains
        this.removeMountains();

        // // Update style
        // if(this._state.mapStyle !== "satellite-minimal"){

            // Load vectorial map
            this.loadVect(this.getStyleUrl( this._state.mapStyle ));

        // } else {

        //     // Load raster layer
        //     this.loadRaster(this.getStyleUrl( this._state.mapStyle ));

        //     // Stop loading
        //     super.stopLoading();

        // }

    }

    // Load vectorial
    loadVect(url) {

        // Remove raster (if loaded)
        this.removeRaster();

        // Backup layers and sources
        this.backupLayers();

        // Update style
        super.getMapInstance().setStyle( url, {
            diff: false
        });

    }

    // Load raster
    loadRaster(url) {

        let id = super.getID() + "_raster";

        // Add raster layer
        this._savedLayers.push({
            id: id,
            type: 'raster',
            source: id
        });

        // Add source layer
        this._savedSources[id] = {
            type: 'raster',
            url: url,
            tileSize: 256,
            attribution: '&copy; OpenStreetMap Contributors',
            maxzoom: 19
        };

        // Add source to the list
        this._internalActiveLayers.push(id);

        // Backup layers and sources
        this.backupLayers();

        // Remove style
        super.getMapInstance().setStyle({
            version: 8, 
            sources: this._savedSources, 
            layers: this._savedLayers,
            glyphs: "https://api.maptiler.com/fonts/{fontstack}/{range}.pbf?key=2LgFFGRIs3S6udTIh4Gs"
        }, {
            diff: false
        });

        // Reset
        this._savedSources = {};
        this._savedLayers = [];

    }

    // Remove raster
    removeRaster() {

        let id = super.getID() + "_raster";

        // Check if mountains are loaded
        if(!this._internalActiveLayers.includes(id))
            return;

        // Remove source from list
        this._internalActiveLayers = this._internalActiveLayers.filter(l => l !== id);

        // Remove layer
        super.getMapInstance().removeLayer(id);

        // Remove source
        super.getMapInstance().removeSource(id);

    }

    // Load mountains
    loadMountains() {

        let id = super.getID() + "_mountains";

        // Add mountains source
        super.getMapInstance().addSource(id, {
            "type": 'raster-dem',
            "url": 'https://api.maptiler.com/tiles/terrain-rgb-v2/tiles.json?key=2LgFFGRIs3S6udTIh4Gs',
            "tileSize": 256,
        });

        // Set terrain
        super.getMapInstance().setTerrain({
            source: id,
            exaggeration: 1
        });

        // Add source to the list
        this._internalActiveLayers.push(id);

        // Stop loading
        super.stopLoading();

    }

    // Remove mountains
    removeMountains() {

        let id = super.getID() + "_mountains";

        // Check if mountains are loaded
        if(!this._internalActiveLayers.includes(id))
            return;

        // Remove source from list
        this._internalActiveLayers = this._internalActiveLayers.filter(l => l !== id);

        // Reset terrain
        super.getMapInstance().setTerrain(null);

        // Remove source
        super.getMapInstance().removeSource(id);

        // Update state (if required)
        if(this._state.enableMountains){
            this._internalState.enableMountains = false;
            super.setState("enableMountains", false);
        }

        // Stop loading
        super.stopLoading();

    }

    // Refresh
    refresh() {

        // Check if mapstyle changed
        if(this._state.mapStyle !== this._internalState.mapStyle || this._state.theme !== this._internalState.theme){

            // Start loading
            super.startLoading();

            // Update internal state
            this._internalState.mapStyle = this._state.mapStyle;
            this._internalState.theme = this._state.theme;

            // Update map style
            this.updateStyle();

        }

        // Check if mountains state is changed
        if(this._state.enableMountains !== this._internalState.enableMountains) {

            // Start loading
            super.startLoading();

            // Update internal state
            this._internalState.enableMountains = this._state.enableMountains;

            if(this._state.enableMountains) {

                // Load mountains
                this.loadMountains();

            } else {

                // Remove mountains
                this.removeMountains();

            }

        }

    }

    // Render
    render() {

        // Start loading
        super.startLoading();

        // Update style
        this.updateStyle();

        // Set style
        super.render();

        // add style listener
        super.onMap("style.load", super.bind(this.restoreLayers, this));

        // Refresh on change
        super.on("stateChange", super.bind(this.refresh, this));

        // Update internal state
        this._internalState.mapStyle = this._state.mapStyle;
        this._internalState.theme = this._state.theme;
        this._internalState.enableMountains = this._state.enableMountains;

    }

    // On remove
    remove() {

        // Start loading
        super.startLoading();

        // Remove mountains
        this.removeMountains();

        // Remove raster
        this.removeRaster();

        // Backup layers and sources
        this.backupLayers();

        // Remove style
        super.getMapInstance().setStyle({version: 8,sources: this._savedSources, layers: this._savedLayers}, {
            diff: false
        });

        // Stop loading
        super.stopLoading();

        // Reset
        this._savedSources = {};
        this._savedLayers = [];

        // Remove state listener
        super.off("stateChange", this.refresh);

        // Remove style listener
        super.offMap("style.load", this.restoreLayers);

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

    }

}