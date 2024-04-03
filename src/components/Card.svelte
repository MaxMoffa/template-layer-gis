<script>

    export let title = "";
    export let flex = 1;
    export let action = false;

    console.log(flex);
</script>

{#if flex !== null}

    <main style={`flex: ${flex}`}>

        {#if title}
        
            <div class="header">

                <h4 class="text-h4">
                    {title}
                </h4>
                    
            </div>

        {/if}

        <div class="content">

            <slot name="content">
                NULL
            </slot>

        </div>

        {#if action}

            <div class="action">

                <slot name="action">
                    NULL
                </slot>

            </div>

        {/if}

    </main>

{/if}

<style>
    
    main {
        display: flex;
        flex-direction: column;
        background-color: #eeeeee;
        padding: 8px 16px;

        transition: flex linear 1s;
    }

    main > div {
        padding: 6px;
    }

    .header {
        flex: 1;
        display: flex;
        align-items: center;
    }

    .header > h4 {
        font-weight: 600;
        vertical-align: middle;
    }

    .content {
        flex: 10
    }

    .action {
        flex: 1;
    }

</style>