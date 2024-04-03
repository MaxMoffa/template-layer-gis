<script>

    import { ListItem, TextField } from 'svelte-materialify/src';
    import { createEventDispatcher, onDestroy } from 'svelte';
    import { getBackground, theme } from '../store/theme';
    const dispatch = createEventDispatcher();

    export let value = null;
    export let placeholder = "";
    export let items = [];
    export let itemsAsync = async (q) => {
        return items.filter(i => {
            if(typeof(i) === "string")
                return i.toLowerCase().includes(q.toLowerCase());
            else if(typeof(i) === "object" && i.hasOwnProperty("key"))
                return i.key.toLowerCase().includes(q.toLowerCase());
            return false;
        });
    };
    export let disabled = false;
    export let getParams = () => new FormData();
    export let dense = true;
    export let outlined = false;
    export let filled = false;
    export let solo = false;
    export let mandatory = true;

    // Theme update
    let _theme = "light";
    let unsubscribeTheme = theme.subscribe(val => _theme = val);

    let _value = "";
    let oldValue = value;
    if(value !== null) {
        if(typeof(value) === "string" && value)
            _value = value;
        else if(typeof(value) === "object" && value.hasOwnProperty("key") && value.key)
            _value = value.key;
    }

    let showSuggestion = false;
    let input;

    $: _value, detectClear();

    // On component destroy
    onDestroy(() => {

        // Unsubscribe to theme update
        unsubscribeTheme();

    });

    function changeValue() {
        let isReady = false;
        if(_value)
            items.forEach(i => {
                if(typeof(i) === "string" && i.toLowerCase() === _value.toLowerCase()){
                    value = _value = i;
                    isReady = true;
                } else if((i.hasOwnProperty("key") && (i.key.toLowerCase() ===_value.toLowerCase())) || (i.hasOwnProperty("name") && (i.value.toLowerCase() ===_value.toLowerCase())) ) {
                    value = i;
                    _value = i.name;
                    isReady = true;
                }

            });
            
        if(isReady){
            oldValue = value;
            input.blur();
            showSuggestion = false;
            dispatch("change", value);
            return;
        }
        showSuggestion = true;
    }

    function clickOutside(e) {
        let classClick = e.relatedTarget;
        if(classClick){
            classClick = classClick.className;
        }
        if(typeof(classClick) !== "string"){
            if(oldValue && mandatory){
                if(typeof(oldValue) === "string"){
                    _value = value = oldValue;
                }else if(oldValue.value){
                    _value = oldValue.key;
                    value = oldValue;
                }
            }
            showSuggestion = false;
            return;
        }
        if(!classClick.includes("s-list-item")){
            if(oldValue){
                if(typeof(oldValue) === "string"){
                    _value = value = oldValue;
                }else if(oldValue.value){
                    _value = oldValue.key;
                    value = oldValue;
                }
            }
            showSuggestion = false;
        }
    }

    function detectClear() {
        if(!_value && oldValue){
            _value = "";
            value = null;
            if(input)
                input.focus();
        }
    }

    function setValue(v="", val=null) {
        // if(_value === v && (value === v || value === val))
        //     return;
        _value = v;
        value = val !== null ? val : v;            
        if(!v)
            value = null;
        dispatch("change", value);
        if(value){
            oldValue = value;
            showSuggestion = false;
            input.blur();
        }
    }

</script>

<main>
    <div class="selectorContent">

        <TextField 
            disabled={disabled}
            on:blur={clickOutside} 
            on:keyup={changeValue} 
            bind:value={_value}
            bind:inputElement={input}
            on:focus={() => {
                showSuggestion = true;
            }}
            clearable={value !== null}
            {outlined}
            {filled}
            {solo} 
        >
            {placeholder}
        </TextField>
    
    </div>
        {#if showSuggestion}
            <div class="elevation-2 list {getBackground(_theme)}">
                {#await itemsAsync(_value, getParams())}
                    <ListItem link {dense} class="text-center">
                        ...
                    </ListItem>
                {:then items}
                    {#if Array.isArray(items) && items.length > 0}
                        {#each items as i}
                            {#if typeof(i) === "string"}
                                <ListItem link {dense} on:click={() => setValue(i)}>
                                    {i}
                                </ListItem>
                            {:else}
                                <ListItem link {dense} on:click={() => setValue(i?.key || i?.name, i)}>
                                    {i?.key || i?.name}
                                </ListItem>
                            {/if}
                        {/each}
                    {:else}
                        <ListItem link {dense} class="text-center" on:click={() => showSuggestion = false}>
                            Nessun risultato
                        </ListItem>
                    {/if}     
                {:catch e}
                    <ListItem link {dense} class="text-center" on:click={() => showSuggestion = false}>
                        Ops! Sembra esserci un problema
                    </ListItem>
                {/await}
            </div>
        {/if}
        
</main>

<style>

    main {
        height: auto;
        position: relative;
    }

    .selectorContent {
        height: auto;
    }

    .list {
        width: 100%;
        position: absolute;
        z-index: 10;
        max-height: 200px;
        overflow-y: auto;
    }

</style>