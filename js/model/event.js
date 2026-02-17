export default class Event {
    #id;
    #title;
    #datetime;
    #location
    #description;
    #icon

    #status // special? can be derived

    constructor({
        title,
        datetime,
        location,
        description,
        icon
    }) {
        this.#id = crypto.randomUUID();
        this.#title = title;
        this.#datetime = datetime;
        this.#location = location;
        this.#description = description;
        this.#icon = icon
    }

    get id() {
        return this.#id;
    }

    get title() {
        return this.#title;
    }

    set title(title) {
        this.#title = title
    }

    get datetime() {
        return this.#datetime;
    }

    set datetime(datetime) {
        this.#datetime = datetime
    }

    get location() {
        return this.#location;
    }

    set location(location) {
        this.#location = location
    }

    get icon() {
        return this.#icon;
    }

    set icon(icon) {
        this.#icon = icon;
    }
    get description() {
        return this.#description;
    }

    set description(description) {
        this.#description = description
    }

    get status() {
        return this.#status
    }

}

class Status {
    static Planned = Symbol("planned");
    static Completed = Symbol("completed");
}