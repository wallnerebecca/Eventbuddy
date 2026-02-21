import {model} from "../model/model.js";

class FilterBar extends HTMLElement {

    #tags
    #participants

    constructor() {
        super();
        this.#tags = []
        this.#participants = []
    }

    connectedCallback() {
        model.addEventListener("tag-list-changed", e => {
            this.#tags = e.detail.tags.sort((a, b) => a.name <  b.name ? -1 : (a.name > b.name) ? 1 : 0);
            this.render();
        })
        model.addEventListener("participants-changed", e => {
            this.#participants = e.detail.participants.sort((a, b) => a.name <  b.name ? -1 : (a.name > b.name) ? 1 : 0);
            this.render();
        })
        this.render();
    }

    render() {
        this.innerHTML = this.template();

        const statusFilter = this.querySelector("#status")
        statusFilter.onchange = (e) => {
            const selectedOptions = Array.from(statusFilter.selectedOptions).map((option) => option.value)
            this.dispatchEvent(
                new CustomEvent("update-status-filter", {
                    detail: {
                        selectedOptions: selectedOptions,
                    }
                })
            );
        }

        this.updateTagFilter()
        const tagFilter = this.querySelector("#tag");
        tagFilter.onchange = (e) => {
            const selectedOptions = Array.from(tagFilter.selectedOptions).map((option) => option.value)
            this.dispatchEvent(
                new CustomEvent("update-tags-filter", {
                    detail: {
                        selectedOptions: selectedOptions,
                    }
                })
            );
        }

        this.updateParticipantFilter()
        const participantFilter = this.querySelector("#participant");
        participantFilter.onchange = (e) => {
            const selectedOptions = Array.from(participantFilter.selectedOptions).map((option) => option.value)
            this.dispatchEvent(
                new CustomEvent("update-participants-filter", {
                    detail: {
                        selectedOptions: selectedOptions,
                    }
                })
            )
        }

        const resetFilterButton = this.querySelector("button");
        resetFilterButton.addEventListener("click", (e) => {
            this.dispatchEvent(
                new CustomEvent("update-participants-filter", {
                    detail: {
                        selectedOptions: [],
                    }
                })
            )
            this.dispatchEvent(
                new CustomEvent("update-tags-filter", {
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
            this.dispatchEvent(
                new CustomEvent("update-search", {
                    bubbles: true,
                    detail: {
                        searchInput: ''
                    }
                })
            )
            this.render()
        })

        const search = this.querySelector("input.search");
        console.log(search)
        search.addEventListener("input", (e) => {
            this.dispatchEvent(
                new CustomEvent("update-search", {
                    bubbles: true,
                    detail: {
                        searchInput: search.value
                    }
                })
            )
        })

        const modalContainer = this.querySelector("#modal-container");
        const tagFilterModal = this.querySelector("#tag-filter-modal");
        const openFilterModal = this.querySelector("#open-filter-modal");

        openFilterModal.addEventListener("click", (e) => {
            modalContainer.classList.remove("hidden")
            modalContainer.classList.add("block")
        })

        window.addEventListener("click", (e) => {
            if (e.target === tagFilterModal) {
                modalContainer.classList.remove("block")
                modalContainer.classList.add("hidden")
            }
        })
    }

    updateTagFilter() {
        const select = this.querySelector("#tag")
        select.value = "";
        select.innerHTML = "";

        this.#tags.map((tag) => {
            const option = document.createElement("option");
            option.value = tag.id;
            option.text = tag.name;

            select.appendChild(option)
        });

        const searchTagList = this.querySelector("#search-tag-list");

        const search = this.querySelector("input.search-tags");
        search.addEventListener("input", (e) => {
            this.searchTagList(search.value)
        })

        this.#tags.map((tag) => {
            const element = this.dropDownElement(tag)

            const checkBox = element.querySelector("input");
            checkBox.addEventListener("change", (e) => {
                this.sendUpdatedTagFilter()
            })
            searchTagList.appendChild(element)
        })
    }

    searchTagList(name) {
        const searchTagList = this.querySelector("#search-tag-list");

        for (const tag of searchTagList.children) {
            if (tag.getAttribute("data-name").toLowerCase().includes(name.toLowerCase())) {
                tag.classList.remove("hidden");
                tag.classList.add("block")
            } else {
                tag.classList.remove("block")
                tag.classList.add("hidden");
            }
        }
    }

    sendUpdatedTagFilter() {
        const searchTagList = this.querySelector("#search-tag-list");

        const selectedOptions = []
        for (const tag of searchTagList.children) {
            const checkBox = tag.querySelector("input")

            const tagId = checkBox.getAttribute("data-id");
            const checked = checkBox.checked;

            if (checked) {
                selectedOptions.push(tagId);
            }
        }

        this.dispatchEvent(
            new CustomEvent("update-tags-filter", {
                detail: {
                    selectedOptions: selectedOptions,
                }
            })
        );

    }
    updateParticipantFilter() {
        const select = this.querySelector("#participant");
        select.value = "";
        select.innerHTML = "";

        this.#participants.map((participant) => {
            const option = document.createElement("option");
            option.value = participant.id;
            option.text = `${participant.name} (${participant.email})`;
            select.appendChild(option)
        })

        // this.dispatchEvent(
        //     new CustomEvent("update-participants-filter", {
        //         detail: {
        //             selectedOptions: select.selectedOptions,
        //         }
        //     })
        // )

    }


    dropDownElement(tag) {
        const template = document.createElement("template")
        template.innerHTML = `
            <div class="block px-4 py-2 hover:bg-rose-200 hover:text-rose-500 cursor-pointer w-full" data-name="${tag.name}">
                <div class="flex items-center gap-2"><input type="checkbox" class="w-6 h-6 rounded shrink-0" data-id="${tag.id}"><span class="truncate text-3xl">${tag.name}</span></div>
            </div>
        `;

        return template.content.cloneNode(true).firstElementChild
    }

    template() {
        return `            
            <div class="px-1 py-1 max-w-full sm:max-w-1/2 md:max-w-sm relative flex pt-10 pb-5">
                <div class="block w-7/8 pr-2">
                    <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                        <svg class="w-4 h-4 text-body" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="m21 21-3.5-3.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"/></svg>
                    </div>
                    <input type="search" class="search h-full w-full p-3 ps-9 bg-light-purple/50 rounded-full text-2xl focus:outline-none text-orange-400 placeholder:text-orange-400 [&::-webkit-search-cancel-button]:appearance-none" placeholder="Discover events"/>
                </div>
                <div id="open-filter-modal" class="max-w-1/8 aspect-square w-1/4 bg-light-purple/50 rounded-full text-2xl flex justify-center items-center"><span class="material-symbols-rounded font-bold! text-5xl!">filter_list</span></div>
            </div>
            <div id="modal-container" class="hidden">
            <div id="tag-filter-modal" class="absolute left-0 top-0 w-screen h-screen bg-black/50 z-50 sm:flex sm:justify-center pt-30 sm:pb-20">
                <div class="rounded-t-4xl max-w-xl w-full h-full bg-orange-200 sm:rounded-b-4xl p-8 flex flex-col items-center">
                    <hr class="w-6/10 h-1 mb-2 bg-purple-950">
                    <span class="text-5xl font-sigmar-one text-purple-950">Filters</span>
                    
                   <div class="relative block w-7/8">
                        <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                            <span class="material-symbols-rounded text-5xl!">search</span>
                        </div>
                        <input type="search" class="search-tags h-full w-full p-3 ps-15 bg-light-purple/50 rounded-t-4xl rounded-b-none text-2xl focus:outline-none text-orange-400 placeholder:text-orange-400 [&::-webkit-search-cancel-button]:appearance-none" placeholder="Discover Tags"/>
                    </div>
                   <div id="search-tag-list" class="h-50 overflow-y-auto w-7/8 bg-light-purple/50 rounded-b-4xl [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-rose-100 [&::-webkit-scrollbar-thumb]:bg-rose-300">
                   </div>
                   
                   
                   
                   <div class="hidden">
                    <label for="tags">Tags</label>
                    <select id="tag" name="tag" size="6" multiple>
                    </select>
                    </div>
                    
                    <div class="relative block w-7/8 pr-2">
                        <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                            <span class="material-symbols-rounded text-5xl!">search</span>
                        </div>
                        <input type="search" class="search-participants h-full w-full p-3 ps-15 bg-light-purple/50 rounded-full text-2xl focus:outline-none text-orange-400 placeholder:text-orange-400 [&::-webkit-search-cancel-button]:appearance-none" placeholder="Find Participants"/>
                    </div>
                    <label for="participant">Participant</label>
                    <select id="participant" name="participant" size="6" multiple>
                    </select>
                    
                    
                    <label for="status">Status</label>
                    <select id="status" name="status" size="1" multiple>
                        <option value="planned">Planned</option>
                        <option value="completed">Completed</option>
                    </select>
                    
                    <label for="participant">Participant</label>
                    <select id="participant" name="participant" size="1" multiple>
                    </select>
                    
                    <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Reset filters</button>
                </div>
            </div>
            </div>
        `;
    }
}

customElements.define('filter-bar', FilterBar)