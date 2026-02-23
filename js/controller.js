import {model} from "./model/model.js";

class Controller {
    constructor(){
    }

    init(){
        fetch('../json/users.json')
            .then(response => response.json())
            .then(json => model.initializeFromJson(json));

        document.querySelector("event-management").addEventListener("add-event", this.handleAddEvent);

        document.querySelector("detailed-event-view").addEventListener("update-event", this.handleUpdateEvent);
        document.querySelector("detailed-event-view").addEventListener("delete-event", this.handleDeleteEvent);

        document.querySelector("event-list").addEventListener("add-tag-to-event", this.handleAddTagToEvent);
        document.querySelector("event-list").addEventListener("remove-tag-from-event", this.handleRemoveTagFromEvent);

        document.querySelector("event-list").addEventListener("add-participant-to-event", this.handleAddParticipantToEvent)
        document.querySelector("event-list").addEventListener("remove-participant-from-event", this.handleRemoveParticipantFromEvent)

        document.querySelector("filter-bar").addEventListener("update-status-filter", this.handleUpdateStatusFilter);
        document.querySelector("filter-bar").addEventListener("update-tags-filter", this.handleUpdateTagsFilter);
        document.querySelector("filter-bar").addEventListener("update-participants-filter", this.handleUpdateParticipantsFilter);
        document.querySelector("filter-bar").addEventListener("update-search", this.handleUpdateSearch);

        document.querySelector("detailed-event-view").addEventListener("update-event-participants", this.handleUpdateEventParticipants);

        document.querySelector("tag-list").addEventListener("add-tag", this.handleAddTag)
        document.querySelector("tag-list").addEventListener("edit-tag", this.handleEditTag)
        document.querySelector("tag-list").addEventListener("delete-tag", this.handleDeleteTag)

        document.querySelector("participant-list").addEventListener("add-participant", this.handleAddParticipant)
        document.querySelector("participant-list").addEventListener("delete-participant", this.handleDeleteParticipant)
        document.querySelector("participant-list").addEventListener("edit-participant", this.handleEditParticipant)

        document.querySelector("user-view").addEventListener("user-login", this.handleUserLogin);
        document.querySelector("user-view").addEventListener("user-logout", this.handleUserLogout)

    }



    /* EVENT MANAGEMENT */
    handleAddEvent = (e) => {
        model.addEvent(e.detail.title, e.detail.datetime, e.detail.location, e.detail.description, e.detail.icon, e.detail.tagIds);
    }

    handleUpdateEvent = (e) => {
        console.log("Updating event ")
        model.updateEvent(e.detail.id, e.detail.title, e.detail.datetime, e.detail.location, e.detail.description, e.detail.icon, e.detail.tagIds);
    }

    handleDeleteEvent = (e) => {
        model.deleteEvent(e.detail.eventId)
    }

    handleAddTagToEvent = (e) => {
        model.addTagToEvent(e.detail.id, e.detail.tag)
    }

    handleRemoveTagFromEvent = (e) => {
        model.deleteTagFromEvent(e.detail.id, e.detail.tag)
    }

    handleAddParticipantToEvent = (e) => {
       model.addParticipantToEvent(e.detail.id, e.detail.participantId)
    }

    handleRemoveParticipantFromEvent = (e) => {
       model.removeParticipantFromEvent(e.detail.id, e.detail.participantId)
    }

    handleUpdateEventParticipants = (e) => {
        model.updateEventParticipants(e.detail.eventId, e.detail.participantIds);
    }
    /* FILTER BAR */
    handleUpdateStatusFilter = (e) => {
        model.updateStatusFilters(e.detail.selectedOptions);
    }

    handleUpdateTagsFilter = (e) => {
        model.updateTagFilters(e.detail.selectedOptions);
    }

    handleUpdateParticipantsFilter = (e) => {
        model.updateParticipantFilters(e.detail.selectedOptions);
    }

    handleUpdateSearch = (e) => {
        model.updateSearchFilter(e.detail.searchInput.trim())
    }

    /* TAG MANAGEMENT */
    handleAddTag = (e) => {
        const tagName = e.detail.tagName.trim();
        if (!model.isValidTagName(tagName)) {
            alert("Unable to add tag: tag must be between 1 and 20 characters long")
            return;
        }

        if (model.tagAlreadyExists(tagName)) {
            alert("Unable to add tag: a tag with this name already exists!")
            return;
        }

        model.addTag(tagName)
    }

    handleEditTag = (e) => {
        const tagName = e.detail.tagName.trim();
        if (!model.isValidTagName(tagName)) {
            alert("Unable to add tag: tag must be between 1 and 20 characters long");
            return;
        }

        if (model.tagAlreadyExists(tagName, e.detail.tagId)) {
            alert("Unable to edit tag: a tag with this name already exists!")
            return;
        }

        model.updateTag(e.detail.tagId, tagName)
    }

    handleDeleteTag = (e) => {
        if(model.canDeleteTag(e.detail.tagId)) {
            const confirmation = confirm("Are you sure you want to delete the tag?")

            if (confirmation) {
                model.deleteTag(e.detail.tagId);
            }
        } else {
            alert("Cannot delete the tag: it is still coupled to events.");
        }
    }

    /* PARTICIPANT MANAGEMENT */
    handleAddParticipant = (e) => {
        const email = e.detail.email.toLowerCase()
        if (model.participantAlreadyExists(email)) {
            alert(`Cannot add participant: participant with email ${email} already exists`);
            return;
        }

        model.addParticipant(e.detail.name, email, e.detail.avatar)
    }

    handleDeleteParticipant =  (e) => {
        const confirmation = confirm("Are you sure you want to delete the participant? This will also delete them from all events.")

        if (confirmation) {
            model.deleteParticipant(e.detail.participantId)
        }
    }

    handleEditParticipant = (e) => {
        const email = e.detail.email.toLowerCase()
        const emailTaken = model.participantAlreadyExists(email, e.detail.participantId)

        if (emailTaken) {
            alert(`Cannot edit participant: participant with email ${email} already exists`)
        } else {
            model.updateParticipant(
                e.detail.participantId,
                e.detail.name,
                email,
                e.detail.avatar
            )
        }
    }

    /* USER */
    handleUserLogin = (e) => {
        model.login(e.detail.user)
    }

    handleUserLogout = (e) => {
        model.logout()
    }
}

export const controller = new Controller();