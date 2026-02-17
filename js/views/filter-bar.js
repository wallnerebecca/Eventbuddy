import {model} from "../model/model.js";

class FilterBar extends HTMLElement {

    constructor() {
        super();
    }

    connectedCallback() {
        model.addEventListener("tag-list-changed", e => {
            this.updateTagFilter(e.detail)
        })
        this.render();
    }

    render() {
        this.innerHTML = this.template();

        const statusFilter = this.querySelector("#status")
        statusFilter.onchange = (e) => {
            const selectedOptions = Array.from(statusFilter.selectedOptions).map((option) => option.value)
            console.log(Array.from(statusFilter.selectedOptions).map((option) => option.value));
            this.dispatchEvent(
                new CustomEvent("update-status-filter", {
                    detail: {
                        selectedOptions: selectedOptions,
                    }
                })
            );
        }

        const tagFilter = this.querySelector("#tag");
        tagFilter.onchange = (e) => {
            const selectedOptions = Array.from(tagFilter.selectedOptions).map((option) => option.value)
            console.log(Array.from(tagFilter.selectedOptions).map((option) => option.value));
            this.dispatchEvent(
                new CustomEvent("update-tag-filter", {
                    detail: {
                        selectedOptions: selectedOptions,
                    }
                })
            );
        }
    }

    updateTagFilter(tags) {
        let select = this.querySelector("#tag")
        select.innerHTML = "";

        let sortedTags = tags.sort((a, b) => a.name <  b.name ? -1 : (a.name > b.name) ? 1 : 0);
        sortedTags.map((tag) => {
            let option = document.createElement("option");
            option.value = tag.id;
            option.text = tag.name;

            select.appendChild(option)
        });
    }

    template() {
        return `
            <label for="status">Status</label>
            <select id="status" name="status" size="1" multiple>
                <option value="planned">Planned</option>
                <option value="completed">Completed</option>
            </select>
            
            <label for="participant">Participant</label>
            <select id="participant" name="participant" size="1" multiple>
            </select>
            
            <label for="tags">Tags</label>
            <select id="tag" name="tag" size="1" multiple>
            </select>
        `;
    }
}

customElements.define('filter-bar', FilterBar)