<script>
    import { Button, Icon, ProgressCircular, TextField } from "svelte-materialify/src";
    import Dialog from "./Dialog.svelte";
    import { mdiCrown } from "@mdi/js";
    import { createEventDispatcher } from "svelte";
    import { slide } from "svelte/transition";
    import NetworkUtils from '../utils/network_utils';
    import { sendNotification } from "../store/notification";
    import { getDictionary } from '../store/dictionary';
    import moment from "moment";

    export let active = false;
    export let onlyInput = false;
    export let token = null;

    // Dispatcher
    const dispatch = createEventDispatcher();

    // Code example
    const CODE_EXAMPLE = "XXXXX-XXXXX-XXXXX-XXXXX-XXXXX";

    // Product key rules
    const PRODUCT_KEY_RULES = [
        (s) => {

            // Check if string is valid
            if(s !== "" && !(/^[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}$/.test(s))) {

                // Dispatch value
                dispatch("update", null);

                return dict?.getString("invalidProductKeyFormat");

            }

            // Dispatch value
            dispatch("update", productKeyValue);

        }
    ];

    // Product key value
    let productKeyValue = "";

    // Page state
    let pageState = 0;

    // Show not valid product key error
    let showInvalidProductKeyError = false;

    // Result
    let result = null;

    // Dictionary
    let dict = getDictionary();

    // Cancel license input request
    function cancelRequest() {

        // Reset input
        productKeyValue = "";

        // Close popup
        active = false;

        // Dispatch close event
        dispatch("close");

    }

    // Check if product key is valid
    function checkProductKeyValidity(s) {

        // Check if s is a valid string
        if(!s)
            return false;

        // Iterate over check
        for(let check of PRODUCT_KEY_RULES) {

            // Check string
            if(check( s ))
                return false;

        }

        // If is valid 
        return true;

    }

    // Request key for user account
    function requestProductKey() {

        // Check if is only input
        if(onlyInput) {

            // Dispatch value
            dispatch("update", productKeyValue);

            // Reset key
            productKeyValue = "";

            // Close popup
            active = false;

            return;

        }

        // Update page state
        pageState = 1;

        // Hide error invalid product key
        showInvalidProductKeyError = false;

        // Prepare params
        let p = new FormData();
        p.append("token", token);
        p.append("product_key", productKeyValue);

        // Request license to the server
        NetworkUtils.getServerUtenti("riscatta_codice", { method: "POST", body: p })
        .then(response => {

            // Check response code
            if(response.response_code === 200) {

                // Update result
                result = response.result;

                // Update page state
                pageState = 2;

                return;

            }

            // Log error
            console.error(response.message);

            // Update page state
            pageState = 0;

            // Show error to the user
            showInvalidProductKeyError = true;

            // Reset product key value
            productKeyValue = "";

        })
        .catch(e => {

            // Log error
            console.error(e);

            // Notify user
            sendNotification(dict?.getString("errorGeneric"), 3000, "error");

            // Update page state
            pageState = 0;

            // Reset product key value
            productKeyValue = "";

        });

    }

    // Reload platform after new license
    function reloadPlatform() {

        // Reload page
        window.location.reload();

    }

</script>

<!-- Check if is only input -->
{#if onlyInput}

    <!-- Only input container -->
    <div class="pt-2 pb-2">

        <!-- Product key textfield -->
        <TextField outlined bind:value={productKeyValue} rules={PRODUCT_KEY_RULES} placeholder={CODE_EXAMPLE} disabled={pageState === 1}>
            {dict?.getString("code")}

            <!-- Append slot -->
            <span slot="append">

                <!-- Check state -->
                {#if pageState === 1}
                
                    <!-- Loading -->
                    <ProgressCircular indeterminate color="primary" />

                {/if}

            </span>

        </TextField>

        <!-- Buy suggestion -->
        <div class="pt-2">
            {dict?.getString("buyLicenseSuggestion")} <a href="/plans" class="primary-text">square.sensesquare.eu/plans</a>
        </div>

    </div>

{:else}

    <!-- Dialog -->
    <Dialog bind:active={active} disableClose={pageState > 0} on:close>

        <!-- Icon container -->
        <svelte:fragment slot="icon">

            <!-- Check page state -->
            {#if pageState === 2}

                <!-- Image coin -->
                <img src="/media/coins/{result?.tipo?.toLowerCase()}.png" alt="Unlocked license" width="64px">
            
            {:else}

                <!-- Icon -->
                <Icon path={mdiCrown} />

            {/if}

        </svelte:fragment>

        <!-- Title container -->
        <svelte:fragment slot="title">
        
            <!-- Check page state -->
            {#if pageState === 2}

                {dict?.getString("licenseUnlocked")} <span class="primary-text">{result?.tipo?.toLowerCase()}</span>

            {:else}
            
                {dict?.getString("doYouHaveLicense")}

            {/if}

        </svelte:fragment>

        <!-- Description container -->
        <svelte:fragment slot="description">

            <!-- Check page state -->
            {#if pageState === 2}

                {dict?.getString("descriptionPopupLicenseStart")} <span class="primary-text">{moment(result?.scadenza).format("LL")}</span>. {dict?.getString("descriptionPopupLicenseEnd")}

            {:else}
            
                {dict?.getString("buttonLicenseFocus")}

                <!-- Buy suggestion -->
                <div class="pt-2">
                    {dict?.getString("buyLicenseSuggestion")} <a href="/plans" class="primary-text">square.sensesquare.eu/plans</a>
                </div>

            {/if}

        </svelte:fragment>

        <!-- Check page state -->
        {#if pageState !== 2}
        
            <!-- Product key textfield -->
            <TextField outlined bind:value={productKeyValue} rules={PRODUCT_KEY_RULES} placeholder={CODE_EXAMPLE} disabled={pageState === 1}>
                {dict?.getString("code")}

                <!-- Append slot -->
                <span slot="append">

                    <!-- Check state -->
                    {#if pageState === 1}
                    
                        <!-- Loading -->
                        <ProgressCircular indeterminate color="primary" />

                    {/if}

                </span>

            </TextField>

        {/if}

        <!-- Check if invalid product key was provided -->
        {#if showInvalidProductKeyError}
        
            <!-- Error box -->
            <div class="red-text" transition:slide>
                {dict?.getString("invalidProductKeyError")}
            </div>

        {/if}

        <!-- Actions container -->
        <svelte:fragment slot="actions">

            <!-- Check page state -->
            {#if pageState === 2}

                <!-- Confirm button -->
                <Button text rounded class="primary-text" on:click={reloadPlatform}>
                    {dict?.getString("reload")}
                </Button>

            {:else}
            
                <!-- Cancel button -->
                <Button text rounded class="mr-1" on:click={cancelRequest}>
                    {dict?.getString("cancel")}
                </Button>

                <!-- Confirm button -->
                <Button text rounded class="primary-text" disabled={pageState === 1 || !checkProductKeyValidity( productKeyValue )} on:click={requestProductKey}>
                    {dict?.getString("redeem")}
                </Button>

            {/if}

        </svelte:fragment>

    </Dialog>

{/if}