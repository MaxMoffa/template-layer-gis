export default {

    // Custom service worker
    srcDir: "./",
    filename: 'sw.js',
    strategies: 'injectManifest',

    // Assets included inside 
    includeAssets: ['favicon-16x16.png', 'favicon-32x32.png', 'mstile-150x150.png', 'favicon.ico', 'robots.txt', 'apple-icon-180x180.png', "safari-pinned-tab.svg"],
    
    // Override max file size to cache
    injectManifest: {
        maximumFileSizeToCacheInBytes: 2600000
    },

    // Workbox usage
    workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,png}']
    },

    // Web manifest
    manifest: {
        name: "Square",
        short_name: "Square",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        scope: "/",
        start_url: "/",
        version: "v2.0.2",
        last_update: "29/02/2024",
        icons: [  
            {
                src: "/media/icons/maskable/icon-48x48.png",
                sizes: "48x48",
                type: "image/png",
                purpose: "maskable"
            },
            {
                src: "/media/icons/maskable/icon-72x72.png",
                sizes: "72x72",
                type: "image/png",
                purpose: "maskable"
            },
            {
                src: "/media/icons/maskable/icon-96x96.png",
                sizes: "96x96",
                type: "image/png",
                purpose: "maskable"
            },
            {
                src: "/media/icons/maskable/icon-128x128.png",
                sizes: "128x128",
                type: "image/png",
                purpose: "maskable"
            },
            {
                src: "/media/icons/maskable/icon-192x192.png",
                sizes: "192x192",
                type: "image/png",
                purpose: "maskable"
            },
            {
                src: "/media/icons/maskable/icon-384x384.png",
                sizes: "384x384",
                type: "image/png",
                purpose: "maskable"
            },
            {
                src: "/media/icons/maskable/icon-512x512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "maskable"
            },
            {
                src: "/media/icons/maskable/maskable_icon.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "maskable"
            },  
            {
                src: "/media/icons/static/icon-48x48.png",
                sizes: "48x48",
                type: "image/png",
                purpose: "any"
            },
            {
                src: "/media/icons/static/icon-72x72.png",
                sizes: "72x72",
                type: "image/png",
                purpose: "any"
            },
            {
                src: "/media/icons/static/icon-96x96.png",
                sizes: "96x96",
                type: "image/png",
                purpose: "any"
            },
            {
                src: "/media/icons/static/icon-128x128.png",
                sizes: "128x128",
                type: "image/png",
                purpose: "any"
            },
            {
                src: "/media/icons/static/icon-192x192.png",
                sizes: "192x192",
                type: "image/png",
                purpose: "any"
            },
            {
                src: "/media/icons/static/icon-384x384.png",
                sizes: "384x384",
                type: "image/png",
                purpose: "any"
            },
            {
                src: "/media/icons/static/icon-512x512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "any"
            }
        ],
        shortcuts: [
            {
                "name": "Open weather",
                "short_name": "Weather",
                "url": "/weather",
                "icons": [
                    { "src": "/media/shortcuts_icons/weather.png", "sizes": "144x144" },
                ]
            },
            {
                "name": "Open GIS",
                "short_name": "GIS",
                "url": "/gis",
                "icons": [
                    { "src": "/media/shortcuts_icons/gis.png", "sizes": "144x144" },
                ]
            },
            {
                "name": "Open tools",
                "short_name": "Tools",
                "url": "/tools",
                "icons": [
                    { "src": "/media/shortcuts_icons/tools.png", "sizes": "144x144" },
                ]
            }
        ]
    }
}