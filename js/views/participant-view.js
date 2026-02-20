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
                        participantEmail: this.#participant.email
                    }
                })
            )
        });
    }
    avatar() {
        if (this.#participant.avatar.size > 0) {
            const imgSrc = URL.createObjectURL(this.#participant.avatar);

            return `<img src=${imgSrc} width="200" height="200" alt="${this.#participant.name}'s avatar"/>`;
        } else {
            return ``
        }
    }

    template() {
        return `
            <div>
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

        container.querySelector("#add-participant-form").addEventListener("submit", e => {
            e.preventDefault();
            const formData = new FormData(e.target);
            console.log(formData)
            this.dispatchEvent(new CustomEvent("add-participant", {
                detail: {
                    name: formData.get("name"),
                    email: formData.get("email"),
                    avatar: formData.get("avatar")
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