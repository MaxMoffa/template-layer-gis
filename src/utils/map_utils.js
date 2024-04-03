// Map Utils
import L from 'leaflet';
import NetworUtils from './network_utils';
import * as provider from '../components/leaflet-providers';

export default class Map {

    // Map attributes
    _map = null;
    _mapRef = null;
    _layerGroup = null;
    _config = null;
    _place = null;
    _params = null;
    _lastPlace = null;
    _lastGeoLevel = null;
    _data = null;
    _geojson = null;
    _tileLayer = null;
    _popup = null;
    _marker = null;

    // Map constructor
    constructor(_params, _mapRef, _config={}) {

        let defaultConfig = {center: [41.880458, 12.470133], zoom: 5, info: { zoomControl: true }};

        // Map reference
        this._mapRef = _mapRef;

        // Map configuration
        this._config = {
            ...defaultConfig,
            ..._config
        };

        // Params
        this._params = _params;

        // Map object
        this._map = L.map(_mapRef, {
            renderer: L.canvas(),
            center: this._config.center,
            zoom: this._config.zoom,
            zoomControl: this._config.info.zoomControl,
            maxZoom: this._config?.maxZoom
        });

        // Create layerGroup
        this._layerGroup = new L.LayerGroup();
        this._layerGroup.addTo(this._map);

    }

    // Destroy the map
    destroy() {
        
        if(this._map !== null){
            console.log("MAP DESTROY C", this._map);
            this._map.off();
            this._map.remove();
        }

        this._map = null;
        this._mapRef = null;
        this._layerGroup = null;
        this._config = null;
        this._place = null;
        this._params = null;
        this._lastPlace = null;
        this._lastGeoLevel = null;
        this._data = null;
        this._geojson = null;
        this._tileLayer = null;
        this._popup = null;
        this._marker = null;
    }

    // Load tiles on the map
    applyTiles(name='OpenStreetMap.Mapnik') {
        if(this._tileLayer !== null)
            this._tileLayer.remove();
        this._tileLayer = L.tileLayer.provider(name).addTo(this._map);
    }

    // Get map geolevel
    getGeoLevel(){
        let zoom = this.getZoom();
        return Map._getGeoLevel(zoom);
    }

    // Get geolevel
    static _getGeoLevel(zoom) {
        if(zoom < 6)
            return 0;
        if(zoom < 9)
            return 1;
        if(zoom < 11)
            return 2;
        if(zoom < 13)
            return 3;
        return 4;
    }

    // Get zoom from geolevel
    static _getZoomFromGeolevel(geolevel) {
        if(geolevel === 0)
            return 5;
        if(geolevel === 1)
            return 8;
        if(geolevel === 2)
            return 10;
        if(geolevel === 3)
            return 12;
        return 13;
    }

    // Get zoom base from geolevel
    getZoomFromGeoLevel(){
        let geolevel = this.getGeoLevel();
        if(geolevel === 0)
            return 0;
        if(geolevel === 1)
            return 6;
        if(geolevel === 2)
            return 9;
        if(geolevel === 3)
            return 11;
        return 13;
    }

    // Load geojson on the map
    async loadGeojson(config={}, path=null) {

        let geodecode;
        if(path !== null){
            geodecode = path.path;
            //this.setCenter(path.center);
            //this.setZoom(path.zoom);
        }else{
            geodecode = await this.getGeodecodedPosition();
        }
        
        if(config.hasOwnProperty("moveend"))
            this._map.on("moveend", config.moveend);

        if(config.hasOwnProperty("zoomend"))
            this._map.on("zoomend", config.zoomend);

        if(config.hasOwnProperty("popupopen"))
            this._map.on("popupopen", config.popupopen);

        if(config.hasOwnProperty("popupclose"))
            this._map.on("popupclose", config.popupclose);

        if(geodecode === null)
            geodecode = {};

        this._lastPlace = geodecode;
        this._lastGeoLevel = path === null ? this.getGeoLevel() : Map._getGeoLevel(path.zoom);
        let geolevel = this._lastGeoLevel;

        if(!geodecode.hasOwnProperty("nazione")){
            geolevel = 0;
        }

        if(config.hasOwnProperty("updatePlace"))
            config.updatePlace(geodecode);

        if(config.hasOwnProperty("getData"))
            this._data = await config.getData(geodecode, geolevel);

        this._geojson = await NetworUtils.getGeoPromise(geodecode, geolevel, this._params);
        this.updateGeojsonConfiguration(config)
    }

    // Update geojson data
    async updateGeojson(config, forceDownload=false, path=null){

        try {
            
            if(this._lock)
                return;
    
            this._lock = true;
    
            // Check geolevel
            let checkGeoLevel = this._lastGeoLevel !== this.getGeoLevel();
    
            // Check place
            let geodecode;
            let checkPlace;

            if(path === null) {

                geodecode = await this.getGeodecodedPosition();
             
                if(geodecode === null){
                    this._lock = false;
                    return;
                }

                let p1 = {
                    ...this._lastPlace
                }

                let p2 = {
                    ...geodecode
                }

                let keys = Object.keys(p1);
                let lastKey = keys[keys.length - 1];
                delete p1[lastKey];
                if(p2.hasOwnProperty(lastKey))
                    delete p2[lastKey];

                checkPlace = JSON.stringify(p1) !== JSON.stringify(p2);
                
            }else {

               geodecode = path.path;
               checkPlace = true; 
               
            }
    
            // Update attributes
            this._lastPlace = geodecode;
            this._lastGeoLevel = path === null ? this.getGeoLevel() : Map._getGeoLevel(path.zoom);

            if(config.hasOwnProperty("updatePlace"))
                config.updatePlace(geodecode);

            // Exit if not required
            if(!forceDownload){
                if(!checkGeoLevel && !checkPlace){
                    this._lock = false;
                    return;
                }
            }

            let geolevel = this._lastGeoLevel;

            if(geodecode === null){
                geolevel = 0;
                geodecode = {};
            }
    
            if(config.hasOwnProperty("getData"))
                this._data = await config.getData(geodecode, geolevel);
            else
                this._data = null;

            this._geojson = await NetworUtils.getGeoPromise(geodecode, geolevel, this._params);
            this.updateGeojsonConfiguration(config);
            this._lock = false;

        } catch (error) {
            
            this._lock = false;
            throw error;

        }

    }

    // No download, only reload map
    refreshMap(config=null) {
        if(config)
            this.updateGeojsonConfiguration(config);
    }

    // Update geojson configuration 
    updateGeojsonConfiguration(config) {
        console.log("GO");
        // Remove all the layers from the map
        if(this._layerGroup)
            this._layerGroup.clearLayers();

        let layer = L.geoJSON(this._geojson, this.getConfiguration(this._data, config));
        this._layerGroup.addLayer(layer);
    }

    // Get map configuration
    getConfiguration(data=null, config) {
        return {
            style: feature => {
                return this.getColors(feature, data, config);
            },
            onEachFeature: (feature, layer) => {
                layer.on({
                    click: (e) => {
                        if(config.hasOwnProperty("click"))
                            config.click(feature, layer, e, data);
                    },
                    mouseover: (e) => {
                        if(config.hasOwnProperty("mouseover"))
                            config.mouseover(layer);
                        else
                            layer.setStyle({ weight: 3});
                    },
                    mouseout: () => {
                        if(config.hasOwnProperty("mouseout"))
                            config.mouseout(layer);
                        else
                            layer.setStyle({ weight: 1});
                    }
                });
            }
        }
    }

    // Get features colors
    getColors(feature, data=null, config) {
        
        //Default style
        let style = {
            fillColor: "#000",
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.3
        }

        // Check if there is data
        if(config.hasOwnProperty("getColors"))
            style = config.getColors(config.info, feature, data, style);

        return style;

    }

    // Get center geodecode
    async getGeodecodedPosition(){
        let center = this.getCenter();
        let result = await NetworUtils.geodecode(center.lat, center.lng, this.getGeoLevel(), this._params);
        if(result.hasOwnProperty("error"))
            return null;
        return result;
    }

    // Get center map
    getCenter() {
        return this._map.getCenter();
    }

    // Set center 
    setCenter(center){
        this._map.flyTo(center);
    }

    // Get last place
    getPosition() {
        return this._lastPlace;
    }

    // Set zoom 
    setZoom(zoom){
        this._map.flyTo(this.getCenter(), zoom);
    }

    // Get zoom
    getZoom(){
        return Math.ceil(this._map.getZoom());
    }

    // Get last place
    getLastPlace() {
        return this._lastPlace;
    }

    // Get leaflet map object
    getMapObject() {
        return this._map;
    }

    // Show a popup
    showPopup(latlng, content, options={}) {
        this._popup = L.popup(options)
            .setLatLng(latlng)
            .setContent(content)
            .openOn(this._map);
    }

    // Clear popup
    clearPopup() {
        if(this._popup !== null)
            this._popup.remove();
    }

    // Show a marker
    showMarker(latlng, options={}) {
        this._marker = L.marker(latlng, options)
            .addTo(this._map);
    }

    // Clear popup
    clearMarker() {
        if(this._marker !== null)
            this._marker.remove();
    }

    // Check if popup id open
    isPopupOpen() {
        if(this._popup)
            return this._popup.isOpen();
        return false;
    }

    // Get bounding box
    static getBoundingBox(f) {
        let result = [];
        let bounds = L.geoJson(f).getBounds();
        result.push(bounds.getNorthEast());
        result.push(bounds.getSouthWest());
        return result;
    }

    // Get map types
    static getMapTypes() {
        return ["Standard", "OpenTopoMap", "OPNVKarte", "CyclOSM", "Stamen.Toner", "Stamen.TerrainBackground", "Esri.DeLorme", "Esri.WorldTopoMap", "Esri.WorldImagery", "Esri.WorldShadedRelief", "MtbMap", "NASAGIBS.ViirsEarthAtNight2012"];
    }

    // Set geojson and data passed
    async loadStatic(geojson, data, config) {
        this._data = data;
        this._geojson = geojson;
        this.updateGeojsonConfiguration(config);
    }

}