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

        const deleteButton = this.querySelector(`button.delete-tag`)
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

    get editButton() {
        return this.querySelector("button.edit-tag");
    }

    template() {
        return `
            <span class="rounded-full bg-orange-200 py-2 px-4 text-purple-950 text-2xl flex items-center">
                <span>${this.#tag.name}</span> <button type="button" class="edit-tag cursor-pointer material-symbols-rounded z-10">edit</button><button type="button" class="delete-tag cursor-pointer material-symbols-rounded z-10">close</button>
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
        this.innerHTML = this.template();
        const tagList = this.querySelector("#all-tags-list");
        const editTagForm = this.querySelector("#edit-tag-form");

        const addTagSection = this.querySelector("#add-tag-section");
        const editTagSection = this.querySelector("#edit-tag-section");
        const cancelEditButton = editTagSection.querySelector(".cancel-tag-edit");

        this.#tags.map(tag => {
            const tagItem = this.tagItem(tag)
            tagItem.setAttribute("data-name", tag.name)

            tagList.appendChild(tagItem)

            tagItem.editButton.addEventListener("click", ()=> {
                addTagSection.classList.add("hidden")
                editTagSection.classList.remove("hidden")

                editTagForm.setAttribute("data-id", tag.id)
                editTagForm.querySelector("#edittagname").placeholder = tag.name;
            })

        });

        cancelEditButton.addEventListener("click", ()=> {
            addTagSection.classList.remove("hidden")
            editTagSection.classList.add("hidden")
            editTagForm.removeAttribute("data-id");
            editTagForm.querySelector("#edittagname").placeholder = "";
        })

        const searchTags = this.querySelector(".search-tags")
        searchTags.addEventListener("input", e => {
            this.searchTagList(searchTags.value)
        })
        // container.appendChild(this.createTagForm().conten
        this.querySelector("#add-tag-form").addEventListener("submit", e => {
            e.preventDefault();
            const formData = new FormData(e.target);
            this.dispatchEvent(new CustomEvent("add-tag", {
                detail: {
                    tagName: formData.get("name")
                }
            }))
        })

        editTagForm.addEventListener("submit", e => {
            e.preventDefault();
            const formData = new FormData(e.target);
            this.dispatchEvent(new CustomEvent("edit-tag", {
                detail: {
                    tagId: editTagForm.getAttribute("data-id"),
                    tagName: formData.get("name")
                }
            }))
        })
    }

    searchTagList(name) {
        const tagList = this.querySelector("#all-tags-list");

        for (const tag of tagList.children) {
            if (tag.getAttribute("data-name").toLowerCase().includes(name.toLowerCase())) {
                tag.classList.remove("hidden");
                tag.classList.add("block")
            } else {
                tag.classList.remove("block")
                tag.classList.add("hidden");
            }
        }
    }
    template() {
        return `
            <div id="manage-tags" class="p-2 text-2xl h-full flex flex-col text-white">
                <div class="grow h-0 overflow-y-auto">
                    <div class="font-sigmar-one text-3xl">Tags:</div>
                    <div class="px-1 py-1 relative flex">
                        <div class="relative block w-fit pr-2">
                            <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                                <span class="material-symbols-rounded text-purple-950 text-5xl!">search</span>
                            </div>
                            <input type="search" class="search-tags h-full w-full p-3 ps-15 bg-orange-200 rounded-full text-2xl focus:outline-none text-purple-950 placeholder:text-purple-950 [&::-webkit-search-cancel-button]:appearance-none" placeholder="Filter tags..."/>
                        </div>
                    </div>
                    <div id="all-tags-list" class="h-fit py-4 flex gap-1 flex-wrap">
                    
                    </div>              
                </div>      
                <div class="grow h-0 overflow-y-auto">
                    <div id="add-tag-section">
                        <div class="font-sigmar-one text-3xl">Add Tag:</div>
                        <form id="add-tag-form" action="#">
                            <label for="tagname" class="mb-2" >Name:</label><br>
                            <input id="tagname" name="name" type="text" class="rounded-full px-4 bg-orange-200 text-purple-950  py-2 mb-3" required><br>
    
                            <button type="submit" class="self-center mt-2 p-2 rounded-full text-orange-400 bg-purple-950"><span class="text-2xl font-sigmar-one">Add Tag</span></button>
                        </form>   
                    </div>
                    <div id="edit-tag-section" class="hidden">
                        <div class="font-sigmar-one text-3xl">Edit Tag:</div>
                        <form id="edit-tag-form" action="#">
                            <label for="edittagname" class="mb-2" >Name:</label><br>
                            <input id="edittagname" name="name" type="text" class="rounded-full px-4 bg-orange-200 text-purple-950  py-2 mb-3" required><br>
    
                            <button type="submit" class="self-center mt-2 p-2 rounded-full text-orange-400 bg-purple-950"><span class="text-2xl font-sigmar-one">Edit Tag</span></button>
                            <button type="button" class="cancel-tag-edit self-center mt-2 p-2 rounded-full text-orange-400 bg-purple-950"><span class="text-2xl font-sigmar-one">Cancel</span></button>
                        </form>   
                    </div>
                </div>
            </div>
        `
    }


    tagItem(tag) {
        const tagItem = document.createElement("tag-item");
        tagItem.tag = tag;
        return tagItem
    }



}

customElements.define('tag-list', TagList)