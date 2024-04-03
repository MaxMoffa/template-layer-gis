export const AVAILABLE_LANGUAGES = [
    ["Italiano", "it"],
    ["English", "en"]
];

export default class {

    lang = null;
    dictionary = null;

    constructor(lang, dictionary) {

        this.lang = lang;

        try {

            if(typeof(dictionary) === "string")
                this.dictionary = JSON.parse(dictionary);
            else if(typeof(dictionary) === "object")
                this.dictionary = dictionary;
            else
                throw "No valid dictionary";

        } catch (error) {

            throw "No valid dictionary";

        }

    }

    getString(key) {
        if(!this.dictionary)
            return key;
        if(!this.dictionary.hasOwnProperty(key))
            return key;
        return this.dictionary[key];
    }

    getLang() {
        return this.lang;
    }

    getAvailableLanguages() {
        return AVAILABLE_LANGUAGES;
    }

    setLang(lang) {
        this.lang = lang;
    }

    setDictionary(dictionary) {
        if(typeof(dictionary) === "string")
            this.dictionary = JSON.parse(dictionary);
        else if(typeof(dictionary) === "object")
            this.dictionary = dictionary;
        else
            throw "No valid dictionary";
    }

    addDictionary(dictionary) {
        try {

            if(typeof(dictionary) === "string")
                this.dictionary = {
                    ...this.dictionary,
                    ...JSON.parse(dictionary)
                };
            else if(typeof(dictionary) === "object")
                this.dictionary = {
                    ...this.dictionary,
                    ...dictionary
                };
            else
                throw "No valid dictionary";

        } catch (error) {

            throw "No valid dictionary";

        }
    }

}