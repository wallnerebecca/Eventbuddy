export default class Event {
    #id;
    #title;
    #datetime;
    #location
    #description;
    #icon

    #createdBy

    #tags
    #participants

    constructor(
        title,
        datetime,
        location,
        description,
        icon,
        createdBy
    ) {
        this.#id = crypto.randomUUID();
        this.#title = title;
        this.#datetime = datetime;
        this.#location = location;
        this.#description = description;
        this.#icon = icon;

        this.#createdBy = createdBy;

        this.#tags = new Map();
        this.#participants = new Map();
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

    get createdBy() {
        return this.#createdBy;
    }

    set description(description) {
        this.#description = description
    }

    get status() {
        const currentTime = new Date()

        if (this.#datetime < currentTime) {
            return "completed"
        } else {
            return "planned"
        }
    }

    get tags() {
        return this.#tags;
    }

    addTag(tag) {
        this.#tags.set(tag.id, tag);
    }

    updateTags(tags) {
        this.#tags = new Map();
        tags.forEach((tag) => {
            this.#tags.set(tag.id, tag);
        })
    }


    get participants() {
        return this.#participants.values().toArray();
    }

    addParticipant(participant) {
        this.#participants.set(participant.id, participant);
    }

    updateParticipants(participants) {
        this.#participants = new Map();
        participants.forEach((participant) => {
            this.#participants.set(participant.id, participant);
        })
    }

    removeParticipant(participant) {
        this.#participants.delete(participant.id);
    }


}