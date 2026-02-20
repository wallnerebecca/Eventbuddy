import {model} from "./model/model.js";

class Controller {
    constructor(){
    }

    init(){
        fetch('../json/users.json')
            .then(response => response.json())
            .then(json => json.users.forEach(user => model.addUser(user)));

        document.querySelector("event-management").addEventListener("submit", this.handleAddEvent);

        document.querySelector("event-list").addEventListener("update-event", this.handleUpdateEvent);
        document.querySelector("event-list").addEventListener("delete-event", this.handleDeleteEvent);
        document.querySelector("event-list").addEventListener("add-tag-to-event", this.handleAddTagToEvent);
        document.querySelector("event-list").addEventListener("remove-tag-from-event", this.handleRemoveTagFromEvent);
        document.querySelector("event-list").addEventListener("add-participant-to-event", this.handleAddParticipantToEvent)
        document.querySelector("event-list").addEventListener("remove-participant-from-event", this.handleRemoveParticipantFromEvent)

        document.querySelector("filter-bar").addEventListener("update-status-filter", this.handleUpdateStatusFilter);
        document.querySelector("filter-bar").addEventListener("update-tags-filter", this.handleUpdateTagsFilter);
        document.querySelector("filter-bar").addEventListener("update-participants-filter", this.handleUpdateParticipantsFilter);

        document.querySelector("tag-list").addEventListener("add-tag", this.handleAddTag)
        document.querySelector("tag-list").addEventListener("delete-tag", this.handleDeleteTag)

        document.querySelector("participant-list").addEventListener("add-participant", this.handleAddParticipant)
        document.querySelector("participant-list").addEventListener("delete-participant", this.handleDeleteParticipant)

        document.querySelector("user-view").addEventListener("user-selected", this.handleSelectUser);
    }



    /* EVENT MANAGEMENT */
    handleAddEvent = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        model.addEvent(formData.get("title"), new Date(formData.get("datetime")), formData.get("location"), formData.get("description"), formData.get("icon"));
    }
    handleUpdateEvent = (e) => {
        const formData = e.detail.formData
        model.updateEvent(e.detail.id, formData.get("title"), new Date(formData.get("datetime")), formData.get("location"), formData.get("description"), formData.get("icon"));
    }

    handleDeleteEvent = (e) => {
        const confirmation = confirm("Are you sure you want to delete the event?")

        if (confirmation) {
            model.deleteEvent(e.detail.eventId)
        }
    }

    handleAddTagToEvent = (e) => {
        model.addTagToEvent(e.detail.id, e.detail.tag)
    }

    handleRemoveTagFromEvent = (e) => {
        model.deleteTagFromEvent(e.detail.id, e.detail.tag)
    }

    handleAddParticipantToEvent = (e) => {
       model.addParticipantToEvent(e.detail.id, e.detail.email)
    }

    handleRemoveParticipantFromEvent = (e) => {
       model.removeParticipantFromEvent(e.detail.id, e.detail.email)
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

    /* TAG MANAGEMENT */
    handleAddTag = (e) => {
        const tagName = e.detail.tagName.trim();
        if (model.isValidTagName(tagName)) {
            model.addTag(tagName)
        } else {
            alert("Unable to add tag: tag must be between 1 and 20 characters long")
        }
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
        model.addParticipant(e.detail.name, e.detail.email.toLowerCase(), e.detail.avatar)
    }

    handleDeleteParticipant =  (e) => {
        const confirmation = confirm("Are you sure you want to delete the participant? This will also delete them from all events.")

        if (confirmation) {
            model.deleteParticipant(e.detail.participantEmail)
        }
    }

    /* USER */
    handleSelectUser = (e) => {
        model.setActiveUser(e.detail.user)
    }
}

export const controller = new Controller();