export async function handleSaveFile(blob, suggestedName) {

    // Check if file system access is supported
    const supportsFileSystemAccess =

        // Check if API is available
        'showSaveFilePicker' in window 
        
        &&
        
        // Check if is not an iframe
        (() => {
            try {
                return window.self === window.top;
            } catch {
                return false;
            }
        })();

    // Check if file system access is supported
    if (supportsFileSystemAccess) {

        // Save file with dialog
        saveFileAs(blob, suggestedName);

    } else {

        // Download file
        downloadFile(blob, suggestedName);

    }

}

// Save file with file system dialog
export async function saveFileAs(blob, suggestedName) {

    // Show the file save dialog.
    const handle = await showSaveFilePicker({
        suggestedName,
    });

    // Write the blob to the file.
    const writable = await handle.createWritable();

    // Write blob
    await writable.write(blob);

    // Close writable
    await writable.close();

}

// Download file with old method
export async function downloadFile(blob, name) {

    // Create url to blob
    const blobURL = URL.createObjectURL(blob);

    // Create the `<a download>` element and append it invisibly.
    const a = document.createElement('a');

    // Append blob url
    a.href = blobURL;

    // Add name
    a.download = name;

    // Hide visibility
    a.style.display = 'none';

    // Append tag to document body
    document.body.append(a);

    // Programmatically click the element.
    a.click();

    // Revoke the blob URL and remove the element.
    setTimeout(() => {

        // Revoke url
        URL.revokeObjectURL(blobURL);

        // Remove a tag
        a.remove();

    }, 1000);

}