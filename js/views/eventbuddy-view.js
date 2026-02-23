import {model} from "../model/model.js";

class EventBuddyView extends HTMLElement {

    constructor() {
        super();
    }

    connectedCallback() {
        this.render();
    }

    render() {
        this.innerHTML = this.template();

        const eventList = this.querySelector("event-list")
        eventList.addEventListener("active-event-changed", this.handleActiveEventChanged);

        const detailedEventView = this.querySelector("detailed-event-view");
        detailedEventView.addEventListener("cleared-active-event", this.handleClearedActiveEvent);

        const navigateHome = this.querySelector("#navigate-home");
        navigateHome.addEventListener("click", () => {
            this.showDetailedEventView(false)
            this.showAddEventOrTags(false)
            this.showFilterBarAndEventListOnSmall(true)
            this.highlightButton(navigateHome)
        })

        const navigateAdd = this.querySelector("#navigate-add");
        navigateAdd.addEventListener("click", (e) => {
            e.preventDefault();
            this.showDetailedEventView(false)
            this.showFilterBarAndEventListOnSmall(false)
            this.showAddEventOrTags(true)
            this.highlightButton(navigateAdd)
        })

        const showEventTab = this.querySelector("#show-events-tab");
        const showTagsTab = this.querySelector("#show-tags-tab");
        const showParticipantsTab = this.querySelector("#show-participants-tab");

        const eventManagement = this.querySelector("event-management");
        const tagsList = this.querySelector("tag-list");
        const participantList = this.querySelector("participant-list");

        showEventTab.addEventListener("click", (e) => {
            e.preventDefault();
            console.log("SHOW EVENT TAB")
            eventManagement.classList.remove("hidden")
            showEventTab.classList.remove("text-light-purple");
            showEventTab.classList.add("text-purple-950", "bg-light-purple");

            tagsList.classList.add("hidden")
            showTagsTab.classList.add("text-light-purple")
            showTagsTab.classList.remove("text-purple-950", "bg-light-purple");

            participantList.classList.add("hidden")
            showParticipantsTab.classList.add("text-light-purple")
            showParticipantsTab.classList.remove("text-purple-950", "bg-light-purple");
        })

        showTagsTab.addEventListener("click", (e) => {
            e.preventDefault();
            console.log("SHOW TAGS TAB")
            tagsList.classList.remove("hidden")
            showTagsTab.classList.remove("text-light-purple")
            showTagsTab.classList.add("text-purple-950", "bg-light-purple");

            eventManagement.classList.add("hidden")
            showEventTab.classList.add("text-light-purple");
            showEventTab.classList.remove("text-purple-950", "bg-light-purple");

            participantList.classList.add("hidden")
            showParticipantsTab.classList.add("text-light-purple")
            showParticipantsTab.classList.remove("text-purple-950", "bg-light-purple");
        })

        showParticipantsTab.addEventListener("click", (e) => {
            participantList.classList.remove("hidden")
            showParticipantsTab.classList.remove("text-light-purple")
            showParticipantsTab.classList.add("text-purple-950", "bg-light-purple");

            eventManagement.classList.add("hidden")
            showEventTab.classList.add("text-light-purple");
            showEventTab.classList.remove("text-purple-950", "bg-light-purple");

            tagsList.classList.add("hidden")
            showTagsTab.classList.add("text-light-purple")
            showTagsTab.classList.remove("text-purple-950", "bg-light-purple");
        })
    }

    highlightButton(button) {
        const navigateHome = this.querySelector("#navigate-home");
        const navigateSettings = this.querySelector("#navigate-settings");
        const navigateEvents = this.querySelector("#navigate-events");
        const navigateAdd = this.querySelector("#navigate-add");
        const navigateGroup = this.querySelector("#navigate-group");

        navigateHome.classList.remove("bg-orange-200")
        navigateSettings.classList.remove("bg-orange-200")
        navigateEvents.classList.remove("bg-orange-200")
        navigateAdd.classList.remove("bg-orange-200")
        navigateGroup.classList.remove("bg-orange-200")

        button.classList.add("bg-orange-200")
    }
    template() {
        return `
            <user-view class="hidden"></user-view>
            
            <div class="px-2 w-screen h-screen grid grid-cols-1 grid-rows-[auto_1fr_3.75rem] sm:grid-cols-2 md:grid-cols-[384px_1fr]">
                <filter-bar class="sm:block w-full row-start-1 row-span-1"></filter-bar>
                
                <event-list class="sm:block w-full h-full overflow-y-auto row-start-2 row-span-1 sm:row-span-2"></event-list>
                
                <detailed-event-view class="hidden row-start-1 row-span-2 sm:row-start-2 w-full h-full sm:col-start-2 pb-4 sm:pb-2"></detailed-event-view>
                
                <div id="add-event-or-tags" class="hidden row-start-1 row-span-2 sm:row-start-2 w-full h-full sm:col-start-2 pb-4 sm:pb-2">
                    <div class="h-full box-border pt-30 sm:pt-0 grid grid-rows-[auto_1fr]">
                        <div class="h-fit row-start-1 font-sigmar-one bg-purple-950 flex justify-start">
                            <div id="show-events-tab" class="w-fit px-4 h-16 text-3xl flex items-center bg-light-purple text-purple-950 rounded-t-lg">Events</div>
                            <div id="show-tags-tab" class="w-fit px-4 h-16 text-3xl flex items-center text-light-purple rounded-t-lg">Tags</div>
                            <div id="show-participants-tab" class="w-fit px-4 h-16 text-3xl flex items-center text-light-purple rounded-t-lg">Participants</div>
                        </div>
                        <div class="row-start-2 bg-light-purple rounded-tr-4xl rounded-b-4xl">
                            <event-management class="h-full"></event-management>
                            <tag-list class="hidden h-full"></tag-list>
                            <participant-list class="hidden h-full"></participant-list>
                        </div>
                    </div>
                </div>
                
                <div class="box-border row-start-3 sm:row-start-1 sm:col-start-2 col-span-1 w-full h-15 sm:flex sm:justify-end sm:items-center">
                    <div class="sm:max-w-sm pl-4 pr-4 sm:pl-1 sm:pr-1 flex justify-between">
                        <span id="navigate-home" class="p-1 rounded-full material-symbols-rounded text-5xl! bg-orange-200">home</span>
                        <span id="navigate-settings" class="p-1 rounded-full material-symbols-rounded text-5xl!">settings</span>
                        <span id="navigate-events" class="p-1 rounded-full material-symbols-rounded text-5xl!">event_note</span>
                        <span id="navigate-add" class="p-1 rounded-full material-symbols-rounded text-5xl!">add</span>
                        <span id="navigate-group" class="p-1 rounded-full material-symbols-rounded text-5xl!">group</span>
                    </div>
                </div>
            </div>
        `;
    }

    showDetailedEventView(show, eventId) {
        const detailedEventView = this.querySelector("detailed-event-view");

        if (show) {
            detailedEventView.classList.remove("hidden");
            detailedEventView.setAttribute("event-id", eventId);
        } else {
            detailedEventView.classList.add("hidden")
            detailedEventView.removeAttribute("event-id")
        }
    }

    showAddEventOrTags(show) {
        const addEventOrTags = this.querySelector("#add-event-or-tags");
        if (show) {
            addEventOrTags.classList.remove("hidden")
        } else {
            addEventOrTags.classList.add("hidden")
        }
    }

    showFilterBarAndEventListOnSmall(show) {
        const filterBar = this.querySelector("filter-bar");
        const eventList = this.querySelector("event-list");

        if (show) {
            filterBar.classList.remove("hidden");
            eventList.classList.remove("hidden");
        } else {
            filterBar.classList.add("hidden");
            eventList.classList.add("hidden");
        }
    }

    handleActiveEventChanged = (e) => {
        console.log(e)
        const eventId = e.detail.id;
        console.log(`Event Id: ${eventId}`);

        this.showFilterBarAndEventListOnSmall(false)
        this.showAddEventOrTags(false)
        this.showDetailedEventView(true, eventId)
        this.highlightButton(this.querySelector("#navigate-home"));
    }

    handleClearedActiveEvent = (e) => {
        this.showFilterBarAndEventListOnSmall(true)

        this.showDetailedEventView(false)
        this.highlightButton(this.querySelector("#navigate-home"));
    }
}

customElements.define('event-buddy', EventBuddyView);