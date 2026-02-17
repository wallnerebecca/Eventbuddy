class EventBuddyModel extends EventTarget {

    #events
    #participants

    constructor() {
        super();
        this.#events = new Map();
    }

    addEvent(event) {
       console.log(`Adding event ${event.id}: ${event.title}`);
       this.#events.set(event.id, event);
       this.sendUpdatedEvent();
    }

    updateEvent(id,
                title,
                datetime,
                location,
                description,
                icon) {
        console.log(`Updating event ${id}`);
        let event = this.#events.get(id);
        event.title = title;
        event.datetime = datetime;
        event.location = location;
        event.description = description;
        event.icon = icon;
        this.sendUpdatedEvent();
    }

    deleteEvent(id) {
        console.log(`Deleting event ${id}`);
        this.#events.delete(id);
        this.sendUpdatedEvent();
    }

    sendUpdatedEvent() {
        this.dispatchEvent(
            new CustomEvent("event-list-changed", {
                detail: this.#events.values().toArray()
            })
        );
    }


}

export const model = new EventBuddyModel();