import {model} from "../model/model.js";

class EventItem extends HTMLElement {

    #event

    constructor() {
        super();
        this.shadow = this.attachShadow({mode: 'open'});
    }

    set event(event) {
        this.#event = event;
        this.render();
    }

    connectedCallback() {
        this.render();
    }

    render() {
        this.shadow.innerHTML = this.template();
    }

    template() {
        return `
            <h2>${this.#event.name}</h2>
            <p>${this.#event.description}</p>
        `
    }

}

customElements.define('event-item', EventItem)

class EventList extends HTMLElement {

    constructor() {
        super();
        this.shadow = this.attachShadow({mode: 'open'});
        model.addEventListener("add-event", (event) => {
            this.appendEvent(event.detail);
        });
    }

    connectedCallback() {
        this.render()
    }

    appendEvent(event) {
        let eventItem = new EventItem();
        eventItem.event = event;
        this.shadow.appendChild(eventItem);
    }

    render() {
        this.shadow.innerHTML = this.template();
        // this.#events.map((myEvent) => {
        //     let eventItem = new EventItem()
        //     eventItem.event = myEvent;
        //     this.shadow.appendChild(eventItem);
        // });
    }

    template() {
        return `
            <h1 class="text-3xl text-amber-600">Event List:</h1>
        `
    }
}

customElements.define('event-list', EventList)