// Maptiler APIKEY
const MAPTILER_APIKEY = "2LgFFGRIs3S6udTIh4Gs";

// Sense Square attribution
export const SENSESQUARE_ATTRIBUTION = '<a href="https://sensesquare.eu">© Sense Square</a>';

// Map tiler attribution
export const MAPTILER_ATTRIBUTION = '<a href="https://maptiler.com/?_gl=1*nltusw*_gcl_au*ODk3MzU4MDAyLjE3MDAwNDgyMjQ.*_ga*Mjk1NjExNzk2LjE3MDAwNDgyMjQ.*_ga_K4SXYBF4HT*MTcwMDA0ODIyMy4xLjEuMTcwMDA0ODM0Ni42MC4wLjA.">© MapTiler</a>';

// Map urls
export const MAP_URLS = {
    "standard" : "https://api.maptiler.com/maps/streets-v2",
    "basic" : "https://api.maptiler.com/maps/basic-v2",
    "bright" : "https://api.maptiler.com/maps/bright-v2",
    "outdoor" : "https://api.maptiler.com/maps/outdoor-v2",
    "satellite" : "https://api.maptiler.com/maps/hybrid",
    "topo" : "https://api.maptiler.com/maps/topo-v2",
    "vojager" : "https://api.maptiler.com/maps/voyager-v2",
    "satellite-v2" : "https://api.maptiler.com/maps/satellite-v2",
    "satellite-minimal" : "https://api.maptiler.com/maps/satellite"
};

// Map styles dark mode availability
export const MAP_DARK_MODE_AVAILABILITY = {
    "standard" : true,
    "basic" : true,
    "bright" : true,
    "outdoor" : true,
    "satellite" : false,
    "topo" : true,
    "vojager" : false,
    "satellite-v2" : false,
    "satellite-minimal" : false
};

// Get style url from short name
export function getStyleUrl(name, type="tilejson", theme="light") {

    // Map type
    let mapType = type === "tilejson" ? "/style.json" : "/{z}/{x}/{y}.png"; 

    // Map theme
    let mapTheme = theme === "dark" && MAP_DARK_MODE_AVAILABILITY[ name ] ? "-dark" : "";
    
    // Return map style url
    return `${MAP_URLS[ name ]}${mapTheme}${mapType}?key=${MAPTILER_APIKEY}`;

}

// Get map style name list
export function getMapStyleList() {

    // Return map list
    return [
        { name: "Standard", value: "standard" },
        { name: "Basic", value: "basic" }, 
        { name: "Bright", value: "bright" }, 
        { name: "Outdoor", value: "outdoor" },
        { name: "Satellite", value: "satellite" },
        // { name: "Satellite v2", value: "satellite-v2" },
        { name: "Topo", value: "topo" },
        { name: "Vojager", value: "vojager" },
    ];

}

// Get path key from geolevel
export function getGeolevelKey(geolevel) {

    // Switch handler
    switch(geolevel) {

        // Nazione
        case 0:
            return "nazione";

        // Regione
        case 1:
            return "regione";

        // Provincia
        case 2:
            return "provincia";

        // Comune
        case 3:
            return "comune";

        // Square
        case 4:
            return "squareID";

        // Fallback
        default:
            return null;

    }

}

// Get path key from geolevel
export function getZoomFromGeolevel(geolevel) {

    // Switch handler
    switch(geolevel) {

        // Nazione
        case 0:
            return 3;

        // Regione
        case 1:
            return 6;

        // Provincia
        case 2:
            return 9;

        // Comune
        case 3:
            return 11;

        // Square
        case 4:
            return 13;

        // Device
        case 5:
            return 13;

        // Fallback
        default:
            return 0;

    }

}
