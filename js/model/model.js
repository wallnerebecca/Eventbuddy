class EventBuddyModel extends EventTarget {

    #eventList

    constructor() {
        super();
        this.#eventList = [];
    }

    get eventList() {
        return this.#eventList
    }

    addEvent(event) {
       console.log(`Adding event ${event.name}: ${event.description}`);
       this.#eventList.push(event);
       console.log(this.#eventList.map(event => { return event.name; }));
       this.dispatchEvent(
           new CustomEvent("add-event", {
              detail: event
           })
       );
    }


}

export const model = new EventBuddyModel();