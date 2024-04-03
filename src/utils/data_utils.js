import { get } from "svelte/store";
import { userParameters } from "../store/user";

// Parameters list
export const PARAMETERS_LIST = [
    "aqi",
    "pm1",
    "pm2_5",
    "pm10",
    "voc",
    "no2",
    "co",
    "co2",
    "o3",
    "so2",
    "h2s",
    "temperatura",
    "umidita"
];

// Parameters blacklist
export const PARAMETERS_BLACKLIST = [
    "gas_resistance"
];

export default class DataUtils {
    static getName(type){
        switch (type) {
            case "aqi":
                return "AQI"
            case "risk":
                return "Risk";
            case "pm1":
                return "PM 1";
            case "pm2_5":
                return "PM 2.5";
            case "pm10":
                return "PM 10";
            case "no2":
                return "NO2";
            case "voc":
                return "VOC";
            case "co":
                return "CO";
            case "co2":
                return "CO2";
            case "so2":
                return "SO2";
            case "h2s":
                return "H2S";
            case "o3":
                return "O3";
            case "temperatura":
                return "Temperature";
            case "umidita":
                return "Humidity";
            case "pressione":
                return "Pressure";
            default:
                return type;
        }
    }

    static getId(type){
        switch (type) {
            case "AQI":
                return "aqi";
            case "Risk":
                return "risk"
            case "PM 1":
                return "pm1";
            case "PM 2.5":
                return "pm2_5";
            case "PM 10":
                return "pm10";
            case "NO2":
                return "no2";
            case "VOC":
                return "voc";
            case "CO":
                return "co";
            case "CO2":
                return "co2";
            case "SO2":
                return "so2";
            case "H2S":
                return "h2s";
            case "O3":
                return "o3";
            case "Temperature":
                return "temperatura";
            case "Humidity":
                return "umidita";
            default:
                return type;
        }
    }

    static getUnitMeasure(type, fallback="ug / m3"){
        switch (type) {
            case "aqi":
                return "%";
            case "risk":
                return "%";
            case "direzione_vento":
                return "";
            case "intensita_vento":
                return "m/s";
            case "temperatura":
                return "°C";
            case "umidita":
                return "%";
            case "co":
                return "mg/m^3";
            case "co2":
                return "ppm";
            case "pressione":
                return "hPa";
            default:
                return fallback;
        }
    }

    static getLimits(type){
        switch (type) {
            // 20, 50, 70, 90
            case "aqi":
                return {
                    max: 90,
                    high: 70,
                    middle: 50,
                    low: 20
                };
            case "risk":
                return {
                    max: 90,
                    high: 70,
                    middle: 50,
                    low: 20
                };
            // 2, 4, 6, 8
            case "pm1":
                return {
                    max:  8,
                    high: 6,
                    middle: 4,
                    low: 2
                };
            // 5, 15, 25, 35
            case "pm2_5":
                return {
                    max:  35,
                    high: 25,
                    middle: 15,
                    low: 5
                };
            // 10, 20, 30, 50
            case "pm10":
                return {
                    max:  50,
                    high: 30,
                    middle: 20,
                    low: 10
                };
            // 20, 60, 100, 200
            case "no2":
                return {
                    max:  200,
                    high: 100,
                    middle: 60,
                    low: 20
                };
            // 10, 20, 35, 50
            case "voc":
                return {
                    max:  50,
                    high: 35,
                    middle: 20,
                    low: 10
                };
            // 2, 4, 8, 10
            case "co":
                return {
                    max:  10,
                    high: 8,
                    middle: 4,
                    low: 2
                };
            case "co2":
                return {
                    max:  200000,
                    high: 50000,
                    middle: 4000,
                    low: 350
                };
            // 50, 100, 200, 350
            case "so2":
                return {
                    max:  350,
                    high: 200,
                    middle: 100,
                    low: 50
                };
            // 30, 60, 90, 120
            case "h2s":
                return {
                    max:  120,
                    high: 90,
                    middle: 60,
                    low: 30
                };
            // 50, 80, 180, 240
            case "o3":
                return {
                    max:  240,
                    high: 180,
                    middle: 80,
                    low: 50
                };
            // 5, 15, 25, 40
            case "temperatura":
                return {
                    max:  40,
                    high: 25,
                    middle: 15,
                    low: 5
                };
            // 20, 40, 60, 80
            case "umidita":
                return {
                    max:  80,
                    high: 60,
                    middle: 40,
                    low: 20
                };
            // 990, 1010, 1020, 1040
            case "pressione":
                return {
                    max:  1040,
                    high: 1020,
                    middle: 1010,
                    low: 990
                };
            default:
                return {
                    max: 90,
                    high: 70,
                    middle: 50,
                    low: 20
                };
        }
    }

    static getLegend(type) {
        switch (type) {        
            case "umidita":
                return ["#03a9f4", "#039be5", "#0288d1", "#0277bd", "#01579b"];
            case "pressione":
                return ["#1E90FF", "#4caf50", "#fdd835", "#FF6347", "#FF0000"];
            case "co2":
                return ["#4fc3f7", "#aed581", "#ffeb3b", "#f57c00", "#b71c1c"];
            default:
                return ["#4caf50", "#8BC34A", "#FFEB3B", "#FFC107", "#F44336"];
        }
    }

    static getColorRange(type) {

        let limits = DataUtils.getLimits(type);

        if(limits === null)
            return null;

        let colors = DataUtils.getLegend(type);

        return [0, colors[0], limits.low, colors[1], limits.middle, colors[2], limits.high, colors[3], limits.max, colors[4]];

    }

    static getTypes(){

        // Get parameters
        let ps = get( userParameters );

        return (Array.isArray(ps) && ps.length > 0 ? ps : PARAMETERS_LIST)?.filter?.((p) => !PARAMETERS_BLACKLIST.includes( p )) || [];
    }

    static getSources(filter=[]){
        return [
            {name: "Tutte", value: "all"}, 
            {name: "SSQ", value: "ssq"}, 
            {name: "EEA", value: "ARPA"}, 
            {name: "Copernicus", value: "CP"},
            {name: "Smart Park Milano", value: "SMPA"},
            {name: "Sensor Community", value: "SNSC"},
            {name: "Wiseair", value: "WISE"}
        ].filter(o => filter.length === 0 || (filter.length === 1 && filter[0] === "all") || o.value === "prediction" || filter.includes(o.value));
    }

    static getSourceName(key){
        switch (key) {
            case "ssq":
                return "SSQ";
            case "ARPA":
                return "EEA";
            case "CP":
                return "Copernicus";
            case "SMPA":
                return "Smart Park Milano";
            case "SNSC":
                return "Sensor Community";
            case "WISE":
                return "Wiseair";
            case "prediction":
                return "Prediction";
            default:
                return key;
        }
    }

    static getSourceId(name){
        switch (name) {
            case "SSQ":
                return "ssq";
            case "Arpa":
                return "ARPA";
            case "Copernicus":
                return "CP";
            case "Smart Park Milano":
                return "SMPA";
            case "Milano Smart Park":
                return "SMPA";
            case "Sensor Community":
                return "SNSC";
            case "Sensor":
                return "SNSC";
            default:
                return name;
        }
    }

    static getSourceReferenceUrl(key){
        switch (key) {
            case "ssq":
                return "https://www.sensesquare.eu";
            case "ARPA":
                return "https://it.wikipedia.org/wiki/Agenzia_regionale_per_la_protezione_ambientale";
            case "CP":
                return "https://www.copernicus.eu/it";
            case "SMPA":
                return "https://www.milanosmartpark.it/";
            case "SNSC":
                return "https://sensor.community/it/"
            default:
                return null;
        }
    }

    static getTypeColor(type){
        switch (type) {
            case "aqi":
                return "#f44336";
            case "pm1":
                return "#e91e63";
            case "pm2_5":
                return "#9c27b0";
            case "pm10":
                return "#673ab7";
            case "no2":
                return "#3f51b5";
            case "voc":
                return "#2196f3";
            case "co":
                return "#607d8b";
            case "so2":
                return "#ff5722";
            case "h2s":
                return "#795548";
            case "o3":
                return "#009688";
            default:
                return "#607d8b";
        }
    }

    static getDescription(type) {
        switch (type) {
            case "aqi":
                return "Gli inquinanti considerati nell'indice della qualità dell´aria sono quelli che hanno effetti a breve termine, ovvero il biossido di azoto (NO2) ed il particolato (PM10 o PM2.5 )";
            case "pm1":
                return "Polveri sospese con diametro medio di particella minore di 1µm";
            case "pm2_5":
                return "Polveri sospese con diametro medio di particella minore di 2.5µm";
            case "pm10":
                return "Polveri sospese con diametro medio di particella minore di 10µm";
            case "no2":
                return "Biossido di azoto";
            case "voc":
                return "Il VOC è indicativo della presenza di gas organici volatili";
            case "co":
                return "È una molecola formata da un atomo di carbonio ed uno di ossigeno, è un gas velenoso particolarmente insidioso in quanto inodore e insapore. Il monossido di carbonio viene prodotto da reazioni di combustione in difetto di aria";
            case "o3":
                return "È una molecola formata da tre atomi di ossigeno, ha un caratteristico odore agliaceo. È un inquinante secondario, ovvero prodotto per decomposizione di altre molecole, è molto velenoso se respirato a grandi dosi";
            default:
                return "";
        }
    }

    static getNote(type){
        switch (type) {
            case "aqi":
                return "All'aumentare della percentuale dell'Aqi la salubrità dell'aria diminuisce";
            case "pm1":
                return "La presenza di queste polveri sospese costituisce un serio problema sanitario, poichè riescono ad eludere la maggior parte delle barriere biologiche dell'apparato respiratorio";
            case "pm2_5":
                return "Il valore medio annuale di 25 µg/m³ non può essere superato nell'arco dell'anno";
            case "pm10":
                return "Il valore giornaliero di 50 µg/m³ non può essere superato più di 35 volte nell'arco dell'anno";
            case "no2":
                return "Il valore orario di 200 µg/m³ non può essere superato più di 18 volte nell'arco dell'anno";
            case "voc":
                return "Benzene, Toluene, Fenolo, etc.";
            case "co":
                return "Il valore massimo della media mobile calcolata sulle 8 ore non può superare i 10 mg/m³";
            default:
                return "";
        }
    }

    // Get source list in order
    static getSourceListMinimized(sources=[]) {

        // Top sources
        let topSources = [];

        // Bottom sources
        let bottomSources = [];

        // Iterate over sources
        sources.forEach(s => {

            // Check if sources are top class
            if(s === "Copernicus" || s === "Arpa" || s === "SSQ")
                topSources.push( s );
            else
                bottomSources.push( s );
        
        });

        // Check if there are top sources
        if(topSources.length > 0) {

            // Order top sources
            topSources.sort();

        }

        // Check if there are top sources
        if(topSources.length === 0 && bottomSources.length > 0) {

            // Add a source to top sources list
            topSources = [ bottomSources.shift() ];

        }

        // Check if bottom sources has sources
        if(bottomSources.length > 0)
            return [ ...topSources, "..." ];

        return topSources;

    }

}