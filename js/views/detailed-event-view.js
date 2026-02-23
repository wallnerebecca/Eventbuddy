import {model} from "../model/model.js";
import {getLang, getDateString} from "./utilities.js";

class DetailedEventView extends HTMLElement {

    static observedAttributes = ['event-id']

    #events
    #availableTags
    #availableParticipants

    #activeEvent

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
            this.#availableTags = event.detail.tags.sort((a, b) => a.name <  b.name ? -1 : (a.name > b.name) ? 1 : 0);
            this.render();
        })
        model.addEventListener("participants-changed", (event) => {
            this.#availableParticipants = event.detail.participants.sort((a, b) => a.name <  b.name ? -1 : (a.name > b.name) ? 1 : 0);
            this.render();
        })
    }

    connectedCallback() {
        console.log("Connected Callback")
        this.render()
    }

    attributeChangedCallback(name, oldValue, newValue) {
        console.log(newValue);
        const event = this.#events.find(e => e.id === newValue)
        this.#activeEvent = event;
        console.log(this.#activeEvent)
        this.render();
    }

    render() {
        this.innerHTML = this.template();

        if (this.#activeEvent) {
            const participants = this.querySelector(".participants");

            const firstThreeParticipants = this.#activeEvent.participants.slice(0, 3)
            const remainingParticipants = this.#activeEvent.participants.slice(3)

            const firstThreeIcons = firstThreeParticipants.map((participant) => this.participantIcon(participant)).join('')

            participants.innerHTML = firstThreeIcons;

            if (remainingParticipants.length > 0) {
                const span = document.createElement("span")
                span.classList.add("pl-4", "text-lg")
                span.innerText = `+${remainingParticipants.length} going`;
                participants.appendChild(span)
            }

            const tagList = this.querySelector(".tag-list");

            this.#activeEvent.tags.values().toArray().forEach(tag => {
                tagList.appendChild(this.tagPill(tag))
            })

            const clearActiveEvent = document.querySelector("#clear-active-event")
            clearActiveEvent.addEventListener("click", () => {
                this.dispatchEvent(
                    new CustomEvent("cleared-active-event", {
                        bubbles: true,
                        detail: {}
                    })
                )
            })

            const participantsList = this.querySelector(".event-participants");
            const invitedParticipantsList = this.querySelector(".invited-participants-list-edit");
            if (this.#activeEvent.participants.length > 0) {
                this.#activeEvent.participants.forEach((participant) => {
                    participantsList.appendChild(this.participantPill(participant))
                    invitedParticipantsList.appendChild(this.participantPill(participant))
                })
            } else {
                participantsList.append("No Participants yet")
            }

            const host = this.querySelector(".host");
            if (this.#activeEvent.createdBy) {
                host.appendChild(this.hostPill(this.#activeEvent.createdBy))
            }

            const eventInfo = this.querySelector("#active-event-info")
            const editActiveEvent = this.querySelector("#edit-active-event")
            const manageActiveEventParticipants = this.querySelector("#manage-active-event-participants")

            const openEditActiveEvent = this.querySelector("#open-edit-active-event")
            const openManageActiveEventParticipants = this.querySelector("#open-manage-active-event-participants")
            const backToEventInfo = this.querySelector("#back-to-event-info")
            const deleteEventInfo = this.querySelector("#delete-event")
            const saveEvent = this.querySelector("#save-event")
            const saveParticipants = this.querySelector("#save-participants")

            openEditActiveEvent.addEventListener("click", () => {
                eventInfo.classList.add("hidden");
                editActiveEvent.classList.remove("hidden");

                openEditActiveEvent.classList.add("hidden");
                openManageActiveEventParticipants.classList.add("hidden");
                saveEvent.classList.remove("hidden");
                backToEventInfo.classList.remove("invisible");
                deleteEventInfo.classList.remove("invisible");
            })

            openManageActiveEventParticipants.addEventListener("click", () => {
                eventInfo.classList.add("hidden");
                manageActiveEventParticipants.classList.remove("hidden");

                openEditActiveEvent.classList.add("hidden")
                openManageActiveEventParticipants.classList.add("hidden");
                saveParticipants.classList.remove("hidden")
                backToEventInfo.classList.remove("invisible");
            })

            backToEventInfo.addEventListener("click", () => {
                eventInfo.classList.remove("hidden");
                editActiveEvent.classList.add("hidden");
                manageActiveEventParticipants.classList.add("hidden");

                openEditActiveEvent.classList.remove("hidden")
                openManageActiveEventParticipants.classList.remove("hidden");
                saveParticipants.classList.add("hidden")
                saveEvent.classList.add("hidden");
                backToEventInfo.classList.add("invisible");
                deleteEventInfo.classList.add("invisible");
            })

            deleteEventInfo.addEventListener("click", () => {

                console.log("Deleting event")
                const confirmation = confirm("Are you sure you want to delete the event?")

                if (confirmation) {
                    this.dispatchEvent(
                        new CustomEvent("delete-event", {
                            bubbles: true,
                            detail: {
                                eventId: this.#activeEvent.id
                            },
                        })
                    )
                    this.removeAttribute("event-id")
                }
            })
            saveParticipants.addEventListener("click", (e) => {
                e.preventDefault();
                this.saveParticipants();
            })

            this.fillInviteParticipantList()
            this.fillEditEventTagList()
            const editEventForm = this.querySelector(`#edit-event-form-${this.#activeEvent.id}`)
            const iconInput = this.querySelector("input#image")
            const editEventTagList = this.querySelector("#edit-event-tags-list");

            editEventForm.addEventListener("submit", (e) => {
                e.preventDefault();

                const selectedTagIds = []
                for (const item of editEventTagList.children) {
                    const input = item.querySelector("input")

                    if (input.checked) {
                        selectedTagIds.push(input.getAttribute("data-id"))
                    }
                }
                const formData = new FormData(e.target);
                const detail =
                    {
                        id: this.#activeEvent.id,
                        title: formData.get("title"),
                        datetime: new Date(formData.get("datetime")),
                        location: formData.get("location"),
                        description: formData.get("description"),
                        icon: iconInput.files[0],
                        tagIds: selectedTagIds
                    }

                console.log(detail)

                this.dispatchEvent(
                    new CustomEvent("update-event", {
                        bubbles: true,
                        detail: detail
                    })
                );
                console.log("Form Saved")
            })
        }
    }


    tagPill(tag) {
        const t = document.createElement("template");
        t.innerHTML = `
            <span class="rounded-full bg-orange-200 py-2 px-4 text-purple-950 text-2xl">${tag.name}</span>
        `

        return t.content
    }

    hostPill(host) {
        const t = document.createElement("template");
        const initial = host.name.charAt(0).toUpperCase()
        t.innerHTML = `
            <div class="flex gap-2 items-center justify-between">
                <div class="h-12 w-12 rounded-full bg-gray-300 border-purple-300 flex items-center justify-center">
                    <span class="text-3xl">${initial}</span>    
                </div>
                <span class="font-sigmar-one py-2 px-4 text-white text-2xl truncate">${host.name}</span>
            </div>
            
        `

        return t.content
    }
    participantPill(participant) {
        const t = document.createElement("template");
        const nameParts = participant.name.split(' ')
        const lastNameInitial = `${nameParts.at(-1).charAt(0).toUpperCase()}.`
        const name = `${nameParts.slice(0, -1).join(" ")} ${lastNameInitial}`

        t.innerHTML = `
            <div class="rounded-full h-10 p-2 border-2 border-solid text-white border-purple-950 flex items-center">
                ${this.participantIcon(participant)}
                <span class="font-sigmar-one rounded-full py-2 px-4 text-2xl truncate">${name}</span>
            </div>
            
        `

        return t.content
    }
    participantIcon(participant) {
        const initial = participant.name.charAt(0).toUpperCase()

        return `
            <span class="group w-8 h-8 bg-gray-300 rounded-full border-2 -ml-1 border-purple-300 text-center">
                <span>${initial}</span>
                <div class="w-fit text-nowrap relative group-hover:opacity-100 -translate-y-full z-10 transition-opacity bg-purple-950 px-1 text-sm text-white rounded-md opacity-0 m-4">${participant.name}</div>
            </span>    
        `
    }

    fillEditEventTagList() {
        const editEventTagsList = this.querySelector("#edit-event-tags-list");

        const tagIds = this.#activeEvent.tags.values().toArray().map(t => t.id)
        const search = this.querySelector("input.search-tags");
        search.addEventListener("input", (e) => {
            this.searchTagsList(search.value)
        })

        this.#availableTags.map((tag) => {
            const element = this.dropDownElement(tag)


            const checkBox = element.querySelector("input");
            checkBox.checked = tagIds.includes(tag.id)
            checkBox.addEventListener("change", (e) => {
                e.preventDefault()
            })
            editEventTagsList.appendChild(element)
        })
    }

    fillInviteParticipantList() {
        const inviteParticipantList = this.querySelector("#invite-participant-list");

        const participantIds = this.#activeEvent.participants.map(p => p.id)
        const search = this.querySelector("input.search-participants");
        search.addEventListener("input", (e) => {
            this.searchParticipantList(search.value)
        })

        this.#availableParticipants.map((participant) => {
            const element = this.dropDownElement(participant)


            const checkBox = element.querySelector("input");
            checkBox.checked = participantIds.includes(participant.id)
            checkBox.addEventListener("change", (e) => {
                e.preventDefault()
            })
            inviteParticipantList.appendChild(element)
        })
    }

    saveParticipants() {
        const inviteParticipantList = this.querySelector("#invite-participant-list");

        const selectedParticipantIds = []
        for (const item of inviteParticipantList.children) {
            const input = item.querySelector("input")

            if (input.checked) {
                selectedParticipantIds.push(input.getAttribute("data-id"))
            }
        }

        this.dispatchEvent(new CustomEvent("update-event-participants", {
            bubbles: true,
            detail: {
                eventId: this.#activeEvent.id,
                participantIds: selectedParticipantIds
            }
        }));
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

    searchParticipantList(name) {
        const inviteParticipantList = this.querySelector("#invite-participant-list");

        for (const participant of inviteParticipantList.children) {
            if (participant.getAttribute("data-name").toLowerCase().includes(name.toLowerCase())) {
                participant.classList.remove("hidden");
                participant.classList.add("block")
            } else {
                participant.classList.remove("block")
                participant.classList.add("hidden");
            }
        }
    }

    searchTagsList(name) {
        const editEventTagsList = this.querySelector("#edit-event-tags-list");

        for (const tag of editEventTagsList.children) {
            if (tag.getAttribute("data-name").toLowerCase().includes(name.toLowerCase())) {
                tag.classList.remove("hidden");
                tag.classList.add("block")
            } else {
                tag.classList.remove("block")
                tag.classList.add("hidden");
            }
        }
    }
    template() {
        if (this.#activeEvent) {
            return `
                <div class="sm:hidden box-border w-full flex justify-start pt-10 pb-4 h-1/8">
                    <div class="aspect-square bg-light-purple/50 rounded-full flex items-center justify-center"><span id="clear-active-event" class="material-symbols-rounded font-bold! text-5xl!">arrow_back</span></div>
                </div>
                <div class="box-border grid grid-cols-1 grid-rows-[auto_1fr_auto] w-full py-4 sm:py-2 h-7/8 sm:h-full rounded-4xl bg-light-purple p-2">
                    <div class="w-full row-start-1">
                        <div class="mb-1 flex items-center bg-light-purple rounded-2xl p-1">
                            <div class="flex flex-col justify-center">
                                <div class="pl-1 font-sigmar-one col-start-4 col-span-17 row-start-1 text-2xl text-purple-950">
                                  ${this.#activeEvent.title}
                                </div>
                            
                                <div class="pl-1 font-open-sans col-start-4 col-span-17 row-start-2 text-white text-xl">
                                  <span><span class="material-symbols-rounded">location_on</span>${this.#activeEvent.location}</span>
                                  <span class="px-2"/>
                                  <span><span class="material-symbols-rounded">schedule</span> ${this.#activeEvent.datetime.toLocaleString(getLang(), {dateStyle: "long", timeStyle: "short"})}</span>
                                </div>
                            
                                <div class="pl-1 font-open-sans col-start-4 col-span-17 row-start-3 text-white">
                                  <div class="participants flex"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="w-full row-start-2 box-border h-full max-h-full">
                        <div id="active-event-info" class="h-full">
                            <div class="tag-list flex items-center gap-2 flex-wrap"></div>
                            <div class="text-purple-950">
                                <span class="text-2xl font-sigmar-one">Description</span>
                                <p class="font-open-sans">${this.#activeEvent.description}</p>                    
                            </div>
                            
                            <div class="w-full text-purple-950">
                                <span class="text-2xl font-sigmar-one">Participants</span>
                                <div class="event-participants flex items-center gap-2 flex-wrap w-full">
                                </div>
                            </div>
                        </div>
                        <div id="edit-active-event" class="hidden h-full">
                            <div id="edit-event-${this.#activeEvent.id}" class="px-2 text-2xl h-full flex flex-col text-white">
                                
                                    <div class="grow h-0 overflow-y-auto">
                                        <form id="edit-event-form-${this.#activeEvent.id}" action="#">
                                        <div class="flex flex-col items-stretch">
                                            <label for="title" class="" >Title:</label>
                                            <input form="edit-event-form-${this.#activeEvent.id}" value="${this.#activeEvent.title}" id="title" name="title" type="text" class="rounded-full px-4 bg-orange-200 text-purple-950 py-2 mb-3" required>
                            
                                            <label for="datetime" class="mt-2" >Date:</label>
                                            <input form="edit-event-form-${this.#activeEvent.id}" value="${getDateString(this.#activeEvent.datetime)}" id="datetime" name="datetime" type="datetime-local" class="rounded-full px-4 bg-orange-200 text-purple-950 py-2 mb-3" required>
                                    
                                            <label for="location" class="mt-2" >Location:</label>
                                            <input form="edit-event-form-${this.#activeEvent.id}" value="${this.#activeEvent.location}" id="location" name="location" type="text" class="rounded-full px-4 bg-orange-200 text-purple-950  py-2 mb-3" required>
                                    
                                            <label for="description" class=mt-2" >Event Description:</label>
                                            <textarea form="edit-event-form-${this.#activeEvent.id}" id="description" name="description" type="text" class="rounded-3xl h-40 px-4 bg-orange-200 text-purple-950 py-2 mb-3" required>${this.#activeEvent.description}</textarea>
                                    
                                            <label for="image" class="mt-2" >Event Banner (png or jpeg):</label>
                                            <input form="edit-event-form-${this.#activeEvent.id}" id="image" name="image" type="file" accept="image/png, image/jpeg" class="rounded-full px-4 bg-orange-200 text-purple-950 py-2 mb-3" >
                                            
                                            <label class="mt-2">Tags:</label>
                                            <div class="h-80 text-purple-950 flex flex-col">
                                                <div class="grow-0 relative block w-full">
                                                    <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                                                        <span class="material-symbols-rounded text-5xl!">search</span>
                                                    </div>
                                                    <input type="search" class="search-tags h-full w-full p-3 ps-15 bg-orange-200 rounded-t-4xl  py-2 mb-3 rounded-b-none text-2xl focus:outline-none  placeholder:text-purple-950 [&::-webkit-search-cancel-button]:appearance-none" placeholder="Find Tags..."/>
                                                </div>
                                                <div id="edit-event-tags-list" class="grow h-0 overflow-y-auto w-full bg-orange-200  py-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300">
                                                </div>
                                                <div class="w-full rounded-b-4xl h-8 grow-0 bg-orange-200 py-2"></div>
                                            </div>
                                        </div>
                                        </form>   
                                    </div>
                            </div>
                        </div>
                        <div id="manage-active-event-participants" class="hidden h-full overflow-y-auto">
                            <div class="grid grid-rows-3 grid-cols-1 box-border p-2 h-full">
                                <div class="row-start-1 row-span-2 flex flex-col">
                                    <span class="text-2xl font-sigmar-one text-purple-950 grow-0">Invited</span>
                                    <div class="w-full grow overflow-y-auto">
                                        <div class="invited-participants-list-edit w-fit grow flex flex-col gap-1">
                                           
                                        </div>
                                    </div>
                                </div>
                                <div class="row-start-3 row-span-1 flex justify-center">
                                    <div class="w-7/8 h-full text-purple-950 flex flex-col">
                                        <div class="grow-0 relative block w-full">
                                            <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                                                <span class="material-symbols-rounded text-5xl!">search</span>
                                            </div>
                                            <input type="search" class="search-participants h-full w-full p-3 ps-15 bg-purple-950/20 rounded-t-4xl rounded-b-none text-2xl focus:outline-none  placeholder:text-purple-950 [&::-webkit-search-cancel-button]:appearance-none" placeholder="Find Participants..."/>
                                        </div>
                                        <div id="invite-participant-list" class="grow h-0 overflow-y-auto w-full bg-purple-950/20 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300">
                                        </div>
                                        <div class="w-full rounded-b-4xl h-8 grow-0 bg-purple-950/20"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                           
                    <div class="w-full row-start-3 py-2 flex justify-between">
                        <div class="flex gap-2">
                            <div id="back-to-event-info" class="invisible h-12 w-12 p-2 rounded-full text-orange-400 bg-purple-950"><span class="material-symbols-rounded text-3xl! font-bold!">arrow_back</span></div>
                            <button id="delete-event" class="invisible h-12 p-2 rounded-full text-orange-400 bg-purple-950"><span class="material-symbols-rounded text-3xl! font-bold!">delete</span></button>
                        </div>
                                
                        <div class="text-purple-950 px-1 flex justify-end">
                            <div class="flex items-center gap-2 flex-nowrap">
                                <div class="host"></div>
                                <div id="open-edit-active-event" class="h-12 w-12 p-2 rounded-full text-orange-400 bg-purple-950"><span class="material-symbols-rounded text-3xl! font-bold!">edit</span></div>
                                <div id="open-manage-active-event-participants" class="h-12 w-12 p-2 rounded-full text-orange-400 bg-purple-950"><span class="material-symbols-rounded text-3xl! font-bold!">person_edit</span></div>
                                <div id="save-participants" class="hidden h-12 p-2 rounded-full text-orange-400 bg-purple-950"><span class="text-2xl font-sigmar-one">Save</span></div>
                                <button type="submit" form="edit-event-form-${this.#activeEvent.id}" id="save-event" class="hidden h-12 p-2 rounded-full text-orange-400 bg-purple-950"><span class="text-2xl font-sigmar-one">Save</span></button>
                            </div>
                        </div>
                    </div>
                </div>
            `
        } else {
            return `<div class="w-full h-full rounded-4xl bg-light-purple"></div>`
        }
    }

}

customElements.define('detailed-event-view', DetailedEventView)