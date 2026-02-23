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

    initializeFromJson(data) {
        data.users.forEach(user => this.addUser(user))
        data.tags.forEach(tag => this.addTag(tag))
        data.participants.forEach(participant => this.addParticipant(participant.name, participant.email))
        data.events.forEach(event => {
            const eventId = this.#addEvent(
                event.name,
                new Date(event.datetime),
                event.location,
                event.description,
                undefined,
                this.#users.find(user => user.email === event.createdBy),
                []
            )

            event.participants.forEach(participantEmail => {
                const participant = this.#participants.values().toArray().find(p => p.email === participantEmail)

                this.#addParticipantToEvent(eventId, participant.id)
            })

            event.tags.forEach(tagName => {
                const tag = this.#tags.values().toArray().find(t => t.name === tagName)

                this.#addTagToEvent(eventId, tag.id)
            })
        })
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
        this.#sendUpdateActiveUserEvent()
    }

    logout() {
        this.#activeUser = undefined;
        this.#sendUpdateActiveUserEvent()
    }

    #sendUpdateActiveUserEvent() {
        this.dispatchEvent(
            new CustomEvent("update-active-user", {
                detail: {
                    user: this.#activeUser
                }
            })
        )
    }

    #addEvent(title,
              datetime,
              location,
              description,
              icon,
              createdBy,
              tagIds) {
        const event = new Event(title,
            datetime,
            location,
            description,
            icon,
            createdBy
        )
        console.log(`Adding event ${event.id}: ${event.title}`);
        event.updateTags(tagIds.map(t => this.#tags.get(t)))
        this.#events.set(event.id, event);

        this.#sendEventListChangedEvent();
        return event.id;
    }

    addEvent(title,
             datetime,
             location,
             description,
             icon,
             tagIds) {
        this.#addEvent(title, datetime, location, description, icon, this.#activeUser, tagIds)
    }

    updateEvent(id,
                title,
                datetime,
                location,
                description,
                icon,
                tags) {
        console.log(`Updating event ${id}`);
        const event = this.#events.get(id);
        event.title = title;
        event.datetime = datetime;
        event.location = location;
        event.description = description;
        event.icon = icon;

        event.updateTags(tags.map(t => this.#tags.get(t)));

        this.#sendEventListChangedEvent();
    }

    deleteEvent(id) {
        console.log(`Deleting event ${id}`);
        this.#events.delete(id);
        this.#sendEventListChangedEvent();
    }

    #sendEventListChangedEvent() {

        const filteredEvents =
            this.#events
                .values()
                .toArray()
                .filter(event => {
                    const selectedStatuses = this.#filters.getFilterValues("status") || [];
                    if(selectedStatuses.length > 0) {
                        return selectedStatuses.includes(event.status.description);
                    }
                    return true;
                })
                .filter(event => {
                    const selectedTagIds = this.#filters.getFilterValues("tag") || [];

                    if(selectedTagIds.length > 0) {
                        const eventTagIds = event.tags.keys().toArray();

                        const intersection = eventTagIds.filter(tag => selectedTagIds.includes(tag))

                        return intersection.length > 0;
                    }

                    return true;
                })
                .filter(event => {
                    const selectedParticipantIds = this.#filters.getFilterValues("participant") || [];


                    if(selectedParticipantIds.length > 0) {
                        const eventParticipantIds = event.participants.map(participant => participant.id)


                        const intersection = eventParticipantIds.filter(tag => selectedParticipantIds.includes(tag))

                        return intersection.length > 0;
                    }

                    return true;
                })
                .filter(event => {
                    const searchFilter = this.#filters.getFilterValues("search") || ''


                    if (searchFilter) {
                        return event.title.toLowerCase().includes(searchFilter.toLowerCase());
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
        this.#sendEventListChangedEvent();
    }

    updateTagFilters(selectedOptions) {
        console.log(`Updating tag filters with ${JSON.stringify(selectedOptions)} selectedOptions`);
        this.#filters.setFilterValues("tag", selectedOptions || []);
        this.#sendEventListChangedEvent();
    }

    updateParticipantFilters(selectedOptions) {
        console.log(`Updating participant filters with ${JSON.stringify(selectedOptions)} selectedOptions`);
        this.#filters.setFilterValues("participant", selectedOptions || []);
        this.#sendEventListChangedEvent();
    }

    updateSearchFilter(searchInput) {
        console.log(`Updating search filter with ${JSON.stringify(searchInput)} searchInput`);

        this.#filters.setFilterValues("search", searchInput);
        this.#sendEventListChangedEvent();
    }
    // Participant
    addParticipant(
        name,
        email,
        avatar
    ) {
        const participant = new Participant(name, email, avatar)
        console.log(`Adding participant with email ${email}`);

        this.#participants.set(participant.id, participant)
        this.#sendParticipantsChangedEvent()
    }

    participantAlreadyExists(email, id) {
        if (id) {
            return this.#participants.values().toArray().some(participant => (participant.email === email && participant.id !== id));
        } else {
            return this.#participants.values().some(participant => participant.email === email);
        }
    }

    updateParticipant(
        id,
        name,
        email,
        avatar
    ) {
        const participant = this.#participants.get(id)
        participant.name = name;
        participant.email = email;
        participant.avatar = avatar;


        this.#sendEventListChangedEvent();
        this.#sendParticipantsChangedEvent();

    }

    #addParticipantToEvent(eventId, participantId) {
        const participant = this.#participants.get(participantId)
        const event = this.#events.get(eventId)

        if (event && participant) {
            event.addParticipant(participant)
            this.#sendEventListChangedEvent();
        }
    }

    updateEventParticipants(eventId, participantIds) {
        const participants = participantIds.map(id => this.#participants.get(id))
        const event = this.#events.get(eventId)

        if (event) {
            event.updateParticipants(participants);
            this.#sendEventListChangedEvent()
        }
    }

    deleteParticipant(participantId) {
        console.log(`Deleting participant with email ${participantId}`);

        const participant = this.#participants.get(participantId)
        this.#participants.delete(participantId)

        this.#events.values().toArray().map(event => {
            event.removeParticipant(participant)
        })

        this.#sendParticipantsChangedEvent()
        this.#sendEventListChangedEvent()
    }

    #sendParticipantsChangedEvent() {
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
        const tag = new Tag(tagName)
        console.log(`Adding tag ${tag}`);

        this.#tags.set(tag.id, tag);
        this.#sendTagListChangedEvent()
    }

    updateTag(tagId, tagName) {
        const tag = this.#tags.get(tagId)
        tag.name = tagName

        this.#sendEventListChangedEvent()
        this.#sendTagListChangedEvent()
    }

    isValidTagName(tagName) {
        return tagName.length > 0 && tagName.length < 20;
    }

    tagAlreadyExists(tagName, id) {
        if (id) {
            return this.#tags.values().toArray().some(t => t.name.toLowerCase() === tagName.toLowerCase() && t.id !== id)
        } else {
            return this.#tags.values().toArray().some(t => t.name.toLowerCase() === tagName.toLowerCase())
        }
    }

    #addTagToEvent(eventId, tagId) {
        const tag = this.#tags.get(tagId)
        const event = this.#events.get(eventId)

        if (event && tag) {
            event.addTag(tag);
            this.#sendEventListChangedEvent();
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
        this.#sendTagListChangedEvent()
    }

    #sendTagListChangedEvent() {
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