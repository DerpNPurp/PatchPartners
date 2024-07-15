export class TitleScreen {
    constructor() {}

    // Promise and resolution for the options
    
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
        // Initialize the left half of the title screen
        this.element = document.createElement("div");
        this.element.classList.add("TitleScreen");

        //Create the Title Text
        const title = document.createElement("div");
        title.classList.add("title");
        title.textContent = "Patch Partners";
        this.element.appendChild(title);

        //Create Options container
        this.optionsContainer = document.createElement("div");
        this.optionsContainer.classList.add("options");
        this.element.appendChild(this.optionsContainer);

        // Create the right side container
        this.rightSideElement = document.createElement("div");
        this.rightSideElement.classList.add("RightSide");

        // Create the pastel pink box for the images
        const pinkBox = document.createElement("div");
        pinkBox.classList.add("pinkBox");

        // Create the image element and append it to the pink box
        const image = document.createElement("img");
        image.src = "https://cdn.discordapp.com/attachments/1052518044464848958/1261188292779577415/image.png?ex=66920ca0&is=6690bb20&hm=9d3573d3f9cdf0b6a32ce29c06122a51f2e7136ebec1a55a0c130a30130600e9&";
        pinkBox.appendChild(image);

        this.rightSideElement.appendChild(pinkBox);
    }

    //Set up all the buttons/options
    setOptions(options) {
        this.optionsContainer.innerHTML = ""; // Clear existing options

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

    //Temp function that shows you what option you chose
    showMessage(message) {
        this.clearRightSide();
        const messageElement = document.createElement("div");
        messageElement.textContent = message;
        this.rightSideElement.appendChild(messageElement);
    }

    //Temp function that shows you what option you chose
    showTutorial() {
        this.close();

        const container = document.querySelector(".game-container");
        container.remove();
        
        initGameRoom();
        document.head.appendChild(script);
    }

    clearRightSide() {
        const pinkBox = this.rightSideElement.querySelector(".pinkBox");
        pinkBox.remove();
        
    }

    close() {
        this.element.remove();
        this.rightSideElement.remove();
    }

    init(container) {
        initGameRoom();
        document.head.appendChild(script);
        return new Promise(resolve => {
            this.createElement();
            container.appendChild(this.element);
            container.appendChild(this.rightSideElement);
            this.showInitialScreen(resolve);
        });
    }
}
