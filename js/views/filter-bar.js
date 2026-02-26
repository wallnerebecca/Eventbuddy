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

        this.updateTagFilter()
        this.updateParticipantFilter()
        this.updateStatusFilter()

        const resetFilterButton = this.querySelector("#reset-filters-button");
        resetFilterButton.addEventListener("click", (e) => {
            this.dispatchEvent(
                new CustomEvent("update-participants-filter", {
                    bubbles: true,
                    detail: {
                        selectedOptions: [],
                    }
                })
            )
            this.dispatchEvent(
                new CustomEvent("update-tags-filter", {
                    bubbles: true,
                    detail: {
                        selectedOptions: [],
                    }
                })
            )
            this.dispatchEvent(
                new CustomEvent("update-status-filter", {
                    bubbles: true,
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

        const closeFilterModalButton = this.querySelector("#close-filter-modal-button");
        closeFilterModalButton.addEventListener("click", (e) => {
            modalContainer.classList.remove("block")
            modalContainer.classList.add("hidden")


            const searchTags = this.querySelector("input.search-tags");
            searchTags.value = '';
            this.searchTagList('')

            const searchParticipants = this.querySelector("input.search-participants");
            searchParticipants.value = '';
            this.searchParticipantList('')
        })
    }

    updateTagFilter() {
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
        const searchParticipantList = this.querySelector("#search-participant-list");

        const search = this.querySelector("input.search-participants");
        search.addEventListener("input", (e) => {
            this.searchParticipantList(search.value)
        })

        this.#participants.map((participant) => {
            const element = this.dropDownElement(participant)

            const checkBox = element.querySelector("input");
            checkBox.addEventListener("change", (e) => {
                this.sendUpdatedParticipantFilter()
            })
            searchParticipantList.appendChild(element)
        })
    }

    searchParticipantList(name) {
        const searchParticipantList = this.querySelector("#search-participant-list");

        for (const participant of searchParticipantList.children) {
            if (participant.getAttribute("data-name").toLowerCase().includes(name.toLowerCase())) {
                participant.classList.remove("hidden");
                participant.classList.add("block")
            } else {
                participant.classList.remove("block")
                participant.classList.add("hidden");
            }
        }
    }

    sendUpdatedParticipantFilter() {
        const searchParticipantList = this.querySelector("#search-participant-list");

        const selectedOptions = []
        for (const tag of searchParticipantList.children) {
            const checkBox = tag.querySelector("input")

            const participantId = checkBox.getAttribute("data-id");
            const checked = checkBox.checked;

            if (checked) {
                selectedOptions.push(participantId);
            }
        }

        this.dispatchEvent(
            new CustomEvent("update-participants-filter", {
                detail: {
                    selectedOptions: selectedOptions,
                }
            })
        );

    }

    updateStatusFilter() {
        const statusPlanned = this.querySelector("#status-planned");
        statusPlanned.checked = false;

        statusPlanned.addEventListener("click", (e) => {
            if (statusPlanned.checked) {
                statusPlanned.checked = false;
                statusPlanned.classList.remove("font-bold", "border-green-400");
                statusPlanned.classList.add("border-green-200");
            } else {
                statusPlanned.checked = true
                statusPlanned.classList.remove("border-green-200");
                statusPlanned.classList.add("font-bold", "border-green-400");
            }
            this.sendUpdatedStatusFilter()
        })

        const statusCompleted = this.querySelector("#status-completed");
        statusCompleted.checked = false;

        statusCompleted.addEventListener("click", (e) => {
            if (statusCompleted.checked) {
                statusCompleted.checked = false;
                statusCompleted.classList.remove("font-bold", "border-orange-400");
                statusCompleted.classList.add("border-orange-300");
            } else {
                statusCompleted.checked = true;
                statusCompleted.classList.remove("border-orange-300");
                statusCompleted.classList.add("font-bold", "border-orange-400");
            }
            this.sendUpdatedStatusFilter()
        })
    }

    sendUpdatedStatusFilter() {
        const statusFilters = this.querySelector("#status-filters");

        const selectedOptions = []
        for (const status of statusFilters.children) {
            if (status.checked) {
                selectedOptions.push(status.getAttribute("data-value"));
            }
        }

        this.dispatchEvent(
            new CustomEvent("update-status-filter", {
                detail: {
                    selectedOptions: selectedOptions,
                }
            })
        );

    }
    dropDownElement(tag) {
        const template = document.createElement("template")
        template.innerHTML = `
            <div class="block px-4 py-2 hover:bg-light-purple/30 cursor-pointer w-full" data-name="${tag.name}">
                <div class="flex items-center gap-2"><input type="checkbox" class="w-6 h-6 rounded shrink-0" data-id="${tag.id}"><span class="truncate text-3xl">${tag.name}</span></div>
            </div>
        `;

        return template.content.cloneNode(true).firstElementChild
    }

    template() {
        return `            
            <div class="px-1 py-1 relative flex pt-10 pb-5">
                <div class="relative block box-border w-7/8 pr-2">
                    <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                        <span class="material-symbols-rounded text-5xl!">search</span>
                    </div>
                    <input type="search" class="search h-full w-full p-3 ps-15 bg-light-purple/50 rounded-full text-2xl focus:outline-none text-orange-400 placeholder:text-orange-400 [&::-webkit-search-cancel-button]:appearance-none" placeholder="Discover events"/>
                </div>
                <div id="open-filter-modal" class="box-border max-w-1/4 w-1/8 text-2xl flex justify-center items-center"><span class="material-symbols-rounded aspect-square bg-light-purple/50 rounded-full font-bold! text-5xl!">filter_list</span></div>
            </div>
            <div id="modal-container" class="hidden">
                <div id="tag-filter-modal" class="absolute left-0 top-0 w-screen text-purple-950 h-screen bg-black/50 z-50 sm:flex sm:justify-center pt-30 sm:pb-20">
                    <div class="rounded-t-4xl max-w-xl w-full h-full bg-[#FFD6A7] sm:rounded-b-4xl p-8 flex flex-col items-center">
                        <hr class="w-6/10 h-1 mb-2 bg-purple-950">
                        <span class="text-5xl font-sigmar-one pb-8">Filters</span>
                        
                        <div class="pb-8 w-7/8">
                        <div class="relative block w-full">
                            <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                                <span class="material-symbols-rounded text-5xl!">search</span>
                            </div>
                            <input type="search" class="search-tags h-full w-full p-3 ps-15 bg-light-purple/50 rounded-t-4xl rounded-b-none text-2xl focus:outline-none placeholder:text-purple-950 [&::-webkit-search-cancel-button]:appearance-none" placeholder="Discover Tags..."/>
                        </div>
                        <div id="search-tag-list" class="h-50 overflow-y-auto w-full bg-light-purple/50 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300">
                        </div>
                        <div class="w-full rounded-b-4xl h-8 bg-light-purple/50"></div>
                        </div>
                        
                        <div class="pb-8 w-7/8">
                        <div class="relative block w-full">
                            <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                                <span class="material-symbols-rounded text-5xl!">search</span>
                            </div>
                            <input type="search" class="search-participants h-full w-full p-3 ps-15 bg-light-purple/50 rounded-t-4xl rounded-b-none text-2xl focus:outline-none  placeholder:text-purple-950 [&::-webkit-search-cancel-button]:appearance-none" placeholder="Find Participants..."/>
                        </div>
                        <div id="search-participant-list" class="h-50 overflow-y-auto w-full bg-light-purple/50 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300">
                        </div>
                        <div class="w-full rounded-b-4xl h-8 bg-light-purple/50"></div>
                        </div>
                       
                        <div id="status-filters" class="pb-8 w-7/8 flex">
                            <div data-value="planned" id="status-planned" class="w-1/2 h-15 text-center rounded-l-full border-4 border-solid border-green-200 bg-green-200 flex items-center justify-center text-2xl">Planned</div><div data-value="completed" id="status-completed" class="w-1/2 h-15 text-center rounded-r-full border-4 border-solid border-orange-300  bg-orange-300  flex items-center justify-center text-2xl">Completed</div>
                        </div>
                            
                        <div class="w-7/8 flex justify-between">
                            <button id="reset-filters-button" class="aspect-square p-2 bg-light-purple/50 rounded-full flex justify-center items-center"><span class="material-symbols-rounded font-bold! text-5xl!">filter_list_off</span></button>
                            <button id="close-filter-modal-button" class="p-2 pl-4 pr-4 bg-purple-950 text-orange-400 rounded-full flex justify-center items-center"><span class="font-sigmar-one text-2xl">Back</span></button>
                        </div>    
                        
                    </div>
                </div>
            </div>
        `;
    }
}

customElements.define('filter-bar', FilterBar)