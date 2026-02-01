import {model} from "./model/model.js";
import Event from "./model/event.js";
class Controller {
    constructor(){
    }

    // insertExternalMessage(text,senderId,receiverId){
    //     model.insertMessage(text,senderId,receiverId);
    // }

    init(){
        // document.querySelector("contact-list").addEventListener("change-contact", (e) => {
        //     TODO
        // });
        //
        // document.querySelector(".composer__send").onclick = (e) => {
        //
        // };

        let form = document.getElementById("create-event-form");
        form.addEventListener("submit", function (e) {
            e.preventDefault();
            let formData = new FormData(e.target)
            let event = new Event({
                id: '2',
                name: formData.get('name'),
                description: formData.get('description')
            })
            model.addEvent(event)
        });

    }
}

export const controller = new Controller();