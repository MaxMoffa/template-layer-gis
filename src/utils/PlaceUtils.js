// Multiple name regex
const MULTIPLE_NAME_REGEX = /-\d+/;
const SQUARE_NAME_REGEX = /\d+:\d+/;

// Get place name
export function getPlaceName(path, geolevel) {

    // Init name
    let name = geolevel === 4 ? path[ getGeolevelKey( geolevel - 1 ) ] : path[ getGeolevelKey( geolevel ) ];

    // Check if is a Square
    if(geolevel === 4) {

        // Get grid position first index
        let posIndex = path[ getGeolevelKey( geolevel ) ].search(SQUARE_NAME_REGEX);

        // Check position index
        if(posIndex !== -1) {

            // Add grid position
            name += " " + path[ getGeolevelKey( geolevel ) ].substring( posIndex );

        }

    }

    // Remove multiple name indication
    name = name?.replace(MULTIPLE_NAME_REGEX, "");

    // Return string
    return name;

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