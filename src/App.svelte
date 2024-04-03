<svelte:body translate="no" />

<svelte:head>

  <!-- General -->
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Square</title>
  <meta name="description" content="We process complex information making the territory a container of information. We follow standard organization protocols which have the 'Square' as their synthesis and logic">
  <meta name="keywords" content="square, weather, air quality, data, map, gis">
  <meta name="copyright" content="Sense Square">

  <!-- Icons -->
  <link rel="apple-touch-icon" sizes="57x57" href="/media/icons/apple/apple-icon-57x57.png">
  <link rel="apple-touch-icon" sizes="60x60" href="/media/icons/apple/apple-icon-60x60.png">
  <link rel="apple-touch-icon" sizes="72x72" href="/media/icons/apple/apple-icon-72x72.png">
  <link rel="apple-touch-icon" sizes="76x76" href="/media/icons/apple/apple-icon-76x76.png">
  <link rel="apple-touch-icon" sizes="114x114" href="/media/icons/apple/apple-icon-114x114.png">
  <link rel="apple-touch-icon" sizes="120x120" href="/media/icons/apple/apple-icon-120x120.png">
  <link rel="apple-touch-icon" sizes="144x144" href="/media/icons/apple/apple-icon-144x144.png">
  <link rel="apple-touch-icon" sizes="152x152" href="/media/icons/apple/apple-icon-152x152.png">
  <link rel="apple-touch-icon" sizes="180x180" href="/media/icons/apple/apple-icon-180x180.png">
  <link rel="icon" type="image/png" sizes="192x192"  href="/media/icons/android/android-icon-192x192.png">
  <link rel="icon" type="image/png" sizes="32x32" href="/media/icons/web/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="96x96" href="/media/icons/web/favicon-96x96.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/media/icons/web/favicon-16x16.png">
  <meta name="msapplication-TileColor" content="#ffffff">
  <meta name="msapplication-TileImage" content="/media/icons/microsoft/ms-icon-144x144.png">

  <!-- Status bar color -->
  <meta name="msapplication-TileColor" content="{getStatusBarColor(statusBarColor, themeSelected, isMobile)}">
  <meta name="theme-color" content="{getStatusBarColor(statusBarColor, themeSelected, isMobile)}">

  <!-- Disable translate -->
  <meta name="google" content="notranslate" />

  <!-- Disable web crawler (Search engine) -->
  <meta name="robots" content="noindex, nofollow" />

</svelte:head>

<script>
  import { Router } from "@roxi/routify";
  import { routes } from "../.routify/routes";
  import { MaterialApp } from 'svelte-materialify/src';
  import { getColor, theme } from './store/theme';
  import { MobileModeEnabled, StatusBarColor } from './store/system';
  import { onDestroy } from "svelte";

  // Mobile mode enabled
  let isMobile = false;
  let unsubscribeMobileModeEnabled = MobileModeEnabled.subscribe(val => isMobile = val);

  // Status bar color
  let statusBarColor = "#ffffff";
  let unsubscribeStatusBarColor = StatusBarColor.subscribe(val => statusBarColor = val);

  // Theme
  let themeSelected = "light";
  let unsubscribeTheme = theme.subscribe(val => {

    // Update theme value
    themeSelected = val;

    // Check theme value
    if(val === "light")
      document.querySelector(':root').style.setProperty('--theme', "rgba(255,255,255,0.3)");
    else
      document.querySelector(':root').style.setProperty('--theme', "rgba(0,0,0,0.3)");

  });

  // Get status bar color
  function getStatusBarColor(color, theme, isMobile) {

    // Check if site is in standalone mode
    const isStandalone = (window.matchMedia('(display-mode: standalone)').matches) || (window.navigator.standalone) || document.referrer.includes('android-app://');

    // Check if is standalone
    if(isStandalone && !isMobile) {

      // Return color based on theme
      return getColor(theme);

    }

    // Return required color
    return color;

  }

  // On app destroy
  onDestroy(() => {

    // Unsubscribe to status bar color update
    unsubscribeStatusBarColor();

    // Unsubscribe to theme update
    unsubscribeTheme();

    // Unsubscribe to mobile mode handler
    unsubscribeMobileModeEnabled();

  });

</script>

<!-- Main material app module -->
<MaterialApp theme={themeSelected}>

  <!-- App router -->
  <Router config={{ useHash: false }} {routes} />

</MaterialApp>

<style>

  /* Force s-app dimensions */
  :global(.s-app){
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  /* ===== Scrollbar CSS ===== */

  /* Firefox */
  :global(*) {
    scrollbar-width: thin;
    scrollbar-color: #009688 var(--theme);
  }

  /* Chrome, Edge, and Safari */
  :global(*::-webkit-scrollbar) {
    width: 6px;
  }

  :global(*::-webkit-scrollbar-track) {
    background: var(--theme);
  }

  :global(*::-webkit-scrollbar-thumb) {
    background-color: #009688;
  }

  :global(*::-webkit-scrollbar-thumb:hover) {
    background-color: #00796b;
  }

  :global(*::-webkit-scrollbar-thumb:active) {
    background-color: #004d40;
  }

</style>
