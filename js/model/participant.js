class Participant {
    #name
    #email
    #avatar

    constructor(
        name,
        email,
        avatar
    ) {
        this.#name = name
        this.#email = email
        this.#avatar = avatar
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