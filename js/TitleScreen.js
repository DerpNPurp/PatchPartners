export class TitleScreen {
    constructor() {}

    getInitialOptions(resolve) {
        return [
            {
                label: "START",
                description: "Press to begin choosing which mode to play",
                handler: () => {
                    this.showNextScreen(resolve);
                }
            },
            {
                label: "TUTORIAL",
                description: "Press to view the tutorial",
                handler: () => {
                    resolve();
                    this.showTutorial();
                }
            }
        ];
    }

    getNextOptions(resolve) {
        return [
            {
                label: "MULTIPLAYER",
                description: "Play with a friend",
                handler: () => {
                    console.log("MULTIPLAYER selected");
                    this.showMessage("MULTIPLAYER selected");
                }
            },
            {
                label: "SINGLE PLAYER",
                description: "Play by yourself",
                handler: () => {
                    console.log("SINGLE PLAYER selected");
                    this.showMessage("SINGLE PLAYER selected");
                }
            },
            {
                label: "FREE CANVAS",
                description: "Draw freely",
                handler: () => {
                    console.log("FREE CANVAS selected");
                    this.showMessage("FREE CANVAS selected");
                }
            },
            {
                label: "BACK",
                description: "Go back to the main menu",
                handler: () => {
                    this.showInitialScreen(resolve);
                },
                isBackButton: true
            }
        ];
    }

    createElement() {
        this.element = document.createElement("div");
        this.element.classList.add("TitleScreen");

        const title = document.createElement("div");
        title.classList.add("title");
        title.textContent = "Patch Partners";
        this.element.appendChild(title);

        this.optionsContainer = document.createElement("div");
        this.optionsContainer.classList.add("options");
        this.element.appendChild(this.optionsContainer);

        this.rightSideElement = document.createElement("div");
        this.rightSideElement.classList.add("RightSide");

        const pinkBox = document.createElement("div");
        pinkBox.classList.add("pinkBox");

        const image = document.createElement("img");
        image.src = "https://cdn.discordapp.com/attachments/1052518044464848958/1261188292779577415/image.png?ex=66920ca0&is=6690bb20&hm=9d3573d3f9cdf0b6a32ce29c06122a51f2e7136ebec1a55a0c130a30130600e9&";
        pinkBox.appendChild(image);

        this.rightSideElement.appendChild(pinkBox);
    }

    setOptions(options) {
        this.optionsContainer.innerHTML = "";

        options.forEach(option => {
            const optionElement = document.createElement("div");
            optionElement.classList.add("option");
            if (option.isBackButton) {
                optionElement.classList.add("back-button");
            }
            optionElement.textContent = option.label;
            optionElement.addEventListener("click", option.handler);
            this.optionsContainer.appendChild(optionElement);
        });
    }

    showInitialScreen(resolve) {
        this.setOptions(this.getInitialOptions(resolve));
    }

    showNextScreen(resolve) {
        this.setOptions(this.getNextOptions(resolve));
    }

    showMessage(message) {
        this.clearRightSide();
        const messageElement = document.createElement("div");
        messageElement.textContent = message;
        this.rightSideElement.appendChild(messageElement);
    }

    showTutorial() {
        this.close();
        initGameRoom();
    }

    clearRightSide() {
        const pinkBox = this.rightSideElement.querySelector(".pinkBox");
        if (pinkBox) {
            pinkBox.remove();
        }
    }

    close() {
        const container = document.querySelector(".game-container");
        container.remove();
        this.element.remove();
        this.rightSideElement.remove();

    }

    init(container) {
        return new Promise(resolve => {
            this.createElement();
            container.appendChild(this.element);
            container.appendChild(this.rightSideElement);
            this.showInitialScreen(resolve);
        });
    }
}
