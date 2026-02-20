class EventManagement extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.render();
    }

    render() {
        this.innerHTML = this.template();
    }

    template() {
        return `
            <div class="border px-4 py-4">
                <h2 class="text-2xl underline">Event Management:</h2>
                <form id="create-event-form" action="#">
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
                    
                    <button id="create-event" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">Create Event</button>
                </form>
            </div>
        `
    }
}

customElements.define('event-management', EventManagement);