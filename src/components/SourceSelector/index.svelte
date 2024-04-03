<script>

    import { createEventDispatcher, onDestroy } from 'svelte';
    import { dictionary, getDictionary } from '../../store/dictionary';
    import ToogleButton from '../ToogleButton.svelte';
    import PlaceSelector from '../PlaceSelector.svelte';
    import { user } from '../../store/user';
    import TextSelect from '../TextSelect.svelte';
    import NetworkUtils from '../../utils/network_utils';

    export let source = null;
    export let disabled = false;
    export let variant = true;
    export let mandatory = true;
    export let placeSelectorOptions = {};
    export let geolevel;
    
    // Dispatcher
    const dispatch = createEventDispatcher();

    // Dictionary handler
    let dict = null;
    const unsubscribeDictionary = dictionary.subscribe(val => dict = getDictionary( val ));

    // User handler
    let _user = null;
    const unsubscribeUser = user.subscribe(val => _user = val);

    // Source type
    let sourceType = source?.type || "place";

    // Text select reference
    let textSelectRef;

    // On component destroy
    onDestroy(() => {

        // Unsubscribe to dictionary update
        unsubscribeDictionary();

        // Unsubscribe to user update
        unsubscribeUser();

    });

    // Get device list
    async function getDeviceList(query) {

        // Init form data
        let p = new FormData();

        // Add token
        p.append("token", _user.token);

        // Add params
        p.append("alias", "True");

        // Add query if required
        if(query !== "")
            p.append("query", query);

        // Download device list
        let values = await NetworkUtils.getServerUtenti("elenco_centraline", {
            method: "POST",
            body: p
        });

        // Check response code
        if(values.response_code !== 200) {

            // Return fallback
            return [];

        }

        // Return result list
        return values.result.map(device => {

            // Return adaptation
            return { key: device.name, value: device.value };

        });

    }

    // Set source
    function setSource(newSource) {

        // Update source variable
        source = newSource;

        // Dispatch change event
        dispatch("change", newSource);

    }

</script>

<!-- Main container -->
<main>

    <!-- Check if geolevel is provided -->
    {#if typeof(geolevel) !== "number"}
    
        <!-- Toogle button -->
        <ToogleButton
            bind:selected={sourceType}
            options={[ { name: dict?.getString("place"), value: "place" }, { name: dict?.getString("device"), value: "device" } ]}
            disabled={disabled}
            {variant}
        />

    {/if}

    <!-- Switch between different selector -->
    {#if (sourceType === "place" && typeof(geolevel) !== "number") || (typeof(geolevel) === "number" && geolevel < 5)}

        <!-- Place selector container -->
        <div class="place-selector-container">

            <!-- Place selector -->
            <PlaceSelector
                classMap=""
                placeSelected={ source?.type === "place" ? source.value : null }
                on:change={({ detail }) => setSource({ type: "place", value: detail })}
                {mandatory}
                {geolevel}
                {...placeSelectorOptions}
            />

        </div>

    {:else if sourceType === "device" || geolevel === 5}

        <!-- Device selector container -->
        <div class="device-selector-container">

            <!-- Search -->
            <TextSelect
                bind:this={textSelectRef}
                placeholder={ dict?.getString("device") }
                value={ source?.type === "device" ? source.value : null }
                itemsAsync={getDeviceList}
                on:change={({ detail }) => setSource({ type: "device", value: { ...detail, name: detail.key } })}
                filled
            />

        </div>

    {/if}

</main>

<style>

    /* Place selector container */
    .place-selector-container {
        height: 200px;
        margin-top: 16px;
        border-radius: 6px;
        box-sizing: border-box;
        overflow: hidden;
        border: 1px solid var(--theme-dividers) !important;
    }

    /* Device selector container */
    .device-selector-container {
        padding-top: 24px;
    }

</style>