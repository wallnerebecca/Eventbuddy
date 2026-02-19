import {model} from "../model/model.js";
import {button} from "./templates.js";

class EventItem extends HTMLElement {

    #event
    #availableTags
    #availableParticipants

    constructor(event, availableTags, availableParticipants) {
        super();
        this.#event = event;
        this.#availableTags = availableTags;
        this.#availableParticipants = availableParticipants;
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

       const select = document.createElement("select");
        select.classList.add("add-tag-dropdown");
        select.style.display = "none";
        const chooseTag = document.createElement("option")
        chooseTag.selected = true
        chooseTag.disabled = true
        chooseTag.value = ""
        chooseTag.text = "-- choose tag --"

        select.appendChild(chooseTag)
        this.#availableTags.map(tag => {
            const option = document.createElement("option");
            option.value = tag.id;
            option.text = tag.name;

            select.appendChild(option);
        })
        select.addEventListener("change", (e) => {
            console.log(e);
            eventList.dispatchEvent(
                new CustomEvent("add-tag-to-event", {
                    detail: {
                        id: this.#event.id,
                        tag: select.value
                    }
                })
            )
        })

        const button = document.createElement("button");
        button.classList.add("bg-amber-500", "px-2", "py-2")
        button.textContent = "Add Tag"
        button.addEventListener("click", () => {
            select.style.display = "block";
            button.style.display = "none";
        })

        const tagList = this.querySelector(`#tags-list-${this.#event.id}`)
        console.log(tagList)
        this.#event.tags.values().toArray().map(tag => {
            const pill = document.createElement("template")
            pill.innerHTML = `
                <span class="inline bg-blue-500 hover:bg-blue-700 text-white py-2 px-2 rounded">
                    ${tag.name} <button class="cursor-pointer z-10">&times;</button>
                </span>
            `


            const element = pill.content
            const deleteButton = element.querySelector("button")
            deleteButton.addEventListener("click", (e) => {
                eventList.dispatchEvent(
                    new CustomEvent("delete-tag-from-event", {
                        detail: {
                            id: this.#event.id,
                            tag: tag.id,
                        }
                    })
                )
            })

            tagList.append(element)
        })
        tagList.append(button);
        tagList.append(select);


        const participantSelect = document.createElement("select");
        participantSelect.classList.add("add-participant-dropdown");
        const chooseParticipant = document.createElement("option")
        chooseParticipant.selected = true
        chooseParticipant.disabled = true
        chooseParticipant.value = ""
        chooseParticipant.text = "-- choose participant --"

        participantSelect.appendChild(chooseParticipant)
        this.#availableParticipants.map(participant => {
            const option = document.createElement("option");
            option.value = participant.email;
            option.text = `${participant.name} (${participant.email})`;

            participantSelect.appendChild(option);
        })

        const addParticipantButton = document.createElement("button");
        addParticipantButton.classList.add("bg-blue-500", "hover:bg-blue-700", "text-white", "font-bold", "py-2", "px-4", "rounded", "focus:outline-none", "focus:shadow-outline");
        addParticipantButton.textContent = "Add Participant";
        addParticipantButton.addEventListener("click", (e) => {
            console.log(e);
            eventList.dispatchEvent(
                new CustomEvent("add-participant-to-event", {
                    detail: {
                        id: this.#event.id,
                        email: participantSelect.value
                    }
                })
            )
        })

        const participantList = this.querySelector(`.participant-list`)
        console.log(participantList)
        this.#event.participants.map(participant => {
            const span = document.createElement("span");
            span.innerHTML = `
                ${participant.name} (${participant.email}) <button class="font-bold cursor-pointer z-10">&times;</button>
            `

            participantList.append(span)

            const deleteButton = span.querySelector("button");
            deleteButton.addEventListener("click", (e) => {
                eventList.dispatchEvent(
                    new CustomEvent("remove-participant-from-event", {
                        detail: {
                            id: this.#event.id,
                            email: participant.email,
                        }
                    })
                )
            })
            participantList.append(document.createElement("br"))
        })
        participantList.append(participantSelect)
        participantList.append(addParticipantButton)
    }

    getCreatedBy() {
        if (this.#event.createdBy) {
            return `<h3>Created by: ${this.#event.createdBy.name} (${this.#event.createdBy.email})</h3>`
        } else {
            return `<h3>Created by: Anonymous</h3>`
        }
    }

    template() {
        const eventId = this.#event.id;

        return `
            <div class="border px-4 py-4 backdrop-grayscale-25">
                <div id="event-info-${eventId}">
                    <span><span class="text-2xl">${this.#event.title} - ${this.#event.status.description}</span> <span class="text-sm">(${eventId})</span></span>
                    <h3 class="text-xl">${this.#event.location} - ${this.#event.datetime.toLocaleString(this.getLang())} (local time)</h3>
                    ${this.getCreatedBy()}
                    <div id="tags-list-${eventId}">
                    </div>
                    <p>${this.#event.description}</p>
                    
                    <h3>Participants</h3><hr class="py-2"/>
                    <div class="participant-list">
                    
                    </div>
                    <hr class="py-2"/>
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
                <div>
                  Available Tags: ${JSON.stringify(this.#availableTags)}
                </div>
            </div>
        `
    }

}

customElements.define('event-item', EventItem)

class EventList extends HTMLElement {

    #events
    #availableTags
    #availableParticipants

    constructor() {
        super();
        this.#events = [];
        this.#availableTags = []
        this.#availableParticipants = []
        model.addEventListener("event-list-changed", (event) => {
            this.#events = event.detail;
            this.render();
        });
        model.addEventListener("tag-list-changed", (event) => {
            this.#availableTags = event.detail
            this.render();
        })
        model.addEventListener("participants-changed", (event) => {
            this.#availableParticipants = event.detail
            this.render();
        })
    }

    connectedCallback() {
        this.render()
    }

    render() {
        console.log(`Rerendering events: ${this.#events}`)
        console.log(this.#availableTags)
        console.log(this.#availableParticipants)
        this.innerHTML = "";
        this.appendChild(this.header().content); // no need to clone, only used once
        this.#events.map(event => {
            this.appendChild(new EventItem(event, this.#availableTags, this.#availableParticipants))
        });
    }

    header() {
        let header = document.createElement("template");
        header.innerHTML = `
            <h1 class="text-3xl text-amber-600">Event List:</h1>
        `;

        return header;
    }

}

customElements.define('event-list', EventList)