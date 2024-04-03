import { writable, derived } from 'svelte/store';
import NetworkUtils from '../utils/network_utils';

// User info key (for local storage)
export const USER_INFO = "user-info";

// User store
export const user = writable(null);

// Force renew popup
export const forceRenewalPopup = writable(false);

// Set user value
export const setUser = (_user, tmp=false) => {

    // Update store
    user.set(_user);

    // Save user data
    if(tmp) {

        // Update session storage info
        sessionStorage.setItem(USER_INFO, JSON.stringify(_user));

    } else {

        // Update local storage info
        localStorage.setItem(USER_INFO, JSON.stringify(_user));

    }

};

// Logout
export const logout = () => {

    // Reset user store
    user.set(null);

    // Reset local storage
    localStorage.clear();

};

// Check if user token is valid
export const authenticate = async () => {

    // Get user info
    let user = window?._w_config?.user || localStorage.getItem(USER_INFO) || sessionStorage.getItem(USER_INFO);

    // Check if user is valid
    if(user) {

        // Check if is string
        if(typeof( user ) === "string") {

            // Update user object
            user = JSON.parse( user );

        }

    } else {

        // Set user null
        user = null;

    }

    // Check if user is null
    if(!user || typeof(user) !== "object")
        throw Error("User not logged");

    // Prepare params for check_token call
    let p = new FormData();
    p.append("token", user?.token);

    // Check token status on the server
    let tokenStatus = null;

    // Check if response goes fine
    try {

        // Set abort controller
        const controller = new AbortController();

        // Define the abort timeout
        const abortTimeout = setTimeout(() => controller.abort(), 10000);
        
        // Download data from server
        tokenStatus = await NetworkUtils.getServerUtenti("check_token", { method: "POST", body: p, signal: controller.signal });

        // Clear the timeout
        clearTimeout(abortTimeout);

    } catch (error) {

        // Throw network error
        throw Error({
            name: "NetworkError",
            message: error?.message || error
        })
        
    }

    // Check if response code is valid
    if(!tokenStatus || tokenStatus?.response_code !== 200)
        throw Error({
            name: "AuthenticationError",
            message: tokenStatus.message
        });

    return {
        ...tokenStatus.result,
        token: user?.token
    };

};

// Check if user is admin
export const isAdmin = (user=null) => {

    // Check if user is passed
    if(user === null)
        return false;

    // Return if user is admin
    return user?.type === "Platinum";

};

// Open renewal popup
export const openRenewalPopup = () => forceRenewalPopup.set(true);

// Get devices alias
export const devicesAliases = derived(user, ($user) => $user?.centraline_alias || {}, {});

// Get devices alias
export const projectsAliases = derived(user, ($user) => $user?.progetti_alias || {}, {});

// Get parameters
export const userParameters = derived(user, ($user) => $user?.inquinanti || [], []);

// Get user token
export const userToken = derived(user, ($user) => $user?.token, undefined);

// Get user type
export const userType = derived(user, ($user) => $user?.type, undefined);