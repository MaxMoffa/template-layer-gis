<script>
    import { beforeUrlChange } from "@roxi/routify";
    import { onMount } from "svelte";
    import LangUtils from "../utils/lang_utils";
    import LoadingScreen from "./LoadingScreen.svelte";
    import { dictionary, getUserLang } from '../store/dictionary';
    import moment from 'moment';

    $beforeUrlChange(changePage);

    // General dictionary
    let generalDictionary = null;

    // Page dictionar
    let pageDictionary = true;

    // On DictDog mount
    onMount(() => {

        // User lang
        let userLang = getUserLang();

        // Load general dictionary
        Promise.all([loadGeneralDictionary(), loadPageDictionary(), importMomentLocale(userLang)])
        .then(([generalDict, pageDict]) => {

            // Set moment locale
            moment.locale( userLang );

            // Update general dictionary
            generalDictionary = generalDict;

            // Update dictionare store
            dictionary.set(generalDict);

            // Update page dictionary
            pageDictionary = pageDict;

        });

    });

    // Load the general dictionary
    async function loadGeneralDictionary() {

        // Try to import the general dictionary
        try {

            // Import index
            let index = (await import(`../pages/generalLang/index.json`)).default;

            // Select dictionary
            if(index.includes(getUserLang()))
                return (await import(`../pages/generalLang/${getUserLang()}.json`)).default;

            // Fallback language
            if(index.length > 0)
                return (await import(`../pages/generalLang/${index[0]}.json`)).default;

            // Fallback
            return true;

        } catch (error) {

            // Log error
            // console.log("DictDog", error);

            // Fallback
            return true;

        }

    }

    // Load the dictionary for the page
    async function loadPageDictionary(path=window.location.pathname) {

        // Page
        let page = "";

        // Check if is index
        if(path === "/" || path === "index" || path === "/index") {

            // Update page
            page = "_index";

        } else {

            // Folders
            let folders = path.split("/");

            // Check first
            if(folders[0]) {

                // Update page
                page = folders[0];

            } else {

                // Update page
                page = folders[1];

            }

        }

        // Try to import a dictionary for the page
        try {

            // Import index
            let index = (await import(`../pages/${page}/lang/index.json`)).default;

            // Select dictionary
            if(index.includes(getUserLang()))
                return (await import(`../pages/${page}/lang/${getUserLang()}.json`)).default;

            // Fallback language
            if(index.length > 0)
                return (await import(`../pages/${page}/lang/${index[0]}.json`)).default;

            // Fallback
            return true;

        } catch (error) {

            // Log error
            console.log("DictDog", error);

            // Fallback
            return true;

        }

    }

    // Change page
    async function changePage(event, route) {

        console.log({ route, event });

        // Load page dictionary
        let dictionary = await loadPageDictionary(route.path);

        // Update page dictionary
        pageDictionary = dictionary;

        // Load page
        return true;

    }

    function getDictionary() {

        // Setup dictionary
        let dict = new LangUtils(getUserLang(), {});

        // Check if general dictionary is compatible
        if(typeof(generalDictionary) !== "boolean")
            dict.addDictionary(generalDictionary);

        // Check if page dictionary is compatible
        if(typeof(pageDictionary) !== "boolean")
            dict.addDictionary(pageDictionary);

        console.log({ generalDictionary, pageDictionary });
        
        return dict;

    }

    // Import moment locale
    async function importMomentLocale(lang) {

        // Switch based on lang
        switch(lang) {

            case "it":
                await import("moment/dist/locale/it");
                break;

            default:
                break;

        }

    }

</script>

<!-- Check if general dictionary and page dictionary are ready -->
{#if generalDictionary && pageDictionary}

    <!-- Page -->
    <slot 
        getDictionary={getDictionary}
    />

{/if}

<!-- Loading screen -->
<LoadingScreen active={!generalDictionary || !pageDictionary} />