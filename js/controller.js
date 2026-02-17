import {model} from "./model/model.js";
import Event from "./model/event.js";
import Tag from "./model/tag.js";

class Controller {
    constructor(){
    }

    createEvent(title, datetime, location, description, icon) {
        let event = new Event({
            title: title,
            datetime: new Date(datetime),
            location: location,
            description: description,
            icon: icon
        });

        model.addEvent(event);
    }

    updateEvent(id, title, datetime, location, description, icon) {
        model.updateEvent(id, title, new Date(datetime), location, description, icon);
    }

    init(){
        document.querySelector("event-list").addEventListener("update-event", (e) => {
            let formData = e.detail.formData
            this.updateEvent(e.detail.id,formData.get("title"), formData.get("datetime"), formData.get("location"), formData.get("description"), formData.get("icon"));
        });

        document.querySelector("event-list").addEventListener("delete-event", (e) => {
            let confirmation = confirm("Are you sure you want to delete the event?")

            if (confirmation) {
                model.deleteEvent(e.detail)
            }
        });

        document.querySelector("event-list").addEventListener("add-tag-to-event", (e) => {
            console.log("Adding tag to event:")
            model.addTagToEvent(e.detail.id, e.detail.tag)
        });

        document.querySelector("event-list").addEventListener("delete-tag-from-event", (e) => {
            console.log("Deleting tag from event:")
            model.deleteTagFromEvent(e.detail.id, e.detail.tag)
        });

        document.querySelector("filter-bar").addEventListener("update-status-filter", (e) => {
            model.updateStatusFilters(e.detail);
        });

        document.querySelector("filter-bar").addEventListener("update-tag-filter", (e) => {
            model.updateTagFilters(e.detail);
        });

        document.getElementById("create-event-form").addEventListener("submit", (e) => {
            console.log(e)
            e.preventDefault();
            let formData = new FormData(e.target);
            this.createEvent(formData.get("title"), formData.get("datetime"), formData.get("location"), formData.get("description"), formData.get("icon"));
        });

        document.getElementById("tag-list").addEventListener("add-tag", (e) => {
            model.addTag(e.detail)
        })

        document.getElementById("tag-list").addEventListener("delete-tag", (e) => {
            if(model.canDeleteTag(e.detail)) {
                model.deleteTag(e.detail);
            } else {
                alert("Cannot delete the tag: it is still coupled to events.");
            }
        })

    }
}

export const controller = new Controller();