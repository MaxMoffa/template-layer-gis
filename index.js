
// Imports for electron
const { app, BrowserWindow } = require("electron");
const path = require("path");

// Boolean if is development mode
const isDev = process.env.IS_DEV === 'true';

app.on("ready", () => {

    // Open browser window
    const mainWindow = new BrowserWindow({
        // titleBarStyle: 'hidden',
        // titleBarOverlay: {
        //   color: '#2f3241',
        //   symbolColor: '#74b1be',
        //   height: 32
        // }
    });

    // Check if is dev mode
    if (isDev) {

        //TODO: Load build file
        // mainWindow.loadFile(path.join(__dirname, "/build/web/index.html"));

        // Load window in dev mode (using localhost)
        mainWindow.loadURL('http://localhost:9001');

        // Open dev tools
        mainWindow.webContents.openDevTools();

    } else {

        //TODO: Load build file
        // mainWindow.loadFile(path.join(__dirname, "/build/web/index.html"));

        // Load window in dev mode (using localhost)
        mainWindow.loadURL('https://square.sensesquare.eu');

    }

});