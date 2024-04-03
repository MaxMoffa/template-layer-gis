<script>

    import { Row, Col, TextField, ListItemGroup, Chip, List, ListItem, Checkbox, Subheader, Icon, Button } from 'svelte-materialify/src';
    import NetworkUtils from '../utils/network_utils';
    import { mdiArrowLeft, mdiClose } from '@mdi/js';
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    export let zoomLevel = 1;
    export let multiple = false;
    export let getFormData = () => new FormData();
    export let interactive = false;

    let list = [];
    let selection = [[]];
    let query = "";
    let shadow = "elevation-0";
    let multipleSelection = [[]];
    let indexPlace = 0;
    let confirmed = [];

    const isMultiple = () => {
        let k = zoomLevel === 6 ? 2 : 1;
        return multiple && selection[indexPlace].length+k === zoomLevel;
    };

    const isEnd = (z=selection[indexPlace].length) => {
        let k = zoomLevel === 6 ? 1 : 0;
        return z+k === zoomLevel;
    }

    async function elencoNazioni() {

        let params = getFormData();
        let key, value;
        for(var pair of params.entries()){
            key = pair[0];
            value = pair[1];
        }

        let r = await NetworkUtils.getServerLettura(`elenco_nazioni?${key}=${value}`);
        if(r.response_status === 200)
            return r.result;
        return [];
    }

    async function elencoRegioni() {
        let params = getFormData();
        params.append("naz_name", selection[indexPlace][0]);
        let r = await NetworkUtils.getServerLettura("elenco_regioni", {
            method: "POST",
            body: params
        });
        if(r.response_code === 200)
            return r.result;
        return [];
    }

    async function elencoProvince() {
        let params = getFormData();
        params.append("naz_name", selection[indexPlace][0]);
        params.append("reg_name", selection[indexPlace][1]);
        let r = await NetworkUtils.getServerLettura("elenco_province", {
            method: "POST",
            body: params
        })
        if(r.response_code === 200)
            return r.result;
        return [];
    }

    async function elencoComuni() {
        let params = getFormData();
        params.append("naz_name", selection[indexPlace][0]);
        params.append("reg_name", selection[indexPlace][1]);
        params.append("prov_name", selection[indexPlace][2]);
        let r = await NetworkUtils.getServerLettura("elenco_municipi", {
            method: "POST",
            body: params
        })
        if(r.response_code === 200)
            return r.result;
        return [];
    }

    async function elencoSquares() {
        let params = getFormData();
        params.append("naz_name", selection[indexPlace][0]);
        params.append("reg_name", selection[indexPlace][1]);
        params.append("provincia", selection[indexPlace][2]);
        params.append("comune", selection[indexPlace][3]);
        let r = await NetworkUtils.getServerLettura("elenco_square", {
            method: "POST",
            body: params
        })
        if(r.response_code === 200)
            return r.result;
        return [];
    }

    async function elencoCentraline(fonte="ssq") {
        let params = getFormData();
        params.append("nazione", selection[indexPlace][0]);
        params.append("regione", selection[indexPlace][1]);
        params.append("provincia", selection[indexPlace][2]);
        params.append("comune", selection[indexPlace][3]);
        params.append("fonte", fonte);
        let r = await NetworkUtils.getServerLettura("elenco_centraline", {
            method: "POST",
            body: params
        });
        return r;
    }

    async function updateList(z=0) {        
        // Update changes
        update();
        if(isEnd(z))
            return;

        if(z === 0)
            list = await elencoNazioni();
        if(z === 1)
            list = await elencoRegioni();
        if(z === 2)
            list = await elencoProvince();
        if(z === 3)
            list = await elencoComuni();
        if(z === 4){
            if(zoomLevel === 5)
                list = await elencoSquares();
            else
                list = [
                    {fonte: "SSQ", list: await elencoCentraline("ssq")},
                    {fonte: "Copernicus", list: await elencoCentraline("copernicus")},
                    {fonte: "Arpa eea", list: await elencoCentraline("arpa_eea")},
                ];
        }
        list.sort();
        return;
    }

    function update() {
        if(multiple){
            if(!isEnd(selection[indexPlace].length+1) && selection.length <= 1){
                dispatch("change", null);
                return;
            }
        }else{
            if(!isEnd()){
                dispatch("change", null);
                return;
            }
        }

        let arr_r = [];

        for(let i=0; i<selection.length; i++){

            if(zoomLevel === 1){

                if(!multiple){
                    dispatch("change", {nazione: selection[i][0]});
                    return;
                }

                let r = multipleSelection[i].map(v => {
                    return {nazione: v};
                })
                arr_r = [...arr_r, ...r];

            }else if(zoomLevel === 2){

                if(!multiple){
                    dispatch("change", {nazione: selection[i][0], regione: selection[i][1]});
                    return;
                }

                let r = multipleSelection[i].map(v => {
                    return {nazione: selection[i][0], regione: v};
                })
                arr_r = [...arr_r, ...r];

            }else if(zoomLevel === 3 ){

                if(!multiple){
                    dispatch("change", {nazione: selection[i][0], regione: selection[i][1], provincia: selection[i][2]});
                    return;
                }

                let r = multipleSelection[i].map(v => {
                    return {nazione: selection[i][0], regione: selection[i][1], provincia: v};
                })
                arr_r = [...arr_r, ...r];

            }else if(zoomLevel === 4){

                if(!multiple){
                    dispatch("change", {nazione: selection[i][0], regione: selection[i][1], provincia: selection[i][2], comune: selection[i][3]});
                    return;
                }

                let r = multipleSelection[i].map(v => {
                    return {nazione: selection[i][0], regione: selection[i][1], provincia: selection[i][2], comune: v};
                })
                arr_r = [...arr_r, ...r];

            }else if(zoomLevel === 5){

                if(!multiple){
                    dispatch("change", {nazione: selection[i][0], regione: selection[i][1], provincia: selection[i][2], comune: selection[i][3], square: selection[i][4]});
                    return;
                }

                let r = multipleSelection[i].map(v => {
                    return {nazione: selection[i][0], regione: selection[i][1], provincia: selection[i][2], comune: selection[i][3], square: v};
                })
                arr_r = [...arr_r, ...r];

            }else if(zoomLevel === 6){

                if(!multiple){
                    dispatch("change", {nazione: selection[i][0], regione: selection[i][1], provincia: selection[i][2], comune: selection[i][3], centralina: selection[i][4]});
                    return;
                }

                let r = multipleSelection[i].map(v => {
                    let lat = v.lat || parseFloat(v.latitude);
                    let lon = v.lon || parseFloat(v.longitude);
                    return {nazione: selection[i][0], regione: selection[i][1], provincia: selection[i][2], comune: selection[i][3], centralina: v.ID, lat: lat, lon: lon};
                })
                arr_r = [...arr_r, ...r];

            }

        }
        
        if(arr_r.length > 0)
            dispatch("change", arr_r);
    
    }

    function smartSearch() {
        let arr = [];
        list.forEach(v => {
            if(typeof(v) === "string"){
                if(v.toLowerCase().includes(query.toLowerCase()))
                    arr.push(v);
            }else{
                v.list.forEach(x => {
                    if(x.ID.toLowerCase().includes(query.toLowerCase()))
                        arr.push(x);
                });
            }
        });
        if(arr.length === 1){
            if(isMultiple()){
                if(!multipleSelection[indexPlace].includes(arr[0]))
                    multipleSelection[indexPlace] = [...multipleSelection[indexPlace], arr[0]];
                else 
                    multipleSelection[indexPlace] = multipleSelection[indexPlace].filter(k => {
                        return zoomLevel === 6 ? k.ID !== arr[0].ID : k !== arr[0];
                    });
                update();
            }else if(!isEnd()){
                selection[indexPlace] = [...selection[indexPlace], arr[0]];
                query = "";
            }else{
                selection[indexPlace][selection[indexPlace].length-1] = arr[0];
            }
        }
    }

    function scroll(e) {
        let scrollTop = e.target.scrollTop;
        if(scrollTop > 0)
            shadow = "elevation-1";
        else
            shadow = "elevation-0";
    }

    function cancel() {
        dispatch("close");
    }

</script>

<main on:scroll={scroll}>

    <Row class="ma-0 pa-0">
        {#if interactive}
            <Col class="ma-0 pa-0" cols={1} style={"display: grid; place-items: center"}>
                <Button icon on:click={cancel}>
                    <Icon path={mdiArrowLeft}/>
                </Button>
            </Col>
        {/if}
        <Col>
            <TextField filled bind:value={query} on:change={smartSearch}>
                Cerca
            </TextField>
        </Col>
    </Row>

    {#if selection[indexPlace].length > 0 || confirmed.length > 0}
        <Row class="ma-0 pa-0" style="position: sticky; top: 0; z-index: 10">
            <Col class="ma-0 pa-0">
                <div class="white pa-3 {shadow}">
                    {#each confirmed as s,i }
                        <Chip outlined class="primary-color-text ml-3 mb-3" on:click={() => {
                                confirmed.splice(i, 1);
                                selection.splice(i, 1);
                                multipleSelection.splice(i, 1);
                                selection = selection;
                                confirmed = confirmed;
                                multipleSelection = multipleSelection;
                                indexPlace--;
                                update();
                            }}>
                            <Icon path={mdiClose} size={16} />
                            <span>
                                {s}
                            </span>
                        </Chip>
                    {/each} 
                    {#each selection[indexPlace] as s,i}
                        <Chip link class="primary-color white-text ml-3 mb-3" on:click={() => {
                            selection[indexPlace].splice(i, selection[indexPlace].length-i);
                            selection[indexPlace] = selection[indexPlace];
                            multipleSelection[indexPlace] = [];
                            query = "";
                        }}>
                            {s.ID || s}
                        </Chip>
                    {/each}
                    <Chip link outlined class="primary-color-text ml-3 mb-3" active={isMultiple() && multipleSelection[indexPlace].length > 0} on:click={() => {
                        selection = [...selection, []];
                        multipleSelection = [...multipleSelection, []];
                        confirmed = [...confirmed, selection[indexPlace][selection[indexPlace].length-1]];
                        query = "";
                        indexPlace++;    
                    }}>
                        Aggiungi luogo
                    </Chip>
                </div>
            </Col>
        </Row>
    {/if}

    <List class="pa-3" style="width:100%; overflow-y: auto">
        {#await updateList(selection[indexPlace].length) then r}
            {#if list.length === 0}
                <ListItem class="text-center">
                    Nessun elemento
                </ListItem>
            {/if}

            <ListItemGroup dense={isEnd()} multiple={isMultiple()}>

                {#each list as l}
                    {#if typeof(l) === "object"}
                        <Subheader>
                            {l.fonte}
                        </Subheader>
                        {#if l.list.length === 0}
                            <ListItem>
                                Nessun elemento
                            </ListItem>
                        {/if}
                        {#each l.list as a}
                            {#if a.hasOwnProperty("ID") && a.ID.toLowerCase().includes(query.toLowerCase())}
                                <ListItem selectable on:click={() => {
                                    if(isMultiple()){
                                        if(!multipleSelection[indexPlace].includes(a))
                                            multipleSelection[indexPlace] = [...multipleSelection[indexPlace], a];
                                        else 
                                            multipleSelection[indexPlace] = multipleSelection[indexPlace].filter(k => k.ID !== a.ID);
                                        update();
                                    }else if(!isEnd()){
                                        selection[indexPlace] = [...selection[indexPlace], a];
                                        query = "";
                                    }else {
                                        selection[indexPlace][selection[indexPlace].length-1] = a;
                                    }
                                }}>
                                    <span slot="prepend">
                                        {#if isMultiple()}
                                            <Checkbox checked={multipleSelection[indexPlace].includes(a)} />
                                        {/if}
                                    </span>
                                    {a.ID}
                                </ListItem>
                            {/if}
                        {/each}
                    {:else}
                        {#if l.toLowerCase().includes(query.toLowerCase())}
                            <ListItem selectable on:click={() => {
                                if(isMultiple()){
                                    if(!multipleSelection[indexPlace].includes(l))
                                        multipleSelection[indexPlace] = [...multipleSelection[indexPlace], l];
                                    else 
                                        multipleSelection[indexPlace] = multipleSelection[indexPlace].filter(k => k !== l);
                                    update();
                                }else if(!isEnd()){
                                    selection[indexPlace] = [...selection[indexPlace], l];
                                    query = "";
                                }else {
                                    selection[indexPlace][selection[indexPlace].length-1] = l;
                                }
                            }}>
                                <span slot="prepend">
                                    {#if isMultiple()}
                                        <Checkbox checked={multipleSelection[indexPlace].includes(l)} />
                                    {/if}
                                </span>
                                {l}
                            </ListItem>
                        {/if}
                    {/if}
                {/each}

            </ListItemGroup>
        
        {:catch e}
                <ListItem class="text-center">
                    Ops! Sembra esserci un problema
                </ListItem>
        {/await}

    </List>

</main>

<style>

    main {
        overflow-y: auto;
    }

</style>