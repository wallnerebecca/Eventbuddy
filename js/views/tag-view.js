import {model} from "../model/model.js";

class TagItem extends HTMLElement {

    #tag

    constructor() {
        super();
    }

    set tag(tag) {
        this.#tag = tag;
    }

    connectedCallback() {
        this.render();
    }

    render() {
        this.innerHTML = this.template();

        const tagList = document.querySelector("tag-list");

        const deleteButton = this.querySelector(`button`)
        deleteButton.addEventListener("click", ()=> {
            tagList.dispatchEvent(
                new CustomEvent("delete-tag", {
                    detail: {
                        tagId: this.#tag.id
                    }
                })
            )
        });
    }

    template() {
        return `
            <span class="inline bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline">
                ${this.#tag.name} <button class="cursor-pointer z-10">&times;</button>
            </span>
        `
    }

}

customElements.define('tag-item', TagItem);

class TagList extends HTMLElement {

    #tags

    constructor() {
        super();
        this.#tags = [];
        model.addEventListener("tag-list-changed", (event) => {
            this.#tags = event.detail.tags;
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
        this.#tags.map(tag => {
            container.appendChild(this.tagItem(tag))
        });

        container.appendChild(this.createTagForm().content)

        container.querySelector("#add-tag-form").addEventListener("submit", e => {
            e.preventDefault();
            const formData = new FormData(e.target);
            this.dispatchEvent(new CustomEvent("add-tag", {
                detail: {
                    tagName: formData.get("name")
                }
            }))
        })
        this.appendChild(container)
    }

    header() {
        const header = document.createElement("template");
        header.innerHTML = `
            <h1 class="text-2xl underline">Tag Management:</h1>
            <h2 class="text-xl font-bold py-2">Tags:</h2>
        `;

        return header;
    }

    createTagForm() {
        const tagForm = document.createElement("template");
        tagForm.innerHTML = `
            <h2 class="text-xl font-bold py-2">Add Tag:</h2>
            <form id="add-tag-form" action="#">
                <label for="name" class="mb-2" >Name:</label><br>
                <input id="name" name="name" type="text" class="border shadow py-2 mb-3" required><br>

                <button id="add-tag" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">Add tag</button>
            </form>
        `

        return tagForm;
    }

    tagItem(tag) {
        const tagItem = document.createElement("tag-item");
        tagItem.tag = tag;
        return tagItem
    }



}

customElements.define('tag-list', TagList)