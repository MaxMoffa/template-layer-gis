<script>
    import { Button, Divider, TextField, ProgressCircular, Select, Subheader, Checkbox, Icon, Slider } from "svelte-materialify/src";
    import { createEventDispatcher } from "svelte";
    import LangUtils from '../../utils/lang_utils';
    import TextSelect from "../TextSelect.svelte";
    import { theme, getColor } from '../../store/theme';
    import PlaceSelector from "../PlaceSelector.svelte";
    import DateSelector from "../DateSelector.svelte";
    import ToogleButton from "../ToogleButton.svelte";
    import SourceSelector from '../SourceSelector/index.svelte';

    export let state = null;
    export let configuration = null;
    export let dict = new LangUtils("en", {});
    export let apikey = null;
    export let token = null;

    const dispatch = createEventDispatcher();

    // Theme
    let _theme = "light";
    let unsubscribeTheme = theme.subscribe(val => _theme = val);

    // Fallback and invalid values
    const STRING_FALLBACK = "Unknown";
    const OPTION_FALLBACK = "errorOption";
    const OPTION_NOT_VALID = "notValidOption";

    // Get string translated or fallback
    function getTranslatedString(s) {

        // Check if 's' is a valid string
        if(!s || typeof(s) !== "string")
            return STRING_FALLBACK;

        // Return string
        return dict.getString(s);

    }

    // Get select options
    function getSelectOptions(options) {

        // Check options
        if(!options || !Array.isArray( options ))
            return [];

        // Return map
        return options.map(option => {

            // Check is a string
            if(typeof(option) === "string")
                return getTranslatedString( option );

            // Object map
            return { name: getTranslatedString( option?.name ), value: option?.value }

        });

    }

    /* Load final option */
    async function loadOption(option) {

        try {

            // Disabled function fallback
            const disabled = option?.disabled || (() => false);
            
            // Switch between option types
            switch(option?.type) {

                // Select
                case "select": {
                    return {
                        ...option,
                        disabled,
                        name: getTranslatedString(option?.name),
                        options: getSelectOptions( option?.options ),
                    };
                };


                // Select multiple
                case "select_multiple": {
                    return {
                        ...option,
                        disabled,
                        type: "select",
                        multiple: true,
                        name: getTranslatedString(option?.name),
                        options: option?.options.map(({name, value}) => {return { name: getTranslatedString(name), value }}),
                    };
                };

                // Select async
                case "select_async": {
                    return {
                        ...option,
                        disabled,
                        type: "select",
                        name: getTranslatedString(option?.name),
                        options: [ ...getSelectOptions( option?.options ), ...await getAsyncSelect(option.url, option.map) ]
                    };
                };

                // Checkbox
                case "checkbox": {
                    return {
                        ...option,
                        disabled,
                        name: getTranslatedString(option?.name),
                    };
                };

                // Search
                case "search": {
                    return {
                        ...option,
                        disabled,
                        name: getTranslatedString(option?.name),
                    };
                };

                // Place selector
                case "place": {
                    return {
                        ...option,
                        disabled,
                        name: getTranslatedString(option?.name),
                    };
                };

                // Date selector
                case "date": {
                    return {
                        ...option,
                        disabled,
                        name: getTranslatedString(option?.name),
                    };
                };

                // Text
                case "text": {
                    return {
                        ...option,
                        disabled,
                        name: getTranslatedString(option?.name),
                    };
                };

                // Toogle button
                case "toogleButton": {
                    return {
                        ...option,
                        disabled,
                        name: getTranslatedString(option?.name),
                        options: option?.options.map(element => {
                            return { name: getTranslatedString(element.name), value: element.value }
                        })
                    };
                };

                // Source selector
                case "source": {
                    return {
                        ...option
                    };
                };

                // Slider
                case "slider": {
                    return {
                        ...option,
                        disabled,
                        name: getTranslatedString(option?.name),
                    };
                };

                // Invalid option
                default: {
                    return {
                        type: OPTION_NOT_VALID
                    };
                };

            }

        } catch (e) {

            console.error(e);
            return {
                type: dict.getString(OPTION_FALLBACK)
            };
            
        }

    }

    /* Load final configuration */
    async function loadConfiguration(configuration) {

        // Check if configuration is valid
        if(!configuration || !Array.isArray(configuration))
            throw Error("Configuration not valid");

        // Final configuration
        let finalConfiguration = [];

        try {

            // Iterate over sections
            for (const section of configuration) {

                // Final section
                let finalSection = {
                    name: getTranslatedString(section?.name),
                    options: []
                };

                // Load options
                for (const option of section.options)
                    finalSection.options = [...finalSection.options, await loadOption(option, state)];

                // Push loaded section
                finalConfiguration = [...finalConfiguration, finalSection];

            }
            
        } catch (e) {
            
            // Generic configuration error
            console.error(e);
            throw Error("Configuration error");

        }

        // Return loaded configuration
        return finalConfiguration;

    }

    // Prepare the formdata object
    function getParams() {
        let params = new FormData();
        if(apikey)
            params.append("apikey", apikey);
        else
            params.append("token", token);
        return params;
    }

    // Prepare the async select
    async function getAsyncSelect(url, map) {
        let params = getParams();
        let result = await (await (fetch(url, {method: "POST", body: params}))).json();
        console.log({ result });
        if(typeof(map) === "function")
            return result.result.map(map);
        return result.result;
    }

    // Update the configurator of a change
    function update() {
        dispatch("change", state);
    }

</script>

<!-- Configuration list -->
<main class="pb-16">

        <!-- Load final configuration -->
        {#await loadConfiguration(configuration)}
        
            <!-- Loading -->
            <div class="d-flex align-center justify-center pt-16 pb-16">
                <ProgressCircular color="primary-color" indeterminate />
            </div>

        {:then result} 

            <!-- Sections -->
            {#each result as section, i}

                <!-- Divider if there are multiple sections -->
                {#if i > 0}
                    <Divider />
                {/if}

                <!-- Section title -->
                <div class="sticky-subheader">
                    <Subheader class="{getColor(_theme)}">
                        {section.name}
                    </Subheader>
                </div>

                <!-- Section options -->
                {#each section.options as option}

                    <!-- List item -->
                    <div class="list-item">

                        <!-- Check if is not valid -->
                        {#if !state.hasOwnProperty(option?.key) || option.type === OPTION_NOT_VALID}
                        
                            <!-- Option not valid -->
                            {dict.getString(OPTION_NOT_VALID)}
                            
                        {:else if option.type === "select"}

                            <!-- Select -->
                            <Select disabled={option.disabled(state)} on:change={update} filled bind:value={state[option.key]} items={option.options} mandatory multiple={option?.multiple}>
                                {option.name}
                            </Select>

                        {:else if option.type === "checkbox"}

                            <!-- Checkbox -->
                            <Checkbox disabled={option.disabled(state)} on:change={update} color="primary" bind:checked={state[option.key]}>
                                {option.name}
                            </Checkbox>

                        {:else if option.type === "search"}

                            <!-- Search -->
                            <TextSelect
                                placeholder={option.name}
                                filled
                                bind:value={state[option.key]}
                                on:change={update}
                                itemsAsync={option.getOptions}
                                {getParams}
                            />

                        {:else if option.type === "place"}
                                                            
                            <!-- Place selector -->
                            <div class="map-widget-options rounded">
                                <PlaceSelector
                                    classMap="rounded elevation-1"
                                    bind:placeSelected={state[option.key]}
                                    on:change={update}
                                    geolevel={option?.selectCity ? 3 : undefined}
                                />
                            </div>

                        {:else if option.type === "date"}

                            <!-- Date selector -->
                            <DateSelector
                                label={option.name}
                                date 
                                disabled={option.disabled(state)}
                                bind:value={state[option.key]}
                                on:change={update} 
                                acceptString={option.hasOwnProperty("acceptString") ? option.acceptString : false}
                            />

                        {:else if option.type === "text"}

                            <!-- Text -->
                            <TextField 
                                filled 
                                bind:value={state[option.key]}
                                on:change={update} 
                                {...option.options}
                            >
                                {option.name}
                            </TextField>

                        {:else if option.type === "toogleButton"}

                            <!-- Toogle button -->
                            <ToogleButton
                                bind:selected={state[option.key]}
                                options={option.options}
                                on:change={update} 
                                disabled={option?.disabled?.(state)}
                                variant
                            />

                        {:else if option.type === "source"}

                            <!-- Source selector -->
                            <SourceSelector 
                                bind:source={state[option.key]}
                                on:change={update}
                                disabled={option?.disabled?.(state)}
                            />

                        {:else if option.type === "slider"}

                            <!-- Slider selector -->
                            <Slider 
                                bind:value={state[option.key]}
                                on:change={update}
                                step={10}
                            >
                                {option.name}
                            </Slider>

                        {/if}

                    </div>
                    
                {/each}

            {/each}
            
        {:catch e}

            <!-- Error message -->
            {e.message}
            
        {/await}

</main>

<style>

    /* Configuration list */
    main {
        width: 100%;
        height: auto;
    }

    /* List item */
    .list-item {
        padding: 12px 16px;
    }

    /* Map place selector */
    .map-widget-options {
        height: 300px !important;
    }

</style>