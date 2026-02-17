import {model} from "../model/model.js";
import {button} from "./templates.js";

class EventItem extends HTMLElement {

    #event

    constructor() {
        super();
    }

    set event(event) {
        this.#event = event;
        console.log(this.#event.datetime)
        this.render();
    }

    connectedCallback() {
        this.render();
    }

    getLang() {
        if (navigator.languages !== undefined)
            return navigator.languages[0];
        return navigator.language;
    }

    setFormValues(formName, values = {}) {
        const form = document.forms[formName];
        const inputs = form.elements;

        Object.entries(values).forEach(([name, value]) => {
            inputs.namedItem(name).value = value;
        });
    }

    render() {
        this.innerHTML = this.template();
        let eventList = document.querySelector("event-list");

        let deleteButton = this.querySelector(`#delete-${this.#event.id}`)
        deleteButton.addEventListener("click", ()=> {
           eventList.dispatchEvent(
                new CustomEvent("delete-event", {
                    detail: this.#event.id
                })
            )
        });

        let eventInfo = this.querySelector(`#event-info-${this.#event.id}`)
        let editEvent = this.querySelector(`#edit-event-${this.#event.id}`)
        editEvent.hidden = true;

        let editButton = this.querySelector(`#edit-${this.#event.id}`)
        editButton.addEventListener("click", ()=> {
            eventInfo.hidden = true;
            editEvent.hidden = false;
        });

        let cancelEditButton = this.querySelector(`#cancel-edit-${this.#event.id}`)
        cancelEditButton.addEventListener("click", ()=> {
            eventInfo.hidden = false;
            editEvent.hidden = true;
        });

        let form = this.querySelector(`#edit-event-form-${this.#event.id}`)
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            eventList.dispatchEvent(
                new CustomEvent("update-event", {
                    detail: {
                        id: this.#event.id,
                        formData: new FormData(e.target)
                    }
                })
            );
        });

        const getDateString = (date) => {
            const newDate = date ? new Date(date) : new Date();
            return new Date(newDate.getTime() - newDate.getTimezoneOffset() * 60000).toISOString().slice(0, -1);
        };

        let prefilledValues = {
            title: this.#event.title,
            datetime: getDateString(this.#event.datetime),
            location: this.#event.location,
            description: this.#event.description,
            image: this.#event.icon
        }

        Object.entries(prefilledValues).forEach(([name, value]) => {
            form.elements.namedItem(name).value = value;
        });


    }

    template() {
        const eventId = this.#event.id;

        return `
            <div class="border px-4 py-4 backdrop-grayscale-25">
                <div id="event-info-${eventId}">
                    <span><span class="text-2xl">${this.#event.title}</span> <span class="text-sm">(${eventId})</span></span>
                    <h3 class="text-xl">${this.#event.location} - ${this.#event.datetime.toLocaleString(this.getLang())} (local time)</h3>
                    <p>${this.#event.description}</p>
                    
                    ${button(`edit-${eventId}`, "Edit Event")}
                    ${button(`delete-${eventId}`, "Delete Event")}
                </div>
                <div id="edit-event-${eventId}">
                    <form id="edit-event-form-${this.#event.id}" action="#">
                        <label for="title" class="mb-2" >Title:</label><br>
                        <input id="title" name="title" type="text" class="border shadow py-2 mb-3" required><br>
                
                        <label for="datetime" class="mb-2" >Date:</label><br>
                        <input id="datetime" name="datetime" type="datetime-local" class="border shadow py-2 mb-3" required><br>
                
                        <label for="location" class="mb-2" >Location:</label><br>
                        <input id="location" name="location" type="text" class="border shadow py-2 mb-3" required><br>
                
                        <label for="description" class=mb-2" >Event Description:</label><br>
                        <input id="description" name="description" type="text" class="border shadow py-2 mb-3" required><br>
                
                        <label for="image" class="mb-2" >Event Banner (png or jpeg):</label><br>
                        <input id="image" name="image" type="file" accept="image/png, image/jpeg" class="border shadow py-2 mb-3" ><br>
                        <button type="submit" id="update-event-${eventId}" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                            Save
                        </button>
                        ${button(`cancel-edit-${eventId}`, "Cancel")}
                    </form>   
                </div>
            </div>
        `
    }

}

customElements.define('event-item', EventItem)

class EventList extends HTMLElement {

    #events
    constructor() {
        super();
        this.#events = [];
        model.addEventListener("event-list-changed", (event) => {
            this.#events = event.detail;
            this.render();
        });
    }

    connectedCallback() {
        this.render()
    }

    render() {
        console.log(`Rerendering events: ${this.#events}`)
        this.innerHTML = "";
        this.appendChild(this.header().content); // no need to clone, only used once
        this.#events.map(event => {
            this.appendChild(this.eventItem(event))
        });
    }

    header() {
        let header = document.createElement("template");
        header.innerHTML = `
            <h1 class="text-3xl text-amber-600">Event List:</h1>
        `;

        return header;
    }

    eventItem(event) {
        let eventItem = document.createElement("event-item");
        eventItem.event = event;
        return eventItem
    }

}

customElements.define('event-list', EventList)