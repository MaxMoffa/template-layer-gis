import { writable } from 'svelte/store';

// Status bar color store
export const StatusBarColor = writable("#ffffff");

// Show / Hide navigation bar
export const NavigationBarVisibility = writable(true);

// Mobile Mode
export const MobileModeEnabled = writable(false);

// Set status bar color
export const setStatusBarColor = color => {

    // Update store
    StatusBarColor.set( color );

};

// Set navigation bar visibility
export const setNavigationBarVisibility = isVisible => {

    // Update store
    NavigationBarVisibility.set( isVisible );

}

// Pop state handler
window.onpopstate = (e) => {

    // Set navigation bar visibility
    setNavigationBarVisibility( true );
    
}