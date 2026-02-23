import {model} from "../model/model.js";

class ParticipantItem extends HTMLElement {

    #participant

    constructor() {
        super();
    }

    set participant(participant) {
        this.#participant = participant;
    }

    connectedCallback() {
        this.render();
    }

    render() {
        this.innerHTML = this.template();

        const participantList = document.querySelector("participant-list");

        const deleteButton = this.querySelector(`button.delete-participant`)
        deleteButton.addEventListener("click", ()=> {
            participantList.dispatchEvent(
                new CustomEvent("delete-participant", {
                    detail: {
                        participantId: this.#participant.id
                    }
                })
            )
        });
    }

    get editButton() {
        return this.querySelector("button.edit-participant")
    }

    avatar() {
        if (this.#participant.avatar) {
            const imgSrc = URL.createObjectURL(this.#participant.avatar);

            return `<img src=${imgSrc} class="rounded-full border border-solid border-purple-950 h-12 w-12" alt="${this.#participant.name}'s avatar"/>`;
        } else {
            return ``
        }
    }

    template() {
        return `
            <span class="rounded-full bg-orange-200 py-2 px-4 text-purple-950 text-2xl flex items-center">
                ${this.avatar()}<span>${this.#participant.name}</span> <button type="button" class="edit-participant cursor-pointer material-symbols-rounded z-10">edit</button><button type="button" class="delete-participant cursor-pointer material-symbols-rounded z-10">close</button>
            </span>
        `
    }

}

customElements.define('participant-item', ParticipantItem);

class ParticipantList extends HTMLElement {

    #participants

    constructor() {
        super();
        this.#participants = [];
        model.addEventListener("participants-changed", (event) => {
            this.#participants = event.detail.participants;
            this.render();
        });
    }

    connectedCallback() {
        this.render()
    }

    render() {
        this.innerHTML = this.template();

        const participantList = this.querySelector("#all-participants-list")
        const editParticipantForm = this.querySelector("#edit-participant-form");

        const addParticipantSection = this.querySelector("#add-participant-section");
        const editParticipantSection = this.querySelector("#edit-participant-section");
        const cancelParticipantEdit = editParticipantSection.querySelector(".cancel-participant-edit");

        this.#participants.map(participant => {
            console.log("Participant:")
            console.log(`${participant.id}: ${participant.name}: ${participant.email}`);
            const participantItem = this.participantItem(participant)
            participantItem.setAttribute("data-name", participant.name)

            console.log(participantList)
            participantList.appendChild(participantItem)
            console.log(participantList)

            participantItem.editButton.addEventListener("click", () =>{
                addParticipantSection.classList.add("hidden")
                editParticipantSection.classList.remove("hidden")

                editParticipantForm.setAttribute("data-id", participant.id)
                editParticipantForm.querySelector("#edit-participant-name").value = participant.name
                editParticipantForm.querySelector("#edit-participant-email").value = participant.email
            })
        })

        cancelParticipantEdit.addEventListener("click", () =>{
            addParticipantSection.classList.remove("hidden")
            editParticipantSection.classList.add("hidden")

            editParticipantForm.removeAttribute("data-id")

            editParticipantForm.querySelector("#edit-participant-name").value = ""
            editParticipantForm.querySelector("#edit-participant-email").value = ""

        })

        const searchParticipants = this.querySelector(".search-participants");
        searchParticipants.addEventListener("input", e => {
            this.searchParticipantList(searchParticipants.value)
        })

        const fileInput = this.querySelector("#add-participant-avatar")
        this.querySelector("#add-participant-form").addEventListener("submit", e => {
            e.preventDefault();
            const formData = new FormData(e.target)
            participantList.dispatchEvent(
                new CustomEvent("add-participant", {
                    bubbles: true,
                    detail: {
                        name: formData.get("name"),
                        email: formData.get("email"),
                        avatar: fileInput.files[0]
                    }
                })
            )
        })

        const editFileInput = this.querySelector("#edit-participant-avatar")
        editParticipantForm.addEventListener("submit", e => {
            e.preventDefault();
            const formData = new FormData(e.target)
            participantList.dispatchEvent(
                new CustomEvent("edit-participant", {
                    bubbles: true,
                    detail: {
                        participantId: editParticipantForm.getAttribute("data-id"),
                        name: formData.get("name"),
                        email: formData.get("email"),
                        avatar: editFileInput.files[0]
                    }
                })
            )
        })
    }

    searchParticipantList(name) {
        const participantList = this.querySelector("#all-participants-list");

        for (const participant of participantList.children) {
            if (participant.getAttribute("data-name").toLowerCase().includes(name.toLowerCase())) {
                participant.classList.remove("hidden");
                participant.classList.add("block")
            } else {
                participant.classList.remove("block")
                participant.classList.add("hidden");
            }
        }
    }
    template() {
        return `
            <div id="manage-participants" class="p-2 text-2xl h-full flex flex-col text-white">
                <div class="grow h-0 overflow-y-auto">
                    <div class="font-sigmar-one text-3xl">Participants:</div>
                    <div class="px-1 py-1 relative flex">
                        <div class="relative block w-fit pr-2">
                            <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                                <span class="material-symbols-rounded text-purple-950 text-5xl!">search</span>
                            </div>
                            <input type="search" class="search-participants h-full w-full p-3 ps-15 bg-orange-200 rounded-full text-2xl focus:outline-none text-purple-950 placeholder:text-purple-950 [&::-webkit-search-cancel-button]:appearance-none" placeholder="Filter participants..."/>
                        </div>
                    </div>
                    <div id="all-participants-list" class="h-fit py-4 flex gap-1 flex-wrap">
    
                    </div>
                </div>
                <div class="grow h-0 overflow-y-auto">
                    <div id="add-participant-section">
                        <div class="font-sigmar-one text-3xl">Add Participant:</div>
                        <form id="add-participant-form" action="#">
                            <label for="add-participant-name" class="mb-2" >Name</label><br>
                            <input id="add-participant-name" name="name" type="text" class="rounded-full px-4 bg-orange-200 text-purple-950  py-2 mb-3" required><br>
                            
                            <label for="add-participant-email" class="mb-2" >Email</label><br>
                            <input id="add-participant-email" name="email" type="email" class="rounded-full px-4 bg-orange-200 text-purple-950  py-2 mb-3" required><br>
                            
                            <label for="add-participant-avatar" class="mb-2" >Avatar (png or jpeg)</label><br>
                            <input id="add-participant-avatar" name="avatar" type="file" accept="image/png, image/jpeg" class="rounded-full px-4 bg-orange-200 text-purple-950  py-2 mb-3"><br>
    
                            <button type="submit" class="self-center mt-2 p-2 rounded-full text-orange-400 bg-purple-950"><span class="text-2xl font-sigmar-one">Add Participant</span></button>
                        </form>
                    </div>
                    <div id="edit-participant-section" class="hidden">
                        <div class="font-sigmar-one text-3xl">Edit Participant:</div>
                        <form id="edit-participant-form" action="#">
                            <label for="edit-participant-name" class="mb-2" >Name</label><br>
                            <input id="edit-participant-name" name="name" type="text" class="rounded-full px-4 bg-orange-200 text-purple-950  py-2 mb-3" required><br>
                            
                            <label for="edit-participant-email" class="mb-2" >Email</label><br>
                            <input id="edit-participant-email" name="email" type="email" class="rounded-full px-4 bg-orange-200 text-purple-950  py-2 mb-3" required><br>
                            
                            <label for="edit-partiicpant-avatar" class="mb-2" >Avatar (png or jpeg)</label><br>
                            <input id="edit-participant-avatar" name="avatar" type="file" accept="image/png, image/jpeg" class="rounded-full px-4 bg-orange-200 text-purple-950  py-2 mb-3"><br>
    
                            <button type="submit" class="self-center mt-2 p-2 rounded-full text-orange-400 bg-purple-950"><span class="text-2xl font-sigmar-one">Edit Participant</span></button>
                            <button type="button" class="cancel-participant-edit self-center mt-2 p-2 rounded-full text-orange-400 bg-purple-950"><span class="text-2xl font-sigmar-one">Cancel</span></button>
                        </form>
                    </div>
                </div>
            </div>
        `
    }
    header() {
        const header = document.createElement("template");
        header.innerHTML = `
            <h1 class="text-2xl underline">Participant Management:</h1>
            <h2 class="text-xl font-bold py-2">Participants:</h2>
        `;

        return header;
    }

    createParticipantForm() {
        const participantForm = document.createElement("template");
        participantForm.innerHTML = `
            <h2 class="text-xl font-bold py-2">Add Participant:</h2>
            <form id="add-participant-form" action="#">
                <label for="name" class="mb-2" >Name:</label><br>
                <input id="name" name="name" type="text" class="border shadow py-2 mb-3" required><br>

                <label for="email" class="mb-2" >Email:</label><br>
                <input id="email" name="email" type="email" class="border shadow py-2 mb-3" required><br>

                <label for="avatar" class="mb-2" >Avatar (png or jpeg):</label><br>
                <input id="avatar" name="avatar" type="file" accept="image/png, image/jpeg" class="border shadow py-2 mb-3"><br>

                <button id="add-participant" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">Add Participant</button>
            </form>
        `

        return participantForm;
    }

    participantItem(participant) {
        const participantItem = document.createElement("participant-item");
        participantItem.participant = participant;
        return participantItem
    }



}

customElements.define('participant-list', ParticipantList)