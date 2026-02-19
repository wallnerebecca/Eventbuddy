import {model} from "../model/model.js";

class UserView extends HTMLElement {

    #sortedUsers

    constructor() {
        super();
        this.#sortedUsers = []
    }

    connectedCallback() {
        model.addEventListener("users-updated", e => {
            this.#sortedUsers = e.detail.sort((a, b) => a.name <  b.name ? -1 : (a.name > b.name) ? 1 : 0);
            this.render();
        })
        this.render();
    }

    render() {
        this.innerHTML = this.template();

        const userSelect = this.querySelector("#user");

        const empty = document.createElement("option");
        empty.value = ''
        empty.text = '-- select user --'

        userSelect.appendChild(empty)
        this.#sortedUsers.map((user) => {
            let option = document.createElement("option");
            option.value = user.email;
            option.text = `${user.name} (${user.email})`;
            userSelect.appendChild(option)
        })

        userSelect.onchange = (e) => {
            const selectedUser = this.#sortedUsers.find(user => user.email === userSelect.value)
            console.log(selectedUser);
            this.dispatchEvent(
                new CustomEvent("user-selected", {
                    detail: {
                        user: selectedUser,
                    }
                })
            )
        }
    }

    template() {
        return `
            <div>
                <label for="user">Active User:</label>
                <select id="user" name="user">
                </select>
            </div>
        `;
    }
}

customElements.define('user-view', UserView)