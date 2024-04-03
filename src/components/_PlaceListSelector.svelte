<script>

    import { Row, Col, Select, Button, ListItem, Menu, Subheader } from 'svelte-materialify/src';
    import NetworkUtils from '../utils/network_utils';
    import { onMount } from 'svelte';
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    export let zoomLevel = 1;
    export let multiple = false;
    export let getFormData = () => new FormData();

    $: {
        nazione = zoomLevel === 1 && multiple ? [] : null;
        regione = zoomLevel === 2 && multiple ? [] : null;
        provincia = zoomLevel === 3 && multiple ? [] : null;
        comune = zoomLevel === 4 && multiple ? [] : null;
        square = multiple ? [] : null;
    }

    onMount(() => {
        if(elenco_nazioni.length === 0)
            elencoNazioni();
    });

    // Selected values
    let nazione = zoomLevel === 1 && multiple ? [] : null;
    let regione = zoomLevel === 2 && multiple ? [] : null;
    let provincia = zoomLevel === 3 && multiple ? [] : null;
    let comune = zoomLevel === 4 && multiple ? [] : null;
    let square = multiple ? [] : null;
    let centralina = multiple ? [] : null;
    let copernicus = multiple ? [] : null;
    let arpa_eea = multiple ? [] : null;

    let elenco_nazioni = [];
    let elenco_regioni = [];
    let elenco_province = [];
    let elenco_municipi = [];
    let elenco_squares = [];
    let elenco_centraline = [];
    let elenco_copernicus = [];
    let elenco_arpa_eea = [];

    function elencoNazioni() {

        // Reset
        nazione = zoomLevel === 1 && multiple ? [] : null;
        elenco_nazioni = [];
        regione = zoomLevel === 2 && multiple ? [] : null;
        elenco_regioni = [];
        provincia = zoomLevel === 3 && multiple ? [] : null;
        elenco_province = [];
        comune = zoomLevel === 4 && multiple ? [] : null;
        elenco_municipi = [];
        square = multiple ? [] : null;
        elenco_squares = [];
        centralina = multiple ? [] : null;
        elenco_centraline = [];
        copernicus = multiple ? [] : null;
        elenco_copernicus = [];
        arpa_eea = multiple ? [] : null;
        elenco_arpa_eea = [];

        let params = getFormData();
        let key, value;
        for(var pair of params.entries()){
            key = pair[0];
            value = pair[1];
        }

        NetworkUtils.getServerLettura(`elenco_nazioni?${key}=${value}`)
        .then(res => {
            if(res.response_status === 200)
                elenco_nazioni = res.result;
            else
                elenco_nazioni = [];
        })
        .catch(e => {
            console.log(e);
            elenco_nazioni = [];
        });
    }

    function elencoRegioni() {
        // Reset
        regione = zoomLevel === 2 && multiple ? [] : null;
        elenco_regioni = [];
        provincia = zoomLevel === 3 && multiple ? [] : null;
        elenco_province = [];
        comune = zoomLevel === 4 && multiple ? [] : null;
        elenco_municipi = [];
        square = multiple ? [] : null;
        elenco_squares = [];
        centralina = multiple ? [] : null;
        elenco_centraline = [];
        copernicus = multiple ? [] : null;
        elenco_copernicus = [];
        arpa_eea = multiple ? [] : null;
        elenco_arpa_eea = [];

        if(zoomLevel === 1){
            update();
            return;
        }

        if(!nazione)
            return;

        let params = getFormData();
        params.append("naz_name", nazione);
        NetworkUtils.getServerLettura("elenco_regioni", {
            method: "POST",
            body: params
        })
        .then(res => {
            if(res.response_code === 200)
                elenco_regioni = res.result;
            else
                elenco_regioni = [];
        })
        .catch(e => {
            console.log(e);
            elenco_regioni = [];
        });

    }

    function elencoProvince() {

        // Reset
        provincia = zoomLevel === 3 && multiple ? [] : null;
        elenco_province = [];
        comune = zoomLevel === 4 && multiple ? [] : null;
        elenco_municipi = [];
        square = multiple ? [] : null;
        elenco_squares = [];
        centralina = multiple ? [] : null;
        elenco_centraline = [];
        copernicus = multiple ? [] : null;
        elenco_copernicus = [];
        arpa_eea = multiple ? [] : null;
        elenco_arpa_eea = [];

        if(zoomLevel === 2){
            update();
            return;            
        }

        if(!regione)
            return;

        let params = getFormData();
        params.append("naz_name", nazione);
        params.append("reg_name", regione);
        NetworkUtils.getServerLettura("elenco_province", {
            method: "POST",
            body: params
        })
        .then(res => {
            if(res.response_code === 200)
                elenco_province = res.result;
            else
                elenco_province = [];
        })
        .catch(e => {
            console.log(e);
            elenco_province = [];
        });

    }

    function elencoComuni() {

        // Reset
        comune = zoomLevel === 4 && multiple ? [] : null;
        elenco_municipi = [];
        square = multiple ? [] : null;
        elenco_squares = [];
        centralina = multiple ? [] : null;
        elenco_centraline = [];
        copernicus = multiple ? [] : null;
        elenco_copernicus = [];
        arpa_eea = multiple ? [] : null;
        elenco_arpa_eea = [];

        if(zoomLevel === 3){
            update();
            return;
        }

        if(!provincia)
            return;

        let params = getFormData();
        params.append("naz_name", nazione);
        params.append("reg_name", regione);
        params.append("prov_name", provincia);
        NetworkUtils.getServerLettura("elenco_municipi", {
            method: "POST",
            body: params
        })
        .then(res => {
            if(res.response_code === 200)
                elenco_municipi = res.result;
            else
                elenco_municipi = [];
        })
        .catch(e => {
            console.log(e);
            elenco_municipi = [];
        });

    }

    function elencoSquares() {

        // Reset
        square = multiple ? [] : null;
        elenco_squares = [];

        if(zoomLevel === 4){
            update();
            return;
        }

        if(!comune)
            return;

        let params = getFormData();
        params.append("naz_name", nazione);
        params.append("reg_name", regione);
        params.append("provincia", provincia);
        params.append("comune", comune);
        NetworkUtils.getServerLettura("elenco_square", {
            method: "POST",
            body: params
        })
        .then(res => {
            if(res.response_code === 200)
                elenco_squares = res.result;
            else
            elenco_squares = [];
        })
        .catch(e => {
            console.log(e);
            elenco_squares = [];
        });

    }

    function elencoCentraline(fonte="ssq") {
        console.log(fonte);
        // Reset
        if(fonte === "ssq"){
            centralina = multiple ? [] : null;
            elenco_centraline = [];
        }else if(fonte === "copernicus"){
            elenco_copernicus = [];
            copernicus = multiple ? [] : null;
        }else if(fonte === "arpa_eea"){
            elenco_arpa_eea = [];
            arpa_eea = multiple ? [] : null;
        }

        if(zoomLevel === 4){
            update();
            return;
        }

        if(!comune)
            return;

        let params = getFormData();
        params.append("nazione", nazione);
        params.append("regione", regione);
        params.append("provincia", provincia);
        params.append("comune", comune);
        params.append("fonte", fonte);
        NetworkUtils.getServerLettura("elenco_centraline", {
            method: "POST",
            body: params
        })
        .then(res => {
            if(fonte === "ssq")
                elenco_centraline = res.map(c => {
                    return { name: `${c.ID}, ${c.squareID}`, value: c};
                });
            else if(fonte === "copernicus")
                elenco_copernicus = res.map(c => {
                    return { name: `${c.ID}, ${c.squareID}`, value: c};
                });
            else if (fonte === "arpa_eea")
                elenco_arpa_eea = res.map(c => {
                    return { name: `${c.ID}, ${c.squareID}`, value: c};
                });
        })
        .catch(e => {
            console.log(e);
            if(fonte === "ssq")
                elenco_centraline = [];
            else if(fonte === "copernicus")
                elenco_copernicus = [];
            else if (fonte === "arpa_eea")
                elenco_arpa_eea = [];
        });
    }

    function elencoSelector() {
        if(zoomLevel === 5)
            elencoSquares();
        else if(zoomLevel === 6){
            elencoCentraline();
            elencoCentraline("copernicus");
            elencoCentraline("arpa_eea");
        }else 
            update();
    }

    function update() {

        if(zoomLevel === 1 && nazione !== null){

            if(!multiple){
                dispatch("change", {nazione: nazione});
                return;
            }

            let r = nazione.map(v => {
                return {nazione: v};
            })
            dispatch("change", r);

        }else if(zoomLevel === 2 && regione !== null){

            if(!multiple){
                dispatch("change", {nazione: nazione, regione: regione});
                return;
            }

            let r = regione.map(v => {
                return {nazione: nazione, regione: v};
            })
            dispatch("change", r);

        }else if(zoomLevel === 3 && provincia !== null){

            if(!multiple){
                dispatch("change", {nazione: nazione, regione: regione, provincia: provincia});
                return;
            }

            let r = provincia.map(v => {
                return {nazione: nazione, regione: regione, provincia: v};
            })
            dispatch("change", r);

        }else if(zoomLevel === 4 && comune !== null){

            if(!multiple){
                dispatch("change", {nazione: nazione, regione: regione, provincia: provincia, comune: comune});
                return;
            }

            let r = comune.map(v => {
                return {nazione: nazione, regione: regione, provincia: provincia, comune: v};
            })
            dispatch("change", r);

        }else if(zoomLevel === 5 && square !== null){

            if(!multiple){
                dispatch("change", {nazione: nazione, regione: regione, provincia: provincia, comune: comune, square: square});
                return;
            }

            let r = square.map(v => {
                return {nazione: nazione, regione: regione, provincia: provincia, comune: comune, square: v};
            })
            dispatch("change", r);

        }else if(zoomLevel === 6 && (centralina !== null || arpa_eea !== null || copernicus !== null)){

            if(!multiple){
                let c = ssq || copernicus || arpa_eea;
                dispatch("change", {nazione: nazione, regione: regione, provincia: provincia, comune: comune, centralina: c});
                return;
            }

            let arr = [...centralina, ...copernicus, ...arpa_eea]
            let r = arr.map(v => {
                return {nazione: nazione, regione: regione, provincia: provincia, comune: comune, centralina: v.ID, lat: v.lat, lon: v.lon};
            })
            dispatch("change", r);

        }
            
    }

</script>

<main>

    <Row class="pa-0 ma-0">
        
        <Col>

            <Row>

                <Col>

                    <Row>

                        <Col>
                            <Select multiple={zoomLevel===1 && multiple} filled disabled={elenco_nazioni.length===0} items={elenco_nazioni} bind:value={nazione} on:change={elencoRegioni}>
                                Nazione
                            </Select>
                        </Col>

                        {#if zoomLevel >= 2}
                            <Col>
                                <Select multiple={zoomLevel===2 && multiple} filled disabled={elenco_regioni.length===0} items={elenco_regioni} bind:value={regione} on:change={elencoProvince}>
                                    Regione
                                </Select>
                            </Col>
                        {/if}

                    </Row>

                    <Row>

                        {#if zoomLevel >= 3}
                            <Col>
                                <Select multiple={zoomLevel===3 && multiple} filled disabled={elenco_province.length===0} items={elenco_province} bind:value={provincia} on:change={elencoComuni}>
                                    Provincia
                                </Select>
                            </Col>
                        {/if}

                        {#if zoomLevel >= 4}
                            <Col>
                                <Select multiple={zoomLevel===4 && multiple} filled disabled={elenco_municipi.length===0} items={elenco_municipi} bind:value={comune} on:change={elencoSelector}>
                                    Comune
                                </Select>
                            </Col>
                        {/if}

                    </Row>

                    <Row>

                        {#if zoomLevel === 5}
                            <Col>
                                <Select {multiple} filled disabled={elenco_squares.length===0} items={elenco_squares} bind:value={square} on:change={() => {
                                    if(square && zoomLevel === 5)
                                        update();
                                }}>
                                    Square
                                </Select>
                            </Col>
                        {/if}

                        {#if zoomLevel === 6}
                            <Row class="pa-0 ma-0">
                                <Col>
                                    <Select {multiple} filled disabled={elenco_centraline.length===0 || (!multiple && (arpa_eea || copernicus))} items={elenco_centraline} bind:value={centralina} on:change={() => {
                                        if(centralina && zoomLevel === 6)
                                            update();
                                    }}>
                                        SSQ
                                    </Select>
                                </Col>
                            </Row>
                            <Row class="pa-0 ma-0">
                                <Col>
                                    <Select {multiple} filled disabled={elenco_copernicus.length===0 || (!multiple && (centralina || arpa_eea))} items={elenco_copernicus} bind:value={copernicus} on:change={() => {
                                        if(copernicus && zoomLevel === 6)
                                            update();
                                    }}>
                                        Copernicus
                                    </Select>
                                </Col>
                            </Row>
                            <Row class="pa-0 ma-0">
                                <Col>
                                    <Select {multiple} filled disabled={elenco_arpa_eea.length===0 || (!multiple && (centralina || copernicus))} items={elenco_arpa_eea} bind:value={arpa_eea} on:change={() => {
                                        if(arpa_eea && zoomLevel === 6)
                                            update();
                                    }}>
                                        Arpa eea
                                    </Select>
                                </Col>
                            </Row>
                        {/if}

                    </Row>

                </Col>

            </Row>

        </Col>

    </Row>

</main>

<style>

</style>