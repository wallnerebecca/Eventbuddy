import Filters from "./filters.js";
import Tag from "./tag.js";

class EventBuddyModel extends EventTarget {

    #events
    #participants
    #filters
    #tags

    constructor() {
        super();
        this.#events = new Map();
        this.#filters = new Filters();
        this.#participants = new Map();
        this.#tags = new Map();
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

        let filteredEvents =
            this.#events
                .values()
                .toArray()
                .filter(event => {
                    const selectedStatuses = this.#filters.getFilterValues("status");
                    if(selectedStatuses.length > 0) {
                        return selectedStatuses.includes(event.status.description);
                    }
                    return true;
                })
                .filter(event => {
                    const selectedTagIds = this.#filters.getFilterValues("tag");
                    console.log(selectedTagIds);
                    if(selectedTagIds.length > 0) {
                        const eventTagIds = event.tags.keys().toArray();
                        console.log(eventTagIds)
                        const intersection = eventTagIds.filter(tag => selectedTagIds.includes(tag))

                        return intersection.length > 0;
                    }

                    return true;
                })

        this.dispatchEvent(
            new CustomEvent("event-list-changed", {
                detail: filteredEvents
            })
        );
    }

    // Filters
    updateStatusFilters({selectedOptions}) {
        console.log(`Updating status filters with ${JSON.stringify(selectedOptions)} selectedOptions`);
        this.#filters.setFilterValues("status", selectedOptions || []);
        this.sendUpdatedEvent();
    }

    updateTagFilters({selectedOptions}) {
        console.log(`Updating tag filters with ${JSON.stringify(selectedOptions)} selectedOptions`);
        this.#filters.setFilterValues("tag", selectedOptions || []);
        this.sendUpdatedEvent();
    }

    // Tags
    addTag(tagName) {
        if (this.tagAlreadyExists(tagName)) {
            return;
        }

        const tag = new Tag(tagName)
        console.log(`Adding tag ${tag}`);

        this.#tags.set(tag.id, tag);
        this.dispatchEvent(
            new CustomEvent("tag-list-changed", {
                detail: this.#tags.values().toArray()
            })
        )
    }

    tagAlreadyExists(tagName) {
        return this.#tags.values().toArray().some(tag => tag.name === tagName)
    }

    addTagToEvent(eventId, tagId) {
        const tag = this.#tags.get(tagId)
        const event = this.#events.get(eventId)

        if (event && tag) {
            event.addTag(tag);
            this.sendUpdatedEvent();
        }
    }

    deleteTagFromEvent(eventId, tagId) {
        const tag = this.#tags.get(tagId)
        const event = this.#events.get(eventId)

        if (event && tag) {
            event.removeTag(tag);
            this.sendUpdatedEvent();
        }
    }

    canDeleteTag(tagId) {
        const eventHasTag = this.#events.values().toArray().filter(event =>
            event.tags.keys().toArray().includes(tagId)
        )

        return eventHasTag.length === 0;
    }

    deleteTag(tagId) {
        console.log(`Current tags: ${this.#tags.values().toArray()}`)
        this.#tags.delete(tagId);
        console.log(`Current tags after delete: ${this.#tags.values().toArray()}`)
        this.dispatchEvent(
            new CustomEvent("tag-list-changed", {
                detail: this.#tags.values().toArray()
            })
        )

    }
}

export const model = new EventBuddyModel();