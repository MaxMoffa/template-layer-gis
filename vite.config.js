import { svelte } from '@sveltejs/vite-plugin-svelte';
import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vite';
import manifest from './manifest';

export default defineConfig(env => ({

    // Handle basepath
    // base: env.mode === 'production' ? './' : '/',

    // Build options
    build: {

        // Output directory
        outDir: "build/web"
    
    },
    
    // Local server options
    server: {

        // Local server port
        port: 9001,

    },
    
    // Plugins
    plugins: [

        // PWA plugin for vite
        VitePWA(manifest),

        // Svelte options
        svelte({
            disableDependencyReinclusion: ['@roxi/routify'],
            // experimental: {
            //     dynamicCompileOptions({ filename, compileOptions }) {
            //         return { hydratable: true };
            //     }
            // }
        })

    ]
        
}));
