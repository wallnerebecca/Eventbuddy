import {model} from "./model/model.js";
import Event from "./model/event.js";
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

        document.getElementById("create-event-form").addEventListener("submit", (e) => {
            console.log(e)
            console.log(e.target.elements.namedItem("datetime").value)
            e.preventDefault();
            let formData = new FormData(e.target);
            this.createEvent(formData.get("title"), formData.get("datetime"), formData.get("location"), formData.get("description"), formData.get("icon"));
        });

    }
}

export const controller = new Controller();