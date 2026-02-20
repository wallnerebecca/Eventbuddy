import {model} from "../model/model.js";

class UserView extends HTMLElement {

    #sortedUsers
    #activeUser
    constructor() {
        super();
        this.#sortedUsers = []
    }

    connectedCallback() {
        model.addEventListener("users-updated", e => {
            this.#sortedUsers = e.detail.users.sort((a, b) => a.name <  b.name ? -1 : (a.name > b.name) ? 1 : 0);
            this.render();
        })
        model.addEventListener("update-active-user", e => {
            this.#activeUser = e.detail.user;
            console.log(this.#activeUser)
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
        empty.selected = true;
        empty.disabled = true;

        userSelect.appendChild(empty)
        this.#sortedUsers.map((user) => {
            const option = document.createElement("option");
            option.value = user.email;
            option.text = `${user.name} (${user.email})`;
            userSelect.appendChild(option)
        })

        const button = this.querySelector("button.login");
        button.addEventListener("click", (e) => {
            const selectedUser = this.#sortedUsers.find(user => user.email === userSelect.value)
            this.dispatchEvent(
                new CustomEvent("user-login", {
                    detail: {
                        user: selectedUser,
                    }
                })
            )
        })

        const logoutButton = this.querySelector("button.logout");
        logoutButton.addEventListener("click", (e) => {
            this.dispatchEvent(
                new CustomEvent("user-logout", {})
            )
        })

        const loggedInDiv = document.querySelector(".logged-in")
        const loggedOutDiv = document.querySelector(".logged-out")

        if (this.#activeUser) {
            loggedInDiv.style.display = "block";
            loggedOutDiv.style.display = "none";

            const span = document.createElement("span")
            span.innerHTML = `
                Welcome, ${this.#activeUser.name}
            `
            span.slot = "active-user"

            loggedInDiv.prepend(span)
        } else {
            loggedInDiv.style.display = "none";
            loggedOutDiv.style.display = "block"
        }
    }

    template() {
        return `
            <div class="logged-in">
                <button class="logout bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">logout</button>
            </div>
            <div class="logged-out">
                <label for="user">User:</label>
                <select id="user" name="user">
                </select>
                <button class="login bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Login</button>
            </div>
        `;
    }
}

customElements.define('user-view', UserView)