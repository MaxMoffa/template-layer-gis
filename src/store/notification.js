import { writable } from 'svelte/store';

// Theme store
export const notificationList = writable([]);

// Notification handler dialog for enable/disable notifcation
export const notificationConfigurator = writable(false);

// Add notification
export function sendNotification(text="", duration=3000, type=null) {

    // Check if text is valid
    if(text === "")
        return;

    // Update notifications
    notificationList.update(list => {

        // Add notification to array
        return [...list, {
            text,
            duration,
            type
        }];

    });

};

// Clear notification list
export function clearNotificationList() {

    // Reset notification list
    notificationList.set([]);

}

// Configure notification
export function configureNotification(trigger, data={}, callback=null) {

    // Check if type is string
    if(typeof(trigger) !== "string")
        throw Error("Not valid notification trigger");

    // Open configurator
    notificationConfigurator.set({
        trigger,
        data,
        callback
    });

}