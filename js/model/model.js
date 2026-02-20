import Filters from "./filters.js";
import Tag from "./tag.js";
import Participant from "./participant.js";
import User from "./user.js";
import Event from "./event.js";

class EventBuddyModel extends EventTarget {

    #events
    #participants
    #filters
    #tags
    #users

    #activeUser

    constructor() {
        super();
        this.#events = new Map();
        this.#filters = new Filters();
        this.#participants = new Map();
        this.#tags = new Map();
        this.#users = []
        this.#activeUser = undefined
    }

    addUser({username, email}) {
        this.#users.push(new User(username, email));
        this.dispatchEvent(
            new CustomEvent("users-updated", {
                detail: {
                    users: this.#users
                }
            })
        )
    }

    login(user) {
        this.#activeUser = user;
        this.sendUpdateActiveUserEvent()
    }

    logout() {
        this.#activeUser = undefined;
        this.sendUpdateActiveUserEvent()
    }

    sendUpdateActiveUserEvent() {
        this.dispatchEvent(
            new CustomEvent("update-active-user", {
                detail: {
                    user: this.#activeUser
                }
            })
        )
    }

    addEvent(title,
             datetime,
             location,
             description,
             icon) {
        const event = new Event(title,
            datetime,
            location,
            description,
            icon,
            this.#activeUser
        )
        console.log(`Adding event ${event.id}: ${event.title}`);
        this.#events.set(event.id, event);
        this.sendEventListChangedEvent();
    }

    updateEvent(id,
                title,
                datetime,
                location,
                description,
                icon) {
        console.log(`Updating event ${id}`);
        const event = this.#events.get(id);
        event.title = title;
        event.datetime = datetime;
        event.location = location;
        event.description = description;
        event.icon = icon;
        this.sendEventListChangedEvent();
    }

    deleteEvent(id) {
        console.log(`Deleting event ${id}`);
        this.#events.delete(id);
        this.sendEventListChangedEvent();
    }

    sendEventListChangedEvent() {

        const filteredEvents =
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
                .filter(event => {
                    const selectedParticipantEmails = this.#filters.getFilterValues("participant");
                    console.log(selectedParticipantEmails);

                    if(selectedParticipantEmails.length > 0) {
                        const eventEmails = event.participants.map(participant => participant.email)
                        console.log(eventEmails);

                        const intersection = eventEmails.filter(tag => selectedParticipantEmails.includes(tag))

                        return intersection.length > 0;
                    }

                    return true;
                })

        this.dispatchEvent(
            new CustomEvent("event-list-changed", {
                detail: {
                    events: filteredEvents
                }
            })
        );
    }

    // Filters
    updateStatusFilters(selectedOptions) {
        console.log(`Updating status filters with ${JSON.stringify(selectedOptions)} selectedOptions`);
        this.#filters.setFilterValues("status", selectedOptions || []);
        this.sendEventListChangedEvent();
    }

    updateTagFilters(selectedOptions) {
        console.log(`Updating tag filters with ${JSON.stringify(selectedOptions)} selectedOptions`);
        this.#filters.setFilterValues("tag", selectedOptions || []);
        this.sendEventListChangedEvent();
    }

    updateParticipantFilters(selectedOptions) {
        console.log(`Updating participant filters with ${JSON.stringify(selectedOptions)} selectedOptions`);
        this.#filters.setFilterValues("participant", selectedOptions || []);
        this.sendEventListChangedEvent();
    }

    // Participant
    addParticipant(
        name,
        email,
        avatar
    ) {
        if (this.participantAlreadyExists(email)) {
            console.log(`Participant with email ${email} already exists`);
            return;
        }

        const participant = new Participant(name, email, avatar)
        console.log(`Adding participant with email ${email}`);

        this.#participants.set(participant.email, participant)
        this.sendParticipantsChangedEvent()
    }

    participantAlreadyExists(email) {
        return this.#participants.keys().toArray().includes(email)
    }

    addParticipantToEvent(eventId, email) {
        const participant = this.#participants.get(email)
        const event = this.#events.get(eventId)

        if (event && participant) {
            event.addParticipant(participant)
            this.sendEventListChangedEvent();
        }
    }

    removeParticipantFromEvent(eventId, email) {
        const participant = this.#participants.get(email)
        const event = this.#events.get(eventId)

        if (event && participant) {
            event.removeParticipant(participant)
            this.sendEventListChangedEvent();
        }
    }

    deleteParticipant(email) {
        console.log(`Deleting participant with email ${email}`);

        const participant = this.#participants.get(email)
        this.#participants.delete(email)

        this.#events.values().toArray().map(event => {
            event.removeParticipant(participant)
        })

        this.sendParticipantsChangedEvent()
        this.sendEventListChangedEvent()
    }

    sendParticipantsChangedEvent() {
        this.dispatchEvent(
            new CustomEvent("participants-changed", {
                detail: {
                    participants: this.#participants.values().toArray()
                }
            })
        )
    }
    // Tags
    addTag(tagName) {
        if (this.tagAlreadyExists(tagName)) {
            return;
        }

        const tag = new Tag(tagName)
        console.log(`Adding tag ${tag}`);

        this.#tags.set(tag.id, tag);
        this.sendTagListChangedEvent()
    }

    isValidTagName(tagName) {
        return tagName.length > 0 && tagName.length < 20;
    }

    tagAlreadyExists(tagName) {
        return this.#tags.keys().toArray().includes(tagName)
    }

    addTagToEvent(eventId, tagId) {
        const tag = this.#tags.get(tagId)
        const event = this.#events.get(eventId)

        if (event && tag) {
            event.addTag(tag);
            this.sendEventListChangedEvent();
        }
    }

    deleteTagFromEvent(eventId, tagId) {
        const tag = this.#tags.get(tagId)
        const event = this.#events.get(eventId)

        if (event && tag) {
            event.removeTag(tag);
            this.sendEventListChangedEvent();
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
        this.sendTagListChangedEvent()
    }

    sendTagListChangedEvent() {
        this.dispatchEvent(
            new CustomEvent("tag-list-changed", {
                detail: {
                    tags: this.#tags.values().toArray()
                }
            })
        )
    }
}

export const model = new EventBuddyModel();