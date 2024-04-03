
// Load layer by id
export async function loadLayer(id) {

    // Load and return layer
    return (await import(`./${id}/index.js`)).default;

}