import { writable, get, derived } from 'svelte/store';
import LangUtils from "../utils/lang_utils";

// Local storage constant
const STORAGE_USER_LANG = "user-lang-info";

// General dictionary
export const dictionary = writable({});

// Loaded dictionary
export const loadedDictionary = derived(dictionary, ($dictionary) => getDictionary( $dictionary ), getDictionary({}));

// Get dictionare
export function getDictionary(dictInfo=null, lang=getUserLang()) {

    // Check if dictInfo is null
    if(dictInfo === null)
        dictInfo = get(dictionary);

    // Setup dictionary
    let dict = new LangUtils(lang, {});

    // Check if general dictionary is compatible
    if(typeof(dictInfo) === "object")
        dict.addDictionary(dictInfo);
    
    return dict;

}

// Get user lang
export function getUserLang() {

    // Load lang
    let lang = localStorage.getItem(STORAGE_USER_LANG) || navigator.language.substring(0,2).toLowerCase();
    
    // Check if lang is compatible
    lang = lang !== "it" ? "en" : lang;

    return lang;
    
}