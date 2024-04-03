<script>

    import { createBoundary } from '@crownframework/svelte-error-boundary';
    import ErrorWrapper from './CustomBoundary.svelte';
    import { createEventDispatcher } from 'svelte';

    // Custom error wrapper
	const Boundary = createBoundary(ErrorWrapper);

    // Event dispatcher
    const dispatch = createEventDispatcher();

    export let widget = null;
    export let WIDGET_VISIBLE = true;
	export let formData;
    export let lang;
	export let state;
	export let color;
    export let showContextualOptions;
    export let id;
    export let isReady = false;
    export let data = null;

</script>

<Boundary onError={(e) => {
    dispatch("message", {
        title: "showError",
        text: e
    });
}}> 
    
    {#if isReady}
    
        <svelte:component 
            this={widget}
            {WIDGET_VISIBLE}
            {formData}
            {lang}
            {state}
            {color}
            {showContextualOptions}
            {id}
            {data}

            on:message={e => {                    
                dispatch("message", e.detail);
            }}
            on:changeOptions={e => {
                dispatch("changeOptions");
            }}
            on:changeChildOptions={e => {
                dispatch("changeChildOptions", e.detail);
            }}
        />

    {/if}

</Boundary>

