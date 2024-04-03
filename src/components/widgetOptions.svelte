<script>
    import { onDestroy, onMount } from 'svelte';
    import { Checkbox, Col, Select, Chip, Subheader, AppBar, TextField, Overlay, ListItem, List } from 'svelte-materialify/src';
    import Wapper from "./Wrapper/Wrapper.svelte";
    import PlaceSelector from './PlaceSelector.svelte';
    import { createEventDispatcher } from 'svelte';
    import DateSelector from './DateSelector.svelte';
    import TextSelect from './TextSelect.svelte';
	import LangUtils from '../utils/lang_utils';
    import { theme, getBackground, getColor } from '../store/theme';

    let _theme = "light";
    let unsubscribeTheme = theme.subscribe(val => _theme = val);

	const dispatch = createEventDispatcher();

    export let widget = null;
    export let name = "Widget Name";
    export let state = null
    export let configuration = [];
    export let token = null;
    export let apikey = null;
    export let background = "#ffffff";
	export let widgetId = null;
    export let dictionary = new LangUtils("en", {});

    let reloadWidgetOptions = true;
    let reloadWidget = true;
    let old_state = {...state};
    let shadowHeader = "elevation-0";
    let lastScrollTop = 0;
    let optionContainer;

    let dict = null;

    // Variables
    let search_showOptions = true;

    onMount(async () => {


		// Load dictionary
		if(widgetId)
			dict = getDictionary(await loadDictionary(widgetId, dictionary.getLang()));
		else
			dict = getDictionary(null);

        if(state === null){
            state = {};
            configuration.forEach(section => {
                section.options.forEach(element => {
                    state[element.key] = null;
                });
            });
        }

        if(state && typeof(state) === "object" && !state.hasOwnProperty("_timer_refresh"))
            state._timer_refresh = -1;

    });

    onDestroy(() => {
        unsubscribeTheme();
    });

    async function loadDictionary(id, lang) {
		try {

            // Import index
            let index = (await import(`../widgets/${id}/lang/index.json`)).default;

            // Select dictionary
            if(index.includes(lang))
                return (await import(`../widgets/${id}/lang/${lang}.json`)).default;

            // Fallback language
            if(index.length > 0)
                return (await import(`../widgets/${id}/lang/${index[0]}.json`)).default;

            return true;

        } catch (error) {

            // console.log(error);
            return true;
        
        }
	}

	function getDictionary(dict=null) {
        if(dict && typeof(dict) === "object")
            return new LangUtils(dictionary.getLang(), dict);
        return new LangUtils(dictionary.getLang(), {});
    }

    function reload(reloadOptions = true) {
        
        // Verify changes
        let isChanged = false;
        Object.keys(old_state).forEach(key => {
            isChanged = isChanged || old_state[key] !== state[key];
        });

        if(!isChanged)
            return;
        else
            old_state = {...state};
        
        // Reload widget
        setTimeout(() => {
            reloadWidget = false;
            setTimeout(() => {
                reloadWidget = true;
            }, 500);
        }, 0);

        // Reload widget options
        if(!reloadOptions)
            return;
        setTimeout(() => {
            reloadWidgetOptions = false;
            setTimeout(() => {
                reloadWidgetOptions = true;
                setTimeout(() => {
                    console.log(lastScrollTop);
                    optionContainer.scrollTop = lastScrollTop;
                    console.log(optionContainer);
                }, 0);
            }, 0);
        }, 0);
    }

    function saveState() {
        console.log("SAVE STATE");
        dispatch("saveState", state);
    }

    function getParams() {
        let params = new FormData();
        if(apikey)
            params.append("apikey", apikey);
        else
            params.append("token", token);
        return params;
    }

    async function getAsyncSelect(url, map) {
        let params = getParams();
        let result = await (await (fetch(url, {method: "POST", body: params}))).json();
        if(map && typeof(map) === "function")
            return result.result.map(map);
        return result.result;
    }

    function isDisabled(option) {
        if(option.hasOwnProperty("disabled") && typeof(option.disabled) === "function")
            return option.disabled(state);
        return false;
    }
    
    function updateShadow(e) {
        let scrollTop = e.target.scrollTop;
        lastScrollTop = scrollTop !== 0 ? scrollTop : lastScrollTop;
        if(scrollTop === 0)
            shadowHeader = "elevation-0"
        else
            shadowHeader = "elevation-1"
    }

    function getOptionsSelect(options) {
        options.forEach(i => {
            i.name = dict.getString(i.name);
        });
        return options;
    }

    function overlayClick(e) {
        if(typeof(e.target.className) === "string" && e.target.className.includes("overlay-background"))
            dispatch("close");
    }

    function hide(option) {
        if(option.hasOwnProperty("hide"))
            return option.hide(state);
        if(state.hasOwnProperty("_hide"))
            return state._hide.includes(option.key);
        return false;
    }

</script>


<main>

    <Overlay absolute color="{getBackground(_theme)}" on:click={overlayClick}>

        <div class="overlay-background">
    
            <div class="container rounded-lg elevation-5 {getColor(_theme)}" style={widget === null ? "width: 100% !important; height: 100% !important; border-radius: 0" : ""}>
    
                {#if widget !== null}
        
                    <div class="preview">
        
                        <div class="title">
        
                            <span>
                                {name}
                            </span>
        
                        </div>
        
                        <div class="widget">
        
                            <div class="widget-container elevation-1 rounded-sm">
        
                                {#if reloadWidget}
                                
                                    <Wapper 
                                        {widgetId}
                                        lang={dictionary.getLang()}
                                        {widget}
                                        state={JSON.parse(JSON.stringify(state))}
                                        {apikey}
                                        {token}
                                        showOptions={false}
                                    />
        
                                {/if}
        
                            </div>
        
                        </div>
        
                    </div>
                
                {/if}
        
                <div class="options {getBackground(_theme)}" style={widget === null ? "border-radius: 0" : ""}>
        
                    <AppBar class="{shadowHeader} {getBackground(_theme)}" style="background-color: #eeeeee; height: fit-content; flex: 0">
                        <span slot="title">
                            {#if widget === null}
                                {name}
                            {/if}
                        </span>
                        <div style="flex-grow:1" />
                        <Chip class="blue white-text" on:click={saveState} link>
                            Save
                        </Chip>
                    </AppBar>
        
                    <div class="options" bind:this={optionContainer} on:scroll={updateShadow}>
        
                        <Col>
        
                            {#if reloadWidgetOptions && dict}
                                
                                {#if configuration && Array.isArray(configuration)}
                                
                                    {#each configuration as section}
            
                                        <div class="section-options {getColor(_theme)}">
            
                                            {#if section.hasOwnProperty("name") && section.name}

                                                <Subheader>
                                                    {dict.getString(section.name)}
                                                </Subheader>

                                            {/if}
            
                                            <div class="options-container">
                                    
                                                {#each section.options as option}
                                                                    
                                                    {#if state !== null && !hide(option) && Object.hasOwnProperty.bind(state)(option.key)}
            
                                                        <div class="option-list-element">
                                                    
                                                            {#if option.type === "select"}
                                                            
                                                                <div class="text-subtitle-1 grey-text text-darken-1">
                                                                    {dict.getString(option.name)}
                                                                </div>
            
                                                                <Select disabled={isDisabled(option)} items={getOptionsSelect(option.options)} bind:value={state[option.key]} on:change={() => {
                                                                    if(option.hasOwnProperty("change"))
                                                                        option.change(state);
                                                                    reload();
                                                                }}>
                                                                </Select>
            
                                                            {:else if option.type === "checkbox"}
            
                                                                <Checkbox disabled={isDisabled(option)} color="accent" checked={state[option.key]} on:change={(e) => {
                                                                    state[option.key] = e.target.checked;
                                                                    reload();
                                                                }}>
                                                                    {dict.getString(option.name)}
                                                                </Checkbox>
            
                                                            {:else if option.type === "date"}
            
                                                                <div class="text-subtitle-1 grey-text text-darken-1">
                                                                    {dict.getString(option.name)}
                                                                </div>
            
                                                                <DateSelector
                                                                    date 
                                                                    disabled={isDisabled(option)}
                                                                    bind:value={state[option.key]}
                                                                    on:change={(e) => {                                                                 
                                                                        // let d = typeof(e.detail) === "string" ? e.detail : e.detail.getTime();              
                                                                        // state[option.key] = d;
                                                                        console.log("reload");
                                                                        console.log(state);
                                                                        
                                                                        reload();
                                                                    }} 
                                                                    acceptString={option.hasOwnProperty("acceptString") ? option.acceptString : false}
                                                                />
            
                                                            {:else if option.type === "date_async"}
            
                                                                <div class="text-subtitle-1 grey-text text-darken-1">
                                                                    {dict.getString(option.name)}
                                                                </div>
            
                                                                <Select items={["Oggi", "Ieri", "Personalizzata"]} on:change={(e) => {
                                                                    if(typeof(state[option.key]) !== "object")
                                                                        state[option.key] = {type: null, value: null, valueNumeric: null}
                                                                    state[option.key].type = e.detail !== [] ? e.detail : null;
                                                                    if(e.detail === "Ieri")
                                                                        state[option.key].value = () => {
                                                                            let d = new Date();
                                                                            d.setDate(d.getDate()-1);
                                                                            return d.getTime();
                                                                        }
                                                                    else if(e.detail === "Oggi")
                                                                        state[option.key].value = () => new Date().getTime();
                                                                    else
                                                                        state[option.key].value = () => state[option.key].valueNumeric;
            
                                                                }}></Select>
                                                                {#if state[option.key].type === "Personalizzata"}
                                                                    <DateSelector
                                                                        date 
                                                                        disabled={isDisabled(option)}
                                                                        value={state[option.key].valueNumeric ? new Date(state[option.key]) : null}
                                                                        on:change={(e) => {                                   
                                                                            state[option.key].valueNumeric = e.detail.getTime();
                                                                            reload();
                                                                        }} 
                                                                    />
                                                                {/if}
            
                                                            {:else if option.type === "select_async"}
            
                                                                <div class="text-subtitle-1 grey-text text-darken-1">
                                                                    {dict.getString(option.name)}
                                                                </div>
            
                                                                {#await getAsyncSelect(option.url, option.map)}
                                                                    ...
                                                                {:then options} 
            
                                                                    <Select disabled={isDisabled(option)} items={options} bind:value={state[option.key]} on:change={reload}>
                                                                    </Select>
            
                                                                {/await}
            
                                                            {:else if option.type === "select_multiple"}
                                                            
                                                                <div class="text-subtitle-1 grey-text text-darken-1">
                                                                    {dict.getString(option.name)}
                                                                </div>
            
                                                                <Select disabled={isDisabled(option)} multiple items={getOptionsSelect(option.options)} bind:value={state[option.key]} on:change={reload}>
                                                                </Select>
            
                                                            {:else if option.type === "place"}
                                                            
                                                                <div class="text-subtitle-1 grey-text text-darken-1">
                                                                    {dict.getString(option.name)}
                                                                </div>
            
                                                                <div class="map-widget-options rounded">
                                                                    <PlaceSelector
                                                                        bind:placeSelected={state[option.key]}
                                                                        params={getParams()} 
                                                                        on:change={() => reload(false)}
                                                                    />
                                                                </div>
            
                                                            
                                                            {:else if option.type === "text"}
                                                            
                                                                <div class="text-subtitle-1 grey-text text-darken-1">
                                                                    {dict.getString(option.name)}
                                                                </div>
            
                                                                <TextField 
                                                                    filled 
                                                                    bind:value={state[option.key]}
                                                                    {...option.options}
                                                                />
            
                                                            {:else if option.type === "search"}
                                                            
                                                                <div class="text-subtitle-1 grey-text text-darken-1">
                                                                    {dict.getString(option.name)}
                                                                </div>
            
                                                                <div style="width: 100%">
                                                                    <TextSelect
                                                                        filled
                                                                        bind:value={state[option.key]}
                                                                        on:change={() => reload(false)}
                                                                        itemsAsync={option.getOptions}
                                                                        {getParams}
                                                                    />
                                                                </div>
            
                                                            {/if}
            
                                                        </div>
            
                                                    {/if}
            
                                                {/each}
                                            
                                            </div>
            
                                        </div>
            
                                    {/each}

                                {/if}
        
                                <div class="section-options {getColor(_theme)}">
        
                                    <Subheader>
                                        {dictionary.getString("additionalOptions")}
                                    </Subheader>
        
                                    <div class="options-container">
        
                                        {#if state.hasOwnProperty("_timer_refresh")}
                                        
                                            <div class="option-list-element">
        
                                                <div class="text-subtitle-1 grey-text text-darken-1">
                                                    {dictionary.getString("automaticRefresh")}
                                                </div>
        
                                                <Select items={[
                                                    {name: dictionary.getString("disabled"), value: -1},
                                                    {name: dictionary.getString("everyMinutes"), value: 60 * 1000 * 1},
                                                    {name: dictionary.getString("every5Minutes"), value: 60 * 1000 * 5},
                                                    {name: dictionary.getString("every10Minutes"), value: 60 * 1000 * 10},
                                                    {name: dictionary.getString("every15Minutes"), value: 60 * 1000 * 15},
                                                ]} bind:value={state._timer_refresh} on:change={reload}>
                                                </Select>
        
                                            </div>
        
                                        {/if}
        
                                    </div>
        
                                </div>
        
                            {/if}
            
                        </Col>
        
                    </div>
        
                </div>
        
            </div>
    
        </div>
    
    </Overlay>

</main>


<style>

    main {
        z-index: 1006;
        position: fixed;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        pointer-events: none;
    }

    .overlay-background {
        position: fixed;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        display: grid;
        place-items: center;
    }

    .container {
        width: 80% !important;
        height: 80% !important;
        display: flex;
        flex-direction: row;
        overflow: hidden;
    }

    .container > .preview {
        flex: 3;
        display: flex;
        flex-direction: column;
        padding: 0 32px;
    }

    .container > .preview > .title {
        flex: 1;
        display: grid;
        align-items: center;
    }

    .container > .preview > .widget {
        flex: 9;
        display: grid;
        place-items: center;
    }

    .container > .options {
        flex: 2.5;
        display: flex;
        flex-direction: column;
    }

    .container > .options > .options {
        flex: 1;
        overflow-y: auto;
        padding: 0 6px;
        flex-basis: 0;
    }

    .widget-container {
        height: 500px;
        width: 100%;
        max-width: 600px;
        padding: 8px;
        overflow: auto;
        transform: translateZ(0);
        border: 1px solid #666;
    }

    .section-options {
        width: 100%;
        height: auto;
        padding: 6px 4px;
        border-radius: 12px;
        margin-bottom: 16px;
    }

    .section-options > .options-container {
        padding: 16px 20px;
    }

    .option-list-element {
        padding: 12px 0;
    }

    .option-list-element > * {
        width: 100%;
    }

    .option-list-element > .map-widget-options {
        height: 300px !important;
    }

    :global(.s-menu__wrapper) {
        width: 100%;
    }

    @media screen and (max-width: 1350px) {

        .container {
            width: 90% !important;
            height: 90% !important;
        }

    }

</style>