import {model} from "../model/model.js";

class EventManagement extends HTMLElement {

    #availableTags = []

    constructor() {
        super();
    }

    connectedCallback() {
        model.addEventListener("tag-list-changed", (event) => {
            this.#availableTags = event.detail.tags.sort((a, b) => a.name <  b.name ? -1 : (a.name > b.name) ? 1 : 0);
            this.render();
        })
        this.render();

    }

    render() {
        this.innerHTML = this.template();
        this.fillCreateEventTagList()
        const fileInput = this.querySelector("input#cimage")
        const createEventTagsList = this.querySelector("#create-event-tags-list");
        const form = this.querySelector("#create-event-form");
        form.addEventListener("submit", e => {
            e.preventDefault();


            const selectedTagIds = []
            for (const item of createEventTagsList.children) {
                const input = item.querySelector("input")

                if (input.checked) {
                    selectedTagIds.push(input.getAttribute("data-id"))
                }
            }
            const formData = new FormData(e.target);
            const detail =
                {
                    title: formData.get("title"),
                    datetime: new Date(formData.get("datetime")),
                    location: formData.get("location"),
                    description: formData.get("description"),
                    icon: fileInput.files[0],
                    tagIds: selectedTagIds
                }

            console.log(detail)

            this.dispatchEvent(
                new CustomEvent("add-event", {
                    bubbles: true,
                    detail: detail
                })
            );
            console.log("Form Saved")
        })
    }

    template() {
        return `
            <div id="create-event" class="p-2 text-2xl h-full flex flex-col text-white">      
                <div class="grow h-0 overflow-y-auto">
                    <form id="create-event-form" action="#">
                    <div class="flex flex-col items-stretch">
                        <label for="ctitle">Title:</label>
                        <input form="create-event-form" id="ctitle" name="title" type="text" class="rounded-full px-4 bg-orange-200 text-purple-950 py-2 mb-3" required>
        
                        <label for="cdatetime" class="mt-2" >Date:</label>
                        <input form="create-event-form" id="cdatetime" name="datetime" type="datetime-local" class="rounded-full px-4 bg-orange-200 text-purple-950 py-2 mb-3" required>
                
                        <label for="clocation" class="mt-2" >Location:</label>
                        <input form="create-event-form" id="clocation" name="location" type="text" class="rounded-full px-4 bg-orange-200 text-purple-950  py-2 mb-3" required>
                
                        <label for="cdescription" class=mt-2" >Event Description:</label>
                        <textarea form="create-event-form" id="cdescription" name="description" type="text" class="rounded-3xl h-40 px-4 bg-orange-200 text-purple-950 py-2 mb-3" required></textarea>
                
                        <label for="cimage" class="mt-2" >Event Banner (png or jpeg):</label>
                        <input form="create-event-form" id="cimage" name="image" type="file" accept="image/png, image/jpeg" class="rounded-full px-4 bg-orange-200 text-purple-950 py-2 mb-3" >
                        
                        <label class="mt-2">Tags:</label>
                        <div class="h-80 text-purple-950 flex flex-col">
                            <div class="grow-0 relative block w-full">
                                <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                                    <span class="material-symbols-rounded text-5xl!">search</span>
                                </div>
                                <input type="search" class="search-tags h-full w-full p-3 ps-15 bg-orange-200 rounded-t-4xl  py-2 mb-3 rounded-b-none text-2xl focus:outline-none  placeholder:text-purple-950 [&::-webkit-search-cancel-button]:appearance-none" placeholder="Find Tags..."/>
                            </div>
                            <div id="create-event-tags-list" class="grow h-0 overflow-y-auto w-full bg-orange-200  py-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300">
                            </div>
                            <div class="w-full rounded-b-4xl h-8 grow-0 bg-orange-200 py-2"></div>
                        </div>
                        
                        <button type="submit" class="self-center mt-2 p-2 rounded-full text-orange-400 bg-purple-950"><span class="text-2xl font-sigmar-one">Create Event</span></button>
                    </div>
                    </form>   
                </div>
            </div>
        `
    }

    fillCreateEventTagList() {
        const createEventTagsList = this.querySelector("#create-event-tags-list");

        const search = this.querySelector("input.search-tags");
        search.addEventListener("input", (e) => {
            this.searchTagsList(search.value)
        })

        this.#availableTags.map((tag) => {
            const element = this.dropDownElement(tag)

            const checkBox = element.querySelector("input");
            checkBox.addEventListener("change", (e) => {
                e.preventDefault()
            })
            createEventTagsList.appendChild(element)
        })
    }
    searchTagsList(name) {
        const createEventTagsList = this.querySelector("#create-event-tags-list");

        for (const tag of createEventTagsList.children) {
            if (tag.getAttribute("data-name").toLowerCase().includes(name.toLowerCase())) {
                tag.classList.remove("hidden");
                tag.classList.add("block")
            } else {
                tag.classList.remove("block")
                tag.classList.add("hidden");
            }
        }
    }
    dropDownElement(item) {
        const template = document.createElement("template")
        template.innerHTML = `
            <div class="block px-4 py-2 hover:bg-light-purple/30 cursor-pointer w-full" data-name="${item.name}">
                <div class="flex items-center gap-2"><input type="checkbox" class="w-6 h-6 rounded shrink-0" data-id="${item.id}"><span class="truncate text-3xl">${item.name}</span></div>
            </div>
        `;

        return template.content.cloneNode(true).firstElementChild
    }
}

customElements.define('event-management', EventManagement);