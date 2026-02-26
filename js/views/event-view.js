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

    template() {
        return `
            <div class="mb-1 flex bg-light-purple rounded-2xl p-1">           
              
              <div class="w-20 h-20 bg-purple-950 rounded-xl text-orange-400 font-bold flex items-center justify-center shrink-0">
                <div class="flex flex-col items-center justify-center">
                  <span class="text-2xl font-sigmar-one">
                    ${this.#event.datetime.toLocaleString(getLang(), { month: "short"}).toUpperCase()}
                  </span>
                  <span class="text-4xl leading-none font-sigmar-one">
                    ${this.#event.datetime.toLocaleString(getLang(), { day: "numeric" })}
                  </span>
                </div>
              </div>
            
              <div class="flex flex-col justify-between pl-2 flex-1">
            
                <div class="font-sigmar-one text-2xl text-purple-950">
                  ${this.#event.title}
                </div>
            
                <div class="font-open-sans text-white text-xl flex items-center gap-2">
                  <span class="flex items-center gap-1">
                    <span class="material-symbols-rounded">location_on</span>
                    ${this.#event.location}
                  </span>
            
                  <span class="flex items-center gap-1">
                    <span class="material-symbols-rounded">schedule</span>
                    ${this.#event.datetime.toLocaleTimeString(getLang(), {timeStyle: "short"})}
                  </span>
                </div>
            
                <div class="font-open-sans text-white">
                  <div class="participants flex"></div>
                </div>
            
              </div>
            </div>
        `
    }
}
customElements.define("event-list-item", EventListItem);

class EventList extends HTMLElement {

    #events

    constructor() {
        super();
        this.#events = [];
        model.addEventListener("event-list-changed", (event) => {
            this.#events = event.detail.events;
            this.render();
        });
    }

    connectedCallback() {
        this.render()
    }

    render() {
        this.innerHTML = "";
        this.appendChild(this.header().content); // no need to clone, only used once

        const list = this.querySelector("div.event-list");
        this.#events.map(event => {
            const eventListItem = new EventListItem(event);
            eventListItem.addEventListener("click", (e) => {
                this.dispatchEvent(
                    new CustomEvent("active-event-changed", {
                        detail: {
                            id: event.id
                        }
                    })
                )
            })
            list.appendChild(eventListItem);
        });
    }

    header() {
        const header = document.createElement("template");
        header.innerHTML = `
            <div class="event-list px-1">
            </div>
        `;

        return header;
    }

}

customElements.define('event-list', EventList)