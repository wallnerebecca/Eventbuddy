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
        document.querySelector("event-list").addEventListener("delete-tag-from-event", this.handleDeleteTagFromEvent);
        document.querySelector("event-list").addEventListener("add-participant-to-event", this.handleAddParticipantToEvent)
        document.querySelector("event-list").addEventListener("remove-participant-from-event", this.handleRemoveParticipantFromEvent)

        document.querySelector("filter-bar").addEventListener("update-status-filter", this.handleStatusFilterUpdate);
        document.querySelector("filter-bar").addEventListener("update-tag-filter", this.handleTagFilterUpdate);
        document.querySelector("filter-bar").addEventListener("update-participant-filter", this.handleParticipantFilterUpdate);

        document.querySelector("tag-list").addEventListener("add-tag", this.handleAddTag)
        document.querySelector("tag-list").addEventListener("delete-tag", this.handleDeleteTag)

        document.querySelector("participant-list").addEventListener("add-participant", this.handleAddParticipant)
        document.querySelector("participant-list").addEventListener("delete-participant", this.handleDeleteParticipant)

        document.querySelector("user-view").addEventListener("user-selected", this.handleSelectUser);
    }



    /* EVENT MANAGEMENT */
    handleAddEvent = (e) => {
        e.preventDefault();
        let formData = new FormData(e.target);
        model.addEvent(formData.get("title"), new Date(formData.get("datetime")), formData.get("location"), formData.get("description"), formData.get("icon"));
    }
    handleUpdateEvent = (e) => {
        let formData = e.detail.formData
        model.updateEvent(e.detail.id, formData.get("title"), new Date(formData.get("datetime")), formData.get("location"), formData.get("description"), formData.get("icon"));
    }

    handleDeleteEvent = (e) => {
        let confirmation = confirm("Are you sure you want to delete the event?")

        if (confirmation) {
            model.deleteEvent(e.detail)
        }
    }

    handleAddTagToEvent = (e) => {
        model.addTagToEvent(e.detail.id, e.detail.tag)
    }

    handleDeleteTagFromEvent = (e) => {
        console.log("Deleting tag from event:")
        model.deleteTagFromEvent(e.detail.id, e.detail.tag)
    }

    handleAddParticipantToEvent = (e) => {
       model.addParticipantToEvent(e.detail.id, e.detail.email)
    }

    handleRemoveParticipantFromEvent = (e) => {
       model.removeParticipantFromEvent(e.detail.id, e.detail.email)
    }

    /* FILTER BAR */
    handleStatusFilterUpdate = (e) => {
        model.updateStatusFilters(e.detail);
    }

    handleTagFilterUpdate = (e) => {
        model.updateTagFilters(e.detail);
    }

    handleParticipantFilterUpdate = (e) => {
        model.updateParticipantFilters(e.detail);
    }

    /* TAG MANAGEMENT */
    handleAddTag = (e) => {
        model.addTag(e.detail)
    }

    handleDeleteTag = (e) => {
        if(model.canDeleteTag(e.detail)) {
            const confirmation = confirm("Are you sure you want to delete the tag?")

            if (confirmation) {
                model.deleteTag(e.detail);
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
        let confirmation = confirm("Are you sure you want to delete the participant? This will also delete them from all events.")

        if (confirmation) {
            model.deleteParticipant(e.detail)
        }
    }

    /* USER */
    handleSelectUser = (e) => {
        model.setActiveUser(e.detail.user)
    }
}

export const controller = new Controller();