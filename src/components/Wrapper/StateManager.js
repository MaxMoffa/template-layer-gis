export default class StateManager {

    _dispatch = null;
    _formData = null;

    constructor(_dispatch, _formData) {
        this._dispatch = _dispatch;
        this._formData = _formData;
    }

    // Reset all widget info
    destroy() {
        this._dispatch = null;
        this._formData = null;
    }

    // Send message to the wrapper
    send_message(title, options={}) {

        if(!this._dispatch)
            return;

        this._dispatch("message", {
            title,
            ...options
        });

    }

    // Wrapper actions
    showResult() {
        this.send_message("showResult");
    }

    showError(text="") {
        this.send_message("showError", {
            text
        });
    }

    showConfirm(text) {
        this.send_message("showConfirm", {
            text
        });
    }

    showMaintenance(text, priority=false) {
        this.send_message("showMaintenance", {
            text,
            priority
        });
    }

    showLoading(text) {
        this.send_message("showLoading", {
            text
        });
    }

    showProgressBar(text, value=0) {
        this.send_message("showProgressBar", {
            text,
            value
        });
    }

    updateProgressBar(text, value=0) { 
        this.send_message("showProgressBar", {
            text,
            value
        });
    }

    // Update widget state
    saveState(state, reload=true) {
        this.send_message("saveState", {
            state,
            reload
        });
    }

    // Show options 
    showOptions_() {
        this.send_message("showOptions_");
    }

    downloadStarted() {
        this.send_message("downloadStarted");
    }

    downloadStarted() {
        this.send_message("downloadStarted");
    }

    // Open widget configurator
    downloadEnded() {
        this.send_message("downloadEnded");
    }

    // Get form data object
    getFormData() {

        let p = new FormData();

        if(!this._formData || typeof(this._formData) !== "object")
            return p;

        for(const [key, val] of Object.entries(this._formData))
            p.append(key, val);

        return p;

    }

    // Open option
    openOptions() {
        console.log("THIS", this);
        this.send_message("changeOptions");
    }

    // Load the dictionary for the widget
    static async loadDictionary(id, lang) {
        try {

            // Import index
            let index = (await import(`../../widgets/${id}/lang/index.json`)).default;

            // Select dictionary
            if(index.includes(lang))
                return (await import(`../../widgets/${id}/lang/${lang}.json`)).default;

            // Fallback language
            if(index.length > 0)
                return (await import(`../../widgets/${id}/lang/${index[0]}.json`)).default;

            return null;

        } catch (error) {

            // console.log(error);
            return null;

        }
    }

    // Create dictionary object for the widget
    static async getDictionary(id, lang) {

        try {

            // Load dict
            const dict = await StateManager.loadDictionary(id, lang);

            // Import language utils
            const { default: LangUtils } = await import("../../utils/lang_utils");

            // Create instance
            let dictionary = new LangUtils(lang, dict);

            // Load general dictionary
            const generalDict = await StateManager.loadGeneralDictionary( lang );

            // Add general words to dictionary
            dictionary.addDictionary( generalDict );

            console.log(dictionary);

            return dictionary;
            
        } catch (error) {

            return null;
            
        }

    }

    // Load the general dictionary
    static async loadGeneralDictionary(lang) {

        // Try to import the general dictionary
        try {

            // Import index
            let index = (await import(`../../pages/generalLang/index.json`)).default;

            // Select dictionary
            if(index.includes(lang))
                return (await import(`../../pages/generalLang/${lang}.json`)).default;

            // Fallback language
            if(index.length > 0)
                return (await import(`../../pages/generalLang/${index[0]}.json`)).default;

            // Fallback
            return true;

        } catch (error) {

            // Log error
            console.log("DictDog", error);

            // Fallback
            return true;

        }

    }
    
}