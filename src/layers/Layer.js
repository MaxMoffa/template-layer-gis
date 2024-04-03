/*

    LAYER PROTOTYPE
    - This class is used to create new layers
    By Massimo Moffa

*/

// Constants
const INVALID_ID = "The provided ID must be a string";
const INVALID_MAP = "The provided MAP must be an istance of 'maplibre-gl'";
const INVALID_LAYER = "The provided RENDER method must be overwritten in the child class";
const INVALID_LISTENER_REMOVAL = "Can't remove a listener. The event doesn't exits";
const INVALID_MAP_LISTENER = "The provided map listener is invalid";
const INVALID_MAP_LISTENER_REMOVAL = "Can't remove a map listener. The event doesn't exits"

// Imports
import maplibregl from 'maplibre-gl';
import ShortcutController from '../pages/gis/controller/ShortcutController';
import { user } from '../store/user';
import { theme } from '../store/theme';

export default class Layer {

    // Variables
    _id = null;
    _name = "Unknown layer";
    _className= "Layer";
    _map = null;
    _state = {};
    _internalState = {};
    _options = [];
    _controllers = [];
    _events = {};
    _loading = false;
    _mapEvents = [];
    _isRendered = false;
    _isVisible = false;
    _isLocked = false;
    _noLayer = false;
    _user = null;
    _unsubscribeUser = null;
    _unsubscribeTheme = null;
    _layerOptions = {};
    _cache=null;

    // Active layers
    static _activeLayer = [];

    // Constructor
    constructor(id=null, map=null, state=null, options) {

        // Check if ID is valid
        if(typeof(id) !== "string")
            throw Error(INVALID_ID);

        // Set instance ID
        this._id = id;

        // Check if map instance is valid
        if(!(map instanceof maplibregl.Map))
            throw Error(INVALID_MAP);

        // Set map instance
        this._map = map;

        // Check if state is valid
        if(typeof(state) !== "object")
            throw Error(INVALID_STATE);

        // Set state
        if(state !== null)
            this._state = state;

        // Set state
        if(options?.noLayer)
            this._noLayer = options?.noLayer;

        // Set options
        if(options && typeof(options) === "object")
            this._layerOptions = options;

        // Listen to map remove event
        this.onMap("remove", this.destroy.bind(this));

        // Check if layer is subscribed to theme update
        if(this._layerOptions?.subscribeTheme) {

            // Subscribe to theme update
            this._unsubscribeTheme = theme.subscribe(_theme => {

                // Update state
                this._state["theme"] = _theme;

                // Emit state change
                this.emit("stateChange", this._state);

            });

        }

        // Subscribe to user update
        this._unsubscribeUser = user.subscribe(_user => this._user = _user);

    }

    /*
        COMPONENT HANDLER
    */

    // Open component on map
    loadComponent(id, component, data) {

        // Emit component open event
        this.emit("loadComponent", { id: this.getID() + "_" + id, component, data });

    }

    // Close component
    removeComponent(id) {

        // Emit component remove event
        this.emit("removeComponent", { id: this.getID() + "_" + id });

    }

    /*
        CACHE HANDLER
    */

    // Check if cache is enabled
    isCacheAvailable() {

        console.log(this._state);

        // Check state value
        return this._state.hasOwnProperty("date");

    }

    // Set a cache data range
    downloadCacheRange(start, end, unit="days") {

        // Warning log
        console.warn(`Download cache range is not available for ${this.getClassName()} layer`);

    }

    // Retrieve elements from cache
    getCacheItem(id) {

        // Get item
        let item = sessionStorage.getItem(id);

        // Return
        return item ? JSON.parse(item) : item;

    }

    // Add elements to cache
    addCacheItem(id, value) {

        // Add cache element (Overwrite if already present)
        sessionStorage.setItem(id, JSON.stringify(value));

    }

    // Get id from params
    getCacheID(params, name="") {

        // String base
        let s = this.getID() + "_" + this.getClassName();

        // Values array
        let valuesArray = [];

        // Iterate over params
        for (const pair of params.entries()) {
        
            // Add value if not token or apikey
            if(pair[0] !== "token" && pair[0] !== "apikey")
                valuesArray.push( pair[1] );
            
        }

        // Add name if provided
        if(name)
            s += "_" + name;

        return s + valuesArray.sort().join("_");

    }

    // Reset cache
    resetCache() {
        
        // Reset
        this._cache = null;

    }

    /*
        GETTER
    */

    // Get layer instance ID
    getID() {
        return this._id;
    }

    // Get layer name
    getName() {
        return this._name;
    }

    // Get map instance
    getMapInstance() {
        return this._map;
    }

    // Get layer
    getLayer() {
        return null;
    }

    // Get state
    getState() {
        return this._state;
    }

    // Get layer options
    getLayerOptions() {
        return this._options;
    }

    // Get data layer
    getLayer() {
        this.getMapInstance()?.getLayer(this.getID());
    }

    // Get layer visibility
    getLayerVisibility() {
        return this._isVisible;
    }

    // Get params @FormData
    getFormData() {

        let p = new FormData();
        
        // Check if params is valid
        if(this._layerOptions?.params){

            // Check if is an instance of FormData
            if(this._layerOptions.params instanceof FormData) {

                // Iterate over form data keys
                for(const key of this._layerOptions.params.keys())
                    p.append(key, this._layerOptions.params.get(key));

            }else if(typeof(this._layerOptions.params) === "object"){

                // Iterate over object keys
                Object.keys(this._layerOptions.params).forEach(key => p.append(key, this._layerOptions.params?.[key]));

            }

        } else {

            // Check if user info is loaded
            if(this.getUser()?.token)
                p.append("token", this.getUser().token);

        }

        return p;
        
    }

    // Get user info
    getUser() {
        return this._user;
    }

    // Get the layer name
    getClassName() {
        return this._className;
    }

    // Get map geolevel
    getGeolevel(zoom=null) {

        // Prepare zoom
        zoom = zoom || this.getMapInstance()?.getZoom();

        if(zoom < 5)
            return 0;

        if(zoom < 8)
            return 1;

        if(zoom < 9)
            return 2;

        if(zoom < 12)
            return 3;

        return 4;

    }

    // Get layer legend
    getLegend() {
        return null;
    }

    // Get option
    getOption(o, fallback=false) {
        
        // Return option or fallback value
        return this._layerOptions?.[o] ?? fallback;

    }

    // Check if is first layer
    isFirstLayer(e, layerID=this.getID()) {
        
        // Layers clicked
        let layers = this.getMapInstance().queryRenderedFeatures(e.point);
        
        // Check if it is the only layer
        if(layers.length === 1)
            return true;

        // Check layer position
        for(let i=0; i<layers.length; i++) {

            // Check if is the same layer
            if(layers[i].layer.id === layerID)
                return (i === 0);

        }

        // Fallback
        return false;

    }

    // Get loading state
    isLoading() {
        return this._loading;
    }

    // Is rendered
    isRendered() {
        return this._isRendered;
    }

    // Is locked
    isLocked() {
        return this._isLocked;
    }

    // Serialize the layer state
    serialize() {

        // State to serialize
        let serializedState = {};

        // Iterate over options
        this.getLayerOptions()?.forEach(o => {

            // Check if option is to serialize
            if(o?.saveState === undefined || o.saveState) {

                // Save state
                serializedState[o.key] = this._state[o.key];

            }

        });

        // Serialize object
        return {

            // Class name
            name: this.getClassName(),

            // Layer info
            layer: {
                isVisible: this.getLayerVisibility(),
                isLocked: this.isLocked()
            },

            // State
            state: serializedState

        };

    }

    /* 
        NAVIGATION CONTROLLERS
    */

    // Load navigation controllers
    loadControllers() {

        // Get options
        let shortcuts = this.getLayerOptions().filter(o => {

            // Check if option has shortcut
            return o.hasOwnProperty("shortcut");

        });

        // Check if there are shortcuts
        if(shortcuts.length === 0)
            return;

        // Create controller TMP
        let c = new ShortcutController(shortcuts, this);

        // Load controller
        this.getMapInstance().addControl(c, c.shortcut?.position);

        // Add controller to list
        this._controllers.push(c);

    }

    // Remove controllers
    removeControllers() {

        // Iterate over controllers
        this._controllers.forEach(c => {

            // Remove controller
            this.getMapInstance().removeControl(c);

        });

        // Reset controllers
        this._controllers = [];

    }

    // Open option popup
    openOption(o) {

        // Emit event
        this.emit("openOption", { ...o, layer: this });

    }

    /*
        SETTER
    */

    // Set options
    setOptions(options={}) {

        // Update options
        this._layerOptions = {
            ...this._layerOptions,
            ...options
        }

    }

    // Set state
    setState(state) {

        // Update options
        this._state = {
            ...this._state,
            ...state
        };

        // State change
        this.emit("stateChange", this._state);

    }

    // Set state option
    setState(key, value) {

        // Update option
        this._state[key] = value;

        // State change
        this.emit("stateChange", this._state);

    }

    // Set visibility
    setVisibility(visible) {

        // Toogle visibility
        if(!visible)
            this.remove();
        else
            this.render();

    }

    // Set lock state
    setLockState(newState) {

        // Update the state
        this._isLocked = newState;

        // Lock state change 
        this.emit("lockChange", this._isLocked);

    }

    /* 
        EVENT HANDLER
    */

    // Bind function and context with reference to the original function
    bind(f, context=this) {

        // Create the binding
        let newF = f.bind(context);

        // Set the reference to the original function
        newF.original = f;

        return newF;
    }

    // Add listener to layer
    on(name, listener) {

        // Check if event is previously been attached
        if(!this._events[name])
            this._events[name] = [];

        // Push event listener
        this._events[name].push(listener);

    }

    // Remove listener from layer
    off(name, listenerToRemove) {

        // Check if there are event listener
        if(!this?._events?.[name]){
            console.warn(INVALID_LISTENER_REMOVAL);
            return;
        }

        // Listener filter
        const listenerFilter = listener => {

            if(listener === listenerToRemove)
                return false;

            if(listener.hasOwnProperty("original") && listener.original === listenerToRemove)
                return false;

            return true;

        };

        // Remove listener
        this._events[name] = this._events[name].filter(listenerFilter);

    }

    // Emit an event
    emit(name, data=undefined) {

        // Check if there are listener
        if(!this._events?.[name])
            return;

        // Fire a single callback
        const fireCallback = callback => callback(data);

        // Emit event for all listener
        this._events[name].forEach(fireCallback);

    }

    // Emit an error event
    showError(e, hideLayer=true) {

        // Call the emit event
        this.emit("error", { e, id: this.getID(), name: this.getName() });

        // Check if is required to hide the layer
        if(hideLayer) {

            // Set layer visibility off
            this.setVisibility(false);

        }

    }

    // Emit a start loading event
    startLoading() {

        // Set loading true
        this._loading = true;

        // Call the emit event
        this.emit("startLoading", this.getID());

    }

    // Emit a stop loading event
    stopLoading() {

        // Set loading false
        this._loading = false;

        // Call the emit event
        this.emit("stopLoading", this.getID());

    }

    // Remove all event listener
    removeAllEventListener() {

        // Reset the event listener list
        this._events = {};

    }

    // Add map event listener
    onMap(name, callback, onLayer=false) {

        // Check if parameters are correct
        if(typeof(name) !== "string" || typeof(callback) !== "function")
            throw new Error(INVALID_MAP_LISTENER);

        // Update map event listener list
        this._mapEvents = [ ...this._mapEvents, { name, callback, onLayer } ];

        // Turn on event listener
        if(onLayer)
            this.getMapInstance().on(name, this.getID(), callback);
        else
            this.getMapInstance().on(name, callback);

    }

    // Add map event listener
    offMap(name, callback, onLayer=false) {

        // Check if parameters are correct
        if(typeof(name) !== "string" || typeof(callback) !== "function")
            throw new Error(INVALID_MAP_LISTENER_REMOVAL);

        // Find the function
        let eventToRemove =  this?._mapEvents?.find(event => event.callback === callback || (event.callback.hasOwnProperty("original") && event.callback.original === callback));

        // Check if event is present
        if(!eventToRemove){
            console.warn(INVALID_MAP_LISTENER_REMOVAL);
            return;
        }

        // Turn off event listener
        if(onLayer)
            this.getMapInstance().off(name, this.getID(), eventToRemove.callback);
        else
            this.getMapInstance().off(name, eventToRemove.callback);

        // Update map event listener list
        this._mapEvents = this._mapEvents.filter(event => event.callback !== eventToRemove.callback);

    }

    // Await till the layer is rendered
    onceRendered() {

        return new Promise((resolve, reject) => {

            // Load event
            this.getMapInstance().on("data", (function sourceDataReader(e) {

                // Check if is source
                if(e.dataType !== "source")
                    return;

                // Check if sourceId is the same
                if(e.sourceId !== this.getID())
                    return;

                // console.log(this.getID(), e);

                // Check if source is loaded and is not metadata
                if(e.isSourceLoaded){

                    console.log("RENDER", this.getID());

                    // Clear sourcedata listeners
                    this.getMapInstance()._listeners.sourcedata = this.getMapInstance()?._listeners?.sourcedata?.filter(l => !l.name.includes("sourceDataReader"));

                    // Resolve promise
                    resolve();

                }

            }).bind(this));

        });

    }

    // Remove all map event listener
    removeAllEventListenerMap() {
        
        // Iterate over event listener
        this._mapEvents.forEach(({ name, callback, onLayer }) => {

            // Check if listener is on layer or map
            if(onLayer)
                this.getMapInstance()?.off(name, this.getID(), callback);
            else
                this.getMapInstance()?.off(name, callback);

        });

        // Reset event listener map
        this._mapEvents = [];

    }

    /*
        MAP INTERACTIONS
    */

    // Force the map to repaint
    repaint() {

        // Call the 'triggerRepaint' method on the map
        this.getMapInstance().triggerRepaint();

    }

    // Show/Hide layer
    toogleVisibility() {

        // Toogle visibility
        if(this._isVisible)
            this.remove();
        else
            this.render();

    }

    // Add layer to map
    render(_layer=null, _source=null) {

        if(!this._noLayer) {

            // Check if layer element is provided to the parent render method
            if(!_layer && !_source)
                throw Error(INVALID_LAYER);

                console.log(_layer);

            // Add layer to map
            if(_layer)
                this.getMapInstance()?.addLayer(_layer);
            
            // Add source to map
            if(_source)
                this.getMapInstance()?.addSource(this.getID(), _source);

            // Add layer to list
            Layer._activeLayer.push(this.getID());

        }

        // Update first render
        this._isRendered = true;

        // Update visibility
        this._isVisible = true;

        // Visibility state change 
        this.emit("visibilityChange", this._isVisible);

        // Check if interactive
        if(this.getOption("interactive", true) && this.getOption("showControllers", true)) {

            // Load navigations controller if exist
            this.loadControllers();

        }

    }

    // Remove layer from map
    remove() {
        
        // Try removal operation
        try {

            if(!this._noLayer) {

                // Check if layer is present
                if(this.getMapInstance().getLayer(this.getID()))
                    this.getMapInstance()?.removeLayer(this.getID());

                // Check if source is present
                if(this.getMapInstance().getSource(this.getID()))
                    this.getMapInstance()?.removeSource(this.getID());
            }

            // Update visibility
            this._isVisible = false;

            // Visibility state change 
            this.emit("visibilityChange", this._isVisible);

            // Remove layer from list
            Layer._activeLayer = Layer._activeLayer.filter(id => id !== this.getID());
            
        } catch (error) {

            // Emit error
            // this.showError(error);
            
        }

        // Repaint
        this.repaint();

        // Check if interactive
        if(this.getOption("interactive", true)) {

            // Remove controllers
            this.removeControllers();

        }

    }

    // Destroy layer
    destroy() {

        // Remove layer from map
        this.remove();

        // Remove all map event listener
        this.removeAllEventListenerMap();

        // Remove all event listener
        this.removeAllEventListener();

        // Unsubscrbe to user update
        this._unsubscribeUser?.();

        // Unsubscrbe to theme update
        this._unsubscribeTheme?.();

        // Reset all
        this._id = undefined;
        this._map = undefined;
        this._name = undefined;
        this._state = undefined;
        this._options = undefined;
        this._events = undefined;
        this._internalState = undefined;
        this._loading = undefined;
        this._mapEvents = undefined;
        this._isRendered = undefined;
        this._isVisible = undefined;
        this._isLocked = undefined;
        this._noLayer = undefined;
        this._controllers = undefined;
        this._layerOptions = undefined;
        this._cache = undefined;

    }

}