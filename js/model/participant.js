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

    get email() {
        return this.#email
    }

    get avatar() {
        return this.#avatar
    }

}