import {model} from "../model/model.js";

class FilterBar extends HTMLElement {

    constructor() {
        super();
    }

    connectedCallback() {
        model.addEventListener("tag-list-changed", e => {
            this.updateTagFilter(e.detail)
        })
        model.addEventListener("participants-changed", e => {
            this.updateParticipantFilter(e.detail)
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

        const participantFilter = this.querySelector("#participant");
        participantFilter.onchange = (e) => {
            const selectedOptions = Array.from(participantFilter.selectedOptions).map((option) => option.value)
            console.log(Array.from(participantFilter.selectedOptions).map((option) => option.value));
            this.dispatchEvent(
                new CustomEvent("update-participant-filter", {
                    detail: {
                        selectedOptions: selectedOptions,
                    }
                })
            )
        }

        const resetFilterButton = this.querySelector("button");
        resetFilterButton.addEventListener("click", (e) => {
            this.dispatchEvent(
                new CustomEvent("update-participant-filter", {
                    detail: {
                        selectedOptions: [],
                    }
                })
            )
            this.dispatchEvent(
                new CustomEvent("update-tag-filter", {
                    detail: {
                        selectedOptions: [],
                    }
                })
            )
            this.dispatchEvent(
                new CustomEvent("update-status-filter", {
                    detail: {
                        selectedOptions: [],
                    }
                })
            );
            this.render()
        })
    }

    updateTagFilter(tags) {
        let select = this.querySelector("#tag")
        select.value = "";
        select.innerHTML = "";

        let sortedTags = tags.sort((a, b) => a.name <  b.name ? -1 : (a.name > b.name) ? 1 : 0);
        sortedTags.map((tag) => {
            let option = document.createElement("option");
            option.value = tag.id;
            option.text = tag.name;

            select.appendChild(option)
        });

        this.dispatchEvent(
            new CustomEvent("update-tag-filter", {
                detail: {
                    selectedOptions: select.selectedOptions,
                }
            })
        )
    }

    updateParticipantFilter(participants) {
        let select = this.querySelector("#participant");
        select.value = "";
        select.innerHTML = "";

        let sortedParticipants = participants.sort((a, b) => a.name <  b.name ? -1 : (a.name > b.name) ? 1 : 0);
        sortedParticipants.map((participant) => {
            let option = document.createElement("option");
            option.value = participant.email;
            option.text = `${participant.name} (${participant.email})`;
            select.appendChild(option)
        })

        this.dispatchEvent(
            new CustomEvent("update-participant-filter", {
                detail: {
                    selectedOptions: select.selectedOptions,
                }
            })
        )

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
            
            <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Reset filters</button>
        `;
    }
}

customElements.define('filter-bar', FilterBar)