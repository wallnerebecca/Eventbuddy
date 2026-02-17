export default class Tag {

    #id
    #name

    constructor(name) {
        this.#id = crypto.randomUUID();
        this.#name = name;
    }

    get id() {
        return this.#id;
    }

    get name() {
        return this.#name;
    }

}


