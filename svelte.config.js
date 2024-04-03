const sveltePreprocess = require('svelte-preprocess');

module.exports = {

    compilerOptions: {

        // If true, generates code that will work in IE9 and IE10
        // legacy: true

    },

    preprocess: [
        sveltePreprocess({
            scss: {
              includePaths: ['./src/theme'],
            },
        }),
    ],
};
