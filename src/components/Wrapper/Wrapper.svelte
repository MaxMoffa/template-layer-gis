<script>

    import { ProgressCircular, ProgressLinear, Icon, Button, Intersect } from 'svelte-materialify/src';
	import { mdiAlertBox, mdiHammerWrench, mdiCog, mdiCheckBold } from '@mdi/js';
	import { afterUpdate, createEventDispatcher, onDestroy, onMount } from 'svelte';
	import { theme, getBackground, getColor } from '../../store/theme';

    // Event dispatcher
	const dispatch = createEventDispatcher();

    // Props
	export let token = null;
	export let apikey = null;
	export let state = null;
	export let showContextualOptions = true;
	export let disableContextMenu = false;
	export let widgetId = null;
	export let lang = "en";
	export let disableSetup = false;
	export let themeMode = null;
	export let notifyStateChanges = false;

	//TODO: Capire quali di questi servono o meno
	export let widget;
	export let properties;
    export let showOptions = true;
	export let padding = 0;

    // Theme handler
	let _theme = themeMode ? themeMode : "light";
    let unsubscribeTheme = theme.subscribe(val => {
		if(!themeMode)
			_theme = val;
	});

	// TODO: Capire come risolvere il bug del refresh anomalo
	// $: state, stateChanged();

	// Const
	const NEED_SETUP = "needSetup";

	// Intersection Observer Visibility
	let isWidgetVisible = false;

	// Main ref widget
	let MAIN_REF;

	// Widget ref
	let WIDGET_REF, WIDGET = null;
	let off_message = null, off_changeOptions = null, off_changeChildOptions = null;

	// Maintenance priority
	let maintenancePriority = false;

	// Generic container configuration
	let genericContainer = {
		showCircleLoading: true,
		text: "Caricamento in corso",
	};

	// Auto refresh interval
	let _interval = null;

	// Show button options (if enabled)
	let showOptionButton = true;

	// Check if setup is done
	let isFirstReset = true;
	let isFirstReload = true;
	let isSetupDone = false;

	// Check changes
	let isFirstStart = false;

	onMount(() => {

		// Setup widget
		setupWidget();

	});

	// Clear the interval and destroy everything when the widget get removed
	onDestroy(() => {

		// Clear interval (if exists)
		if(_interval)
			clearInterval(_interval);

		// Destroy the old instance of the widget (if exist)
		destroyWidget();

		// Unsubscribe theme store
		unsubscribeTheme();

		// Reset variables
		isWidgetVisible = null;
		MAIN_REF = null;
		WIDGET_REF = null; 
		WIDGET = null;
		off_message = null;
		off_changeOptions = null;
		off_changeChildOptions = null;
		maintenancePriority = null;
		genericContainer = null;
		isFirstReload = null;
		isFirstReset = null;
		isSetupDone = null;
		_interval = null;
		showOptionButton = null;
		
	});

	function stateChanged() {
		if(!isFirstStart)
			reloadWidget();
		else
			isFirstStart = false;
	}

	// Load the widget
	async function setupWidget() {

		if(!widget || !properties){

			const WidgetIndex = await import("../../widgets/index");

			// Load widget
			if(!widget)
				widget = await WidgetIndex.getWidget(widgetId);

			// Load properties	
			if(!properties)
				properties = await WidgetIndex.getPropreties(widgetId);

		}

		if(isWidgetVisible && widget && properties){
			try {
				await loadWidget();
			} catch (error) {
				showError(e);	
			}
		}

		if(!widget || !properties)
			showMaintenance("Il widget non è supportato da questa versione di square");

		isSetupDone = true;

		return;
	}

	// Wrapper actions
	function showResult() {
		if(maintenancePriority)
			return;
		genericContainer = null;
	}

	function showError(text="") {

		console.error(text);

		destroyWidget();

		if(maintenancePriority)
			return;
		genericContainer = {
			icon: mdiAlertBox,
			text: text,
			showReload: true,
			showConfig: true,
			showReset: true
		}
	}

	function showConfirm(text) {
		if(maintenancePriority)
			return;
		genericContainer = {
			icon: mdiCheckBold,
			text: text,
			showReload: true
		}
	}

	function showMaintenance(text, priority=false) {

		destroyWidget();

		if(maintenancePriority)
			return;
		maintenancePriority = priority;
 		genericContainer = {
			icon: mdiHammerWrench,
			text: text,
			showReload: true,
			showConfig: true
		}
	}

	function showLoading(text) {
		if(maintenancePriority)
			return;
		genericContainer = {
			showCircleLoading: true,
			text: text,
			showReload: true
		}
	}

	function showProgressBar(text, value=0) {
		if(maintenancePriority)
			return;
		genericContainer = {
			showProgressBar: true,
			progressBarValue: value,
			text: text,
			showReload: true
		}
	}

	// Prepare the form data object for the widget
	function getFormData() {
		let params = {};
		if(token)
			params = { token };
		else if(apikey)
			params = { apikey };
		return params;
	}

	// Update widget state
	function saveState(_state, reload=true) {
		state = _state;
		dispatch("saveState", _state);
		if(reload)
			reloadWidget();
	}

	// Retrieve widget state
	function getState() {

		// Check if need setup
		let needSetup = false;
		if(!disableSetup && state && typeof(state) === "object")
			Object.keys(state).forEach(key => {
				if(state[key] === null)
					needSetup = true;
				if(state[key] && typeof(state[key]) === "object")
					if(state[key].hasOwnProperty("value") && state[key].value === null)
						needSetup = true; 
			});
		if(!disableSetup && needSetup){
			showMaintenance("Il widget richiede un setup", true);
			return NEED_SETUP;
		}

		// Load timer refresh
		// if(state && _interval === null && state.hasOwnProperty("_timer_refresh") && typeof(state._timer_refresh) === "number" && state._timer_refresh > 0)
		// 	reloadEvery(state._timer_refresh);

		return state;
	}

	// Reload and reset
	async function reloadAndReset() {

		console.log("RESET");

		if(isFirstReset || !isSetupDone){
			isFirstReset = false;
			return;
		}

		console.log("RESET CONFIRM");

		
		// Remove maintenance priority (if enabled)
		maintenancePriority = false;

		showLoading();

		// Destroy the old instance of the widget (if exist)
		destroyWidget();

		const WidgetIndex = await import("../../widgets/index");

		widget = await WidgetIndex.getWidget(widgetId);

		properties = await WidgetIndex.getPropreties(widgetId);

		// Create a new instance of the widget
		try {
			await loadWidget();
		} catch (error) {
			showError(e);	
		}

		return;

	}

	// Reload the widget
	function reloadWidget() {

		console.log("RELOAD");

		if(isFirstReload || !isSetupDone){
			isFirstReload = false;
			return;
		}

		// Remove maintenance priority (if enabled)
		maintenancePriority = false;

		showLoading();

		// Destroy the old instance of the widget (if exist)
		destroyWidget();
		
		// Create a new instance of the widget
		loadWidget()
		.catch(e => {
			showError(e);
		});

	}

	// Destroy the instance of the widget (if exist)
	function destroyWidget() {
		if(WIDGET !== null){

			// Remove event listener
			if(off_message)
				off_message();
			if(off_changeOptions)
				off_changeOptions();
			if(off_changeChildOptions)
				off_changeChildOptions();

			// Destroy widget
			WIDGET.$destroy();

			// Remove widget from html
			if(WIDGET_REF?.firstChild && WIDGET_REF.firstChild)
				WIDGET_REF.removeChild(WIDGET_REF.firstChild)

			// Reset variables
			WIDGET = null;
			off_message = null;
			off_changeOptions = null;
			off_changeChildOptions = null;
		}
	}

	// Create a new instance of the widget
	async function loadWidget() {

		// Check if widget is already initialised
		if(WIDGET !== null || !WIDGET_REF || !isWidgetVisible)
			return;

		let state = getState();

		if(state === NEED_SETUP)
			return;

		const {default: ErrorWrapper} = await import("./ErrorWrapper.svelte");

		// Fullfill the widgets requirements
		const data = await getWidgetData();

		// New widget instance
		WIDGET = new ErrorWrapper({
			target: WIDGET_REF,
			props: {
				widget,
				WIDGET_VISIBLE: true,
				lang,
				state,
				showContextualOptions,
				color: _getColor(_theme),
				formData: getFormData(),
				id: widgetId,
				isReady: false,
				data
			}
		});

		// Trigger events
		off_message = WIDGET.$on("message", e => {
			console.log(widgetId, e.detail);
			handleMessage(e.detail);
		});

		off_changeOptions = WIDGET.$on("changeOptions", e => {
			if(showContextualOptions){
				dispatch("changeOptions", {
					widget: widget,
					state: state
				});
			}
		});

		off_changeChildOptions = WIDGET.$on("changeChildOptions", e => {
			dispatch("changeChildOptions", e.detail);
		});

		WIDGET.$set({isReady: true});
	}

	// Show options 
	function showOptions_() {
		showOptionButton = true;
	}

	// Open widget configurator
	function openOptions() {
		if(showContextualOptions){
			dispatch("changeOptions", {
				widget: widget,
				state: state
			});
		}
	}

	// Auto refresh handler
	function reloadEvery(millis) {
		_interval = setInterval(() => {
			reloadWidget();
		}, millis);
	}

	// Dispatch contextmenu
	function contextmenu(e) {
		if(disableContextMenu)
			e.preventDefault();
		dispatch("contextmenu", {e, ref: MAIN_REF});
	}

	// Get theme to use with the widget
	function _getTheme(theme) {
		if(properties.DARK_MODE_SUPPORTED)
			return `theme--${theme}`;
		return "theme--light";
	}

	// Get colors to use with the widget
	function _getColor(theme) {
		if(properties.DARK_MODE_SUPPORTED){
			return {
				background: properties.THEME[theme],
				text: properties.TEXT_COLOR[theme],
				background_dashboard: getBackground(theme),
				color_dashboard: getColor(theme),
				theme
			}
		}
		return {
			background: properties.THEME["light"],
			text: properties.TEXT_COLOR["light"],
			background_dashboard: getBackground("light"),
			color_dashboard: getColor("light"),
			theme: "light"
		}
	}

	// Check if property exist and is valid
	function checkProperty(obj, k) {
		return obj.hasOwnProperty(k) && obj[k];
	}

	// Handle message from widget
	function handleMessage(message) {
		switch(message.title){
			case "showResult":
				showResult();
				break;
			case "showError":
				showError(message.text);
				break;
			case "showConfirm":
				showConfirm(message.text);
				break;
			case "showMaintenance":
				showMaintenance(message.text, message.priority);
				break;
			case "showLoading":
				showLoading(message.text);
				break;
			case "showProgressBar":
				showProgressBar(message.text, message.value);
				break;
			case "showOptions_":
				showOptions_();
				break;
			case "openOptions":
				openOptions();
				break;
			case "saveState":
				saveState(message.state, message.reload);
				break;
			default:
				dispatch(message.title, message)
		}
		if(notifyStateChanges)
			dispatch("stateChange", message);
	}

	// Get additional data required by the widget
	async function getWidgetData() {

		// Check proprieties
		if(!properties)
			return null;

		// Check requirements
		if(!properties?.REQUIREMENTS || !Array.isArray(properties.REQUIREMENTS) || properties.REQUIREMENTS.length === 0)
			return null;

		let result = {};

		// Get all data
		properties.REQUIREMENTS.forEach(requirement => {

			switch(requirement) {

				case "user": {
					let user = localStorage.getItem("user-info") || sessionStorage.getItem("user-info")
					user = user ? JSON.parse(user) : null;
					result.user = user;
					break;
				};

				default : {
					result[requirement] = null;
				}
			}

		});

		return result;

	}

	// Reset widget state
	function resetWidget() {
		saveState(null, true);
	}

</script>

<main 
	bind:this={MAIN_REF}
	use:Intersect={{once: true}}
	on:intersect={() => {		
		isWidgetVisible = true;
		setupWidget();
	}}
>

	{#if properties}

		<!-- Main -->
		<main 
			class="{_getTheme(_theme)} pa-{padding}"
			style="background: {_getColor(_theme).background}"
			on:contextmenu={contextmenu}
		>

			<!-- Widget content -->
			<div class="content-widget pa-{padding}">
					
				<!-- Widget -->
				<div bind:this={WIDGET_REF}>

				</div>

			</div>

			{#if showOptionButton && showOptions}
				<div class="button-options">
					<Button icon size="x-small" on:click={() => {
						dispatch("changeOptions", {
							widget: widget,
							state: state
						});
					}}>
						<Icon path={mdiCog} />
					</Button>
				</div>
			{/if}

			<!-- Generic container -->
			{#if genericContainer}
				<div class="generic-container" style="background: {_getColor(_theme).background}">

					<!-- Content generic container -->
					<div class="content">

						<!-- Icon -->
						{#if checkProperty(genericContainer, "icon")}
							<div class="icon">
								<Icon path={genericContainer.icon} size={64} />
							</div>
						{/if}

						<!-- Circle loading -->
						{#if checkProperty(genericContainer, "showCircleLoading")}
							<div class="icon">
								<ProgressCircular size={64} indeterminate color={"primary-color"} />
							</div>
						{/if}

						<!-- Circle loading -->
						{#if checkProperty(genericContainer, "showProgressBar") && genericContainer.hasOwnProperty("progressBarValue")}
							<div class="icon">
								<ProgressLinear rounded height={"20px"} stream value={genericContainer.progressBarValue} color={"primary-color"}>
									<span class="white-text font-weight-bold">
										{genericContainer.progressBarValue}%
									</span>
								</ProgressLinear>
							</div>
						{/if}

						<!-- Text description -->
						{#if checkProperty(genericContainer, "text")}
							<div class="text text-center pl-1 pr-1">
								{genericContainer.text}
							</div>
						{/if}

						<!-- Action buttons -->
						{#if checkProperty(genericContainer, "showReload") || checkProperty(genericContainer, "showConfig")}
							<div class="action">
								<div>

									<!-- Reload button -->
									{#if checkProperty(genericContainer, "showReload")}
										<div>
											<Button class="primary-color white-text" block depressed size="small" on:click={reloadWidget}>
												Ricarica
											</Button>
										</div>
									{/if}

									<!-- Space between buttons -->
									{#if state && checkProperty(genericContainer, "showReset") && checkProperty(genericContainer, "showReload")}
										<div class="mt-1"></div>
									{/if}

									<!-- Reload button -->
									{#if state && checkProperty(genericContainer, "showReset")}
										<div>
											<Button class="primary-color white-text" block depressed size="small" on:click={resetWidget}>
												Reset
											</Button>
										</div>
									{/if}

									<!-- Space between buttons -->
									{#if showContextualOptions && checkProperty(genericContainer, "showConfig") && state && checkProperty(genericContainer, "showReload")}
										<div class="mt-1"></div>
									{/if}

									<!-- Configure button -->
									{#if showContextualOptions && checkProperty(genericContainer, "showConfig") && state}
										<div>
											<Button class="primary-text" outlined block depressed size="small" on:click={() => {
												openOptions();
											}}>
												Configura
											</Button>
										</div>
									{/if}
								</div>
							</div>
						{/if}

					</div>

				</div>
			{/if}

		</main>

	{/if}

</main>

<style>

	/* Main */
	main {
		position: relative;
		width: 100%;
        height: 100%;
		overflow: hidden !important;
	}

	/* Widget space */
	.content-widget {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 0;
		overflow: hidden;
	}

	:global(.content-widget > div) {
		width: 100%;
		height: 100% !important;
		overflow-y: auto;
	}

	/* Generic container */
	.generic-container {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 1;
		display: grid;
		place-items: center;
		user-select: none;
	}

	.generic-container > .content {
		width: 100%;
		max-width: 300px;
		height: auto;
	}

	.generic-container > .content > div {
		display: grid;
		place-items: center;
	}

	.generic-container > .content > .text {
		padding-top: 32px;
	}

	.generic-container > .content > .action {
		padding-top: 32px;
	}

	/* Button options */
	.button-options {
		position: absolute;
		top: 4px;
		right: 4px;
	}

</style>