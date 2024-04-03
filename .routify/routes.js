
/**
 * @roxi/routify 2.18.12
 * File generated Wed Apr 03 2024 15:32:31 GMT+0200 (Ora legale dell’Europa centrale)
 */

export const __version = "2.18.12"
export const __timestamp = "2024-04-03T13:32:31.143Z"

//buildRoutes
import { buildClientTree } from "@roxi/routify/runtime/buildRoutes"

//imports


//options
export const options = {}

//tree
export const _tree = {
  "name": "_layout",
  "filepath": "/_layout.svelte",
  "root": true,
  "ownMeta": {},
  "absolutePath": "/Users/maxmoffa/Documents/Progetti/template-layer-gis/src/pages/_layout.svelte",
  "children": [
    {
      "isFile": true,
      "isDir": false,
      "file": "_fallback.svelte",
      "filepath": "/_fallback.svelte",
      "name": "_fallback",
      "ext": "svelte",
      "badExt": false,
      "absolutePath": "/Users/maxmoffa/Documents/Progetti/template-layer-gis/src/pages/_fallback.svelte",
      "importPath": "../src/pages/_fallback.svelte",
      "isLayout": false,
      "isReset": false,
      "isIndex": false,
      "isFallback": true,
      "isPage": false,
      "ownMeta": {},
      "meta": {
        "recursive": true,
        "preload": false,
        "prerender": true
      },
      "path": "/_fallback",
      "id": "__fallback",
      "component": () => import('../src/pages/_fallback.svelte').then(m => m.default)
    },
    {
      "isFile": false,
      "isDir": true,
      "file": "generalLang",
      "filepath": "/generalLang",
      "name": "generalLang",
      "ext": "",
      "badExt": false,
      "absolutePath": "/Users/maxmoffa/Documents/Progetti/template-layer-gis/src/pages/generalLang",
      "children": [],
      "isLayout": false,
      "isReset": false,
      "isIndex": false,
      "isFallback": false,
      "isPage": false,
      "ownMeta": {},
      "meta": {
        "recursive": true,
        "preload": false,
        "prerender": true
      },
      "path": "/generalLang"
    },
    {
      "isFile": false,
      "isDir": true,
      "file": "gis",
      "filepath": "/gis",
      "name": "gis",
      "ext": "",
      "badExt": false,
      "absolutePath": "/Users/maxmoffa/Documents/Progetti/template-layer-gis/src/pages/gis",
      "children": [
        {
          "isFile": false,
          "isDir": true,
          "file": "controller",
          "filepath": "/gis/controller",
          "name": "controller",
          "ext": "",
          "badExt": false,
          "absolutePath": "/Users/maxmoffa/Documents/Progetti/template-layer-gis/src/pages/gis/controller",
          "children": [],
          "isLayout": false,
          "isReset": false,
          "isIndex": false,
          "isFallback": false,
          "isPage": false,
          "ownMeta": {},
          "meta": {
            "recursive": true,
            "preload": false,
            "prerender": true
          },
          "path": "/gis/controller"
        },
        {
          "isFile": true,
          "isDir": false,
          "file": "index.svelte",
          "filepath": "/gis/index.svelte",
          "name": "index",
          "ext": "svelte",
          "badExt": false,
          "absolutePath": "/Users/maxmoffa/Documents/Progetti/template-layer-gis/src/pages/gis/index.svelte",
          "importPath": "../src/pages/gis/index.svelte",
          "isLayout": false,
          "isReset": false,
          "isIndex": true,
          "isFallback": false,
          "isPage": true,
          "ownMeta": {},
          "meta": {
            "recursive": true,
            "preload": false,
            "prerender": true
          },
          "path": "/gis/index",
          "id": "_gis_index",
          "component": () => import('../src/pages/gis/index.svelte').then(m => m.default)
        },
        {
          "isFile": false,
          "isDir": true,
          "file": "lang",
          "filepath": "/gis/lang",
          "name": "lang",
          "ext": "",
          "badExt": false,
          "absolutePath": "/Users/maxmoffa/Documents/Progetti/template-layer-gis/src/pages/gis/lang",
          "children": [],
          "isLayout": false,
          "isReset": false,
          "isIndex": false,
          "isFallback": false,
          "isPage": false,
          "ownMeta": {},
          "meta": {
            "recursive": true,
            "preload": false,
            "prerender": true
          },
          "path": "/gis/lang"
        },
        {
          "isFile": true,
          "isDir": false,
          "file": "LayerItem.svelte",
          "filepath": "/gis/LayerItem.svelte",
          "name": "LayerItem",
          "ext": "svelte",
          "badExt": false,
          "absolutePath": "/Users/maxmoffa/Documents/Progetti/template-layer-gis/src/pages/gis/LayerItem.svelte",
          "importPath": "../src/pages/gis/LayerItem.svelte",
          "isLayout": false,
          "isReset": false,
          "isIndex": false,
          "isFallback": false,
          "isPage": true,
          "ownMeta": {},
          "meta": {
            "recursive": true,
            "preload": false,
            "prerender": true
          },
          "path": "/gis/LayerItem",
          "id": "_gis_LayerItem",
          "component": () => import('../src/pages/gis/LayerItem.svelte').then(m => m.default)
        },
        {
          "isFile": true,
          "isDir": false,
          "file": "LayerSelector.svelte",
          "filepath": "/gis/LayerSelector.svelte",
          "name": "LayerSelector",
          "ext": "svelte",
          "badExt": false,
          "absolutePath": "/Users/maxmoffa/Documents/Progetti/template-layer-gis/src/pages/gis/LayerSelector.svelte",
          "importPath": "../src/pages/gis/LayerSelector.svelte",
          "isLayout": false,
          "isReset": false,
          "isIndex": false,
          "isFallback": false,
          "isPage": true,
          "ownMeta": {},
          "meta": {
            "recursive": true,
            "preload": false,
            "prerender": true
          },
          "path": "/gis/LayerSelector",
          "id": "_gis_LayerSelector",
          "component": () => import('../src/pages/gis/LayerSelector.svelte').then(m => m.default)
        },
        {
          "isFile": true,
          "isDir": false,
          "file": "Map.svelte",
          "filepath": "/gis/Map.svelte",
          "name": "Map",
          "ext": "svelte",
          "badExt": false,
          "absolutePath": "/Users/maxmoffa/Documents/Progetti/template-layer-gis/src/pages/gis/Map.svelte",
          "importPath": "../src/pages/gis/Map.svelte",
          "isLayout": false,
          "isReset": false,
          "isIndex": false,
          "isFallback": false,
          "isPage": true,
          "ownMeta": {},
          "meta": {
            "recursive": true,
            "preload": false,
            "prerender": true
          },
          "path": "/gis/Map",
          "id": "_gis_Map",
          "component": () => import('../src/pages/gis/Map.svelte').then(m => m.default)
        },
        {
          "isFile": true,
          "isDir": false,
          "file": "MapRecorder.svelte",
          "filepath": "/gis/MapRecorder.svelte",
          "name": "MapRecorder",
          "ext": "svelte",
          "badExt": false,
          "absolutePath": "/Users/maxmoffa/Documents/Progetti/template-layer-gis/src/pages/gis/MapRecorder.svelte",
          "importPath": "../src/pages/gis/MapRecorder.svelte",
          "isLayout": false,
          "isReset": false,
          "isIndex": false,
          "isFallback": false,
          "isPage": true,
          "ownMeta": {},
          "meta": {
            "recursive": true,
            "preload": false,
            "prerender": true
          },
          "path": "/gis/MapRecorder",
          "id": "_gis_MapRecorder",
          "component": () => import('../src/pages/gis/MapRecorder.svelte').then(m => m.default)
        }
      ],
      "isLayout": false,
      "isReset": false,
      "isIndex": false,
      "isFallback": false,
      "isPage": false,
      "ownMeta": {},
      "meta": {
        "recursive": true,
        "preload": false,
        "prerender": true
      },
      "path": "/gis"
    },
    {
      "isFile": true,
      "isDir": false,
      "file": "index.svelte",
      "filepath": "/index.svelte",
      "name": "index",
      "ext": "svelte",
      "badExt": false,
      "absolutePath": "/Users/maxmoffa/Documents/Progetti/template-layer-gis/src/pages/index.svelte",
      "importPath": "../src/pages/index.svelte",
      "isLayout": false,
      "isReset": false,
      "isIndex": true,
      "isFallback": false,
      "isPage": true,
      "ownMeta": {},
      "meta": {
        "recursive": true,
        "preload": false,
        "prerender": true
      },
      "path": "/index",
      "id": "_index",
      "component": () => import('../src/pages/index.svelte').then(m => m.default)
    }
  ],
  "isLayout": true,
  "isReset": false,
  "isIndex": false,
  "isFallback": false,
  "isPage": false,
  "isFile": true,
  "file": "_layout.svelte",
  "ext": "svelte",
  "badExt": false,
  "importPath": "../src/pages/_layout.svelte",
  "meta": {
    "recursive": true,
    "preload": false,
    "prerender": true
  },
  "path": "/",
  "id": "__layout",
  "component": () => import('../src/pages/_layout.svelte').then(m => m.default)
}


export const {tree, routes} = buildClientTree(_tree)

