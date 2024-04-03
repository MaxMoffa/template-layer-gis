import { writable } from 'svelte/store';

export const registration = writable(null);
export const needRefresh = writable(false);
export const updateSW = writable(() => console.log("update sw"));