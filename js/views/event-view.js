import {model} from "../model/model.js";
import {getLang} from "./utilities.js";

class EventListItem extends HTMLElement {

    #event

    constructor(event) {
        super();
        this.#event = event;
    }

    connectedCallback() {
        this.render();
    }

    render() {
      this.innerHTML = this.template();

      const participants = this.querySelector(".participants");

      const firstThreeParticipants = this.#event.participants.slice(0, 3)
      const remainingParticipants = this.#event.participants.slice(3)

      const firstThreeIcons = firstThreeParticipants.map((participant) => this.participantIcon(participant)).join('')
      console.log(firstThreeParticipants);
      participants.innerHTML = firstThreeIcons;

      if (remainingParticipants.length > 0) {
          const span = document.createElement("span")
          span.classList.add("pl-4", "text-lg")
          span.innerText = `+${remainingParticipants.length} going`;
          participants.appendChild(span)
      }
    }


    participantIcon(participant) {
        const initial = participant.name.charAt(0).toUpperCase()

        return `
            <span class="group w-7 h-7 bg-gray-300 rounded-full border-2 border-purple-300 -ml-2 first:ml-0 text-center">
                <span>${initial}</span>
                <div class="w-fit text-nowrap relative group-hover:opacity-100 -translate-y-full z-10 transition-opacity bg-purple-950 px-1 text-sm text-white rounded-md opacity-0 m-4">${participant.name}</div>
            </span>    
        `
    }

    // leading none
    template() {
        return `
            <div class="mb-1 grid grid-cols-20 grid-rows-3 bg-light-purple rounded-2xl p-1">
                <div class="aspect-square row-start-1 col-start-1 col-span-3 row-span-3 bg-purple-900 rounded-xl text-orange-400 font-bold justify-center items-center">
                    <div class="flex flex-col items-center justify-center">
                        <span class="text-2xl font-sigmar-one">${this.#event.datetime.toLocaleString(getLang(), { month: "short"}).toUpperCase()}</span>
                        <span class="text-4xl leading-none font-sigmar-one">${this.#event.datetime.toLocaleString(getLang(), { day: "numeric" })}</span> 
                    </div>
                </div>
                
                <div class="pl-1 font-sigmar-one col-start-4 col-span-17 row-start-1 text-2xl">
                  ${this.#event.title}
                </div>
            
                <div class="pl-1 col-start-4 col-span-17 row-start-2">
                  <span>📍 ${this.#event.location}</span>
                  <span class="px-8"/>
                  <span>🕒 ${this.#event.datetime.toLocaleTimeString(getLang())}</span>
                </div>
            
                <div class="pl-1 col-start-4 col-span-17 row-start-3">
                  <div class="participants flex">
                  </div>
                </div>
            </div>
        `
    }
}
customElements.define("event-list-item", EventListItem);

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

    getDateString = (date) => {
        const newDate = date ? new Date(date) : new Date();
        return new Date(newDate.getTime() - newDate.getTimezoneOffset() * 60000).toISOString().slice(0, -1);
    };

    render() {
        this.innerHTML = this.template();

        const deleteButton = this.querySelector(`#delete-${this.#event.id}`)
        deleteButton.addEventListener("click", ()=> {
           this.dispatchEvent(
                new CustomEvent("delete-event", {
                    bubbles: true,
                    detail: {
                        eventId: this.#event.id
                    },
                })
            )
        });

        const eventInfo = this.querySelector(`#event-info-${this.#event.id}`)
        const editEvent = this.querySelector(`#edit-event-${this.#event.id}`)
        editEvent.hidden = true;

        const editButton = this.querySelector(`#edit-${this.#event.id}`)
        editButton.addEventListener("click", ()=> {
            eventInfo.hidden = true;
            editEvent.hidden = false;
        });

        const cancelEditButton = this.querySelector(`#cancel-edit-${this.#event.id}`)
        cancelEditButton.addEventListener("click", ()=> {
            eventInfo.hidden = false;
            editEvent.hidden = true;
        });

        const form = this.querySelector(`#edit-event-form-${this.#event.id}`)
        const iconInput = form.querySelector("#image")
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            this.dispatchEvent(
                new CustomEvent("update-event", {
                    bubbles: true,
                    detail: {
                        id: this.#event.id,
                        title: formData.get("title"),
                        datetime: new Date(formData.get("datetime")),
                        location: formData.get("location"),
                        description: formData.get("description"),
                        icon: iconInput.files[0]
                    }
                })
            );
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
            this.dispatchEvent(
                new CustomEvent("add-tag-to-event", {
                    bubbles: true,
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
                this.dispatchEvent(
                    new CustomEvent("remove-tag-from-event", {
                        bubbles: true,
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
            option.value = participant.id;
            option.text = `${participant.name} (${participant.email})`;

            participantSelect.appendChild(option);
        })

        const addParticipantButton = document.createElement("button");
        addParticipantButton.classList.add("bg-blue-500", "hover:bg-blue-700", "text-white", "font-bold", "py-2", "px-4", "rounded", "focus:outline-none", "focus:shadow-outline");
        addParticipantButton.textContent = "Add Participant";
        addParticipantButton.addEventListener("click", (e) => {
            this.dispatchEvent(
                new CustomEvent("add-participant-to-event", {
                    bubbles: true,
                    detail: {
                        id: this.#event.id,
                        participantId: participantSelect.value
                    }
                })
            )
        })

        const participantList = this.querySelector(`.participant-list`)
        this.#event.participants.map(participant => {
            const span = document.createElement("span");
            span.innerHTML = `
                ${participant.name} (${participant.email}) <button class="font-bold cursor-pointer z-10">&times;</button>
            `

            participantList.append(span)

            const deleteButton = span.querySelector("button");
            deleteButton.addEventListener("click", (e) => {
                this.dispatchEvent(
                    new CustomEvent("remove-participant-from-event", {
                        bubbles: true,
                        detail: {
                            id: this.#event.id,
                            participantId: participant.id,
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

    icon() {
        if (this.#event.icon) {
            const imgSrc = URL.createObjectURL(this.#event.icon);

            return `<img src=${imgSrc} width="200" height="200" alt="${this.#event.title}'s icon"/>`;
        } else {
            return ``
        }
    }

    template() {
        const eventId = this.#event.id;

        return `
            <div class="border px-4 py-4 bg-light-purple">
                <div id="event-info-${eventId}">
                    <span><span class="text-2xl">${this.#event.title} - ${this.#event.status.description}</span> <span class="text-sm">(${eventId})</span></span>
                    ${this.icon()}
                    <h3 class="text-xl">${this.#event.location} - ${this.#event.datetime.toLocaleString(this.getLang())} (local time)</h3>
                    ${this.getCreatedBy()}
                    <div id="tags-list-${eventId}">
                    </div>
                    <p>${this.#event.description}</p>
                    
                    <h3>Participants</h3><hr class="py-2"/>
                    <div class="participant-list">
                    
                    </div>
                    <hr class="py-2"/>
                    <button id="edit-${eventId}" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                        Edit Event
                    </button>
                    <button id="delete-${eventId}" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                        Delete Event
                    </button>
                </div>
                <div id="edit-event-${eventId}">
                    <form id="edit-event-form-${this.#event.id}" action="#">
                        <label for="title" class="mb-2" >Title:</label><br>
                        <input value="${this.#event.title}" id="title" name="title" type="text" class="border shadow py-2 mb-3" required><br>
                
                        <label for="datetime" class="mb-2" >Date:</label><br>
                        <input value="${this.getDateString(this.#event.datetime)}" id="datetime" name="datetime" type="datetime-local" class="border shadow py-2 mb-3" required><br>
                
                        <label for="location" class="mb-2" >Location:</label><br>
                        <input value="${this.#event.location}" id="location" name="location" type="text" class="border shadow py-2 mb-3" required><br>
                
                        <label for="description" class=mb-2" >Event Description:</label><br>
                        <input value="${this.#event.description}" id="description" name="description" type="text" class="border shadow py-2 mb-3" required><br>
                
                        <label for="image" class="mb-2" >Event Banner (png or jpeg):</label><br>
                        <input id="image" name="image" type="file" accept="image/png, image/jpeg" class="border shadow py-2 mb-3" ><br>
                        <button type="submit" id="update-event-${eventId}" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                            Save
                        </button>
                        <button id="cancel-edit-${eventId}" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                            Cancel
                        </button>
                    </form>   
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
            this.#events = event.detail.events;
            this.render();
        });
        model.addEventListener("tag-list-changed", (event) => {
            this.#availableTags = event.detail.tags
            this.render();
        })
        model.addEventListener("participants-changed", (event) => {
            this.#availableParticipants = event.detail.participants
            this.render();
        })
    }

    connectedCallback() {
        this.render()
    }

    render() {
        this.innerHTML = "";
        this.appendChild(this.header().content); // no need to clone, only used once

        const list = this.querySelector("div.event-list");
        const list2 = this.querySelector("div.event-list2");
        this.#events.map(event => {
            list.appendChild(new EventListItem(event));
            list2.appendChild(new EventItem(event, this.#availableTags, this.#availableParticipants))
        });
    }

    header() {
        const header = document.createElement("template");
        header.innerHTML = `
            <h1 class="text-3xl text-amber-600">Event List:</h1>
            <div class="event-list px-1">
            
            </div>
            <hr class="py-12">
            <div class="event-list2">
            
            </div>
        `;

        return header;
    }

}

customElements.define('event-list', EventList)