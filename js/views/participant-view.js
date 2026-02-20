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

        const deleteButton = this.querySelector(`button.delete`)
        deleteButton.addEventListener("click", ()=> {
            participantList.dispatchEvent(
                new CustomEvent("delete-participant", {
                    detail: {
                        participantId: this.#participant.id
                    }
                })
            )
        });

        const showParticipant = this.querySelector(".show-participant");
        const editParticipant = this.querySelector(".edit-participant");
        editParticipant.style.display = "none"

        const editButton = this.querySelector(`button.edit`)
        editButton.addEventListener("click", ()=> {
            showParticipant.style.display = "none";
            editParticipant.style.display = "block";
        })

        const cancelButton = this.querySelector(`button.cancel`)
        cancelButton.addEventListener("click", (e)=> {
            e.preventDefault()
            showParticipant.style.display = "block";
            editParticipant.style.display = "none";
        })

        const nameInput = this.querySelector(".name-input");
        const emailInput = this.querySelector(".email-input");
        const avatarInput = this.querySelector(".avatar-input");

        const saveButton = this.querySelector(`button.save`)
        saveButton.addEventListener("click", (e)=> {
            e.preventDefault()

            showParticipant.style.display = "block";
            editParticipant.style.display = "none";

            participantList.dispatchEvent(
                new CustomEvent("edit-participant", {
                    detail: {
                        participantId: this.#participant.id,
                        name: nameInput.value,
                        email: emailInput.value,
                        avatar: avatarInput.files[0]
                    }
                })
            )
        })
    }
    avatar() {
        if (this.#participant.avatar) {
            const imgSrc = URL.createObjectURL(this.#participant.avatar);

            return `<img src=${imgSrc} width="200" height="200" alt="${this.#participant.name}'s avatar"/>`;
        } else {
            return ``
        }
    }

    template() {
        return `
            <div class="show-participant">
                ${this.avatar()}
                <span class="font-bold">Name:</span> ${this.#participant.name} <br />
                <span class="font-bold">Email:</span> ${this.#participant.email} <br />
                <button class="edit bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                    Edit
                </button>
                <button class="delete bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                    Delete
                </button>
            </div>
            <div class="edit-participant">
                <form class="edit-participant-form" action="#">
                    <label for="name" class="mb-2" >Name:</label><br>
                    <input id="name" name="name" type="text" class="name-input border shadow py-2 mb-3" value="${this.#participant.name}" required><br>
    
                    <label for="email" class="mb-2" >Email:</label><br>
                    <input id="email" name="email" type="email" class="email-input border shadow py-2 mb-3" value="${this.#participant.email}" required><br>
    
                    <label for="avatar" class="mb-2" >Avatar (png or jpeg):</label><br>
                    <input id="avatar" name="avatar" type="file" accept="image/png, image/jpeg" class="avatar-input border shadow py-2 mb-3"><br>
    
                    <button class="save bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">Save</button>
                    <button class="cancel bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Cancel</button>
                </form>
            </div>
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
        this.innerHTML = "";
        const container = document.createElement("div")
        container.classList.add("border", "px-4", "py-4")

        container.appendChild(
            this.header().content
        )
        this.#participants.map(participant => {
            container.appendChild(this.participantItem(participant))
        });

        container.appendChild(this.createParticipantForm().content)

        const avatar = container.querySelector("#avatar")

        container.querySelector("#add-participant-form").addEventListener("submit", e => {
            e.preventDefault();
            const formData = new FormData(e.target);
            console.log(formData)
            this.dispatchEvent(new CustomEvent("add-participant", {
                detail: {
                    name: formData.get("name"),
                    email: formData.get("email"),
                    avatar: avatar.files[0]
                }
            }))
        })
        this.appendChild(container)
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