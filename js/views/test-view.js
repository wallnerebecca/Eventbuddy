class TestView extends HTMLElement {

    constructor() {
        super();
    }

    connectedCallback() {
        this.render();
    }

    render() {
        console.log("Rendering");
        this.innerHTML = this.template();

        const button = this.querySelector('button');
        button.onclick = (event) => {
            console.log("clicked rerender");
            this.render()
        }
    }


    greeting() {
        if (this.hasAttribute("name")) {
            return `Hi, ${this.getAttribute("name")}`;
        } else {
            return `Hi!`
        }
    }
    template() {
        return `
            <div>
                <p>${this.greeting()}</p><button>rerender</button>
            </div>
        `;
    }
}

customElements.define('test-view', TestView)