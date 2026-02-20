export default class Participant {
    #id;
    #name
    #email
    #avatar

    constructor(
        name,
        email,
        avatar
    ) {
        this.#id = crypto.randomUUID()
        this.#name = name
        this.#email = email
        this.#avatar = avatar
    }

    get id() {
        return this.#id
    }

    get name() {
        return this.#name
    }

    set name (value) {
        this.#name = value
    }

    get email() {
        return this.#email
    }

    set email (value) {
        this.#email = value
    }

    get avatar() {
        return this.#avatar
    }

    set avatar (value) {
        this.#avatar = value
    }

}