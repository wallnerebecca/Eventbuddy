export default class Event {
    #id;
    #name;
    #description;

    constructor({id, name, description}) {
        this.#id = id;
        this.#name = name;
        this.#description = description;
    }

    get id() {
        return this.#id;
    }

    get name() {
        return this.#name;
    }

    get description() {
        return this.#description;
    }

}