export class TitleScreen {
    constructor(socket) {
        this.socket = socket;
        this.element = null;
        this.rightSideElement = null;
    }

    getInitialOptions(resolve) {
        return [
            {
                label: "START",
                description: "Press to begin choosing which mode to play",
                handler: () => {
                    resolve();
                    this.showStartScreen(resolve);
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

    getStartOptions(resolve) {
        return [
            {
                label: "MULTIPLAYER",
                description: "Play with a friend",
                handler: () => {
                    console.log("MULTIPLAYER selected");
                    this.showMultiplayerScreen(resolve);
                }
            },
            {
                label: "SINGLE PLAYER",
                description: "Play by yourself",
                handler: () => {
                    console.log("SINGLE PLAYER selected");
                }
            },
            {
                label: "FREE CANVAS",
                description: "Draw freely",
                handler: () => {
                    console.log("FREE CANVAS selected");
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

    getMultiplayerOptions(resolve) {
        return [
            {
                label: "CREATE A ROOM",
                description: "Create a multiplayer lobby",
                handler: () => {
                    this.showUsernameInputForm(true);
                }
            },
            {
                label: "JOIN A ROOM",
                description: "Join an existing multiplayer lobby",
                handler: () => {
                    this.showJoinRoomForm();
                }
            },
            {
                label: "BACK",
                description: "Go back to the previous menu",
                handler: () => {
                    this.showStartScreen(resolve);
                },
                isBackButton: true
            }
        ];
    }

    //Creates the initial TitleScreen/Main Menu
    createElement() {
        if (this.element) {
            this.element.remove();
        }
        if (this.rightSideElement) {
            this.rightSideElement.remove();
        }

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
        image.src = this.getRandomSav();
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

    showStartScreen(resolve) {
        this.setOptions(this.getStartOptions(resolve));
    }

    showMultiplayerScreen(resolve) {
        this.setOptions(this.getMultiplayerOptions(resolve));
    }



    showTutorial() {
        //TODO: replace below with tutorial
        this.close();
        initGameRoom(this.socket,111111,"prompt",true);
    }

    
    
    //Displays the username form for the creator of the room ("CREATE A ROOM")
    showUsernameInputForm() {
        const overlay = document.createElement("div");
        overlay.classList.add('overlay-container');

        const formContainer = document.createElement("div");
        formContainer.classList.add('form-container');

        const form = document.createElement("form");
        form.id = 'usernameForm';

        const inputDiv = document.createElement("div");
        const input = document.createElement("input");
        input.id = "usernameInput";
        input.type = "text";
        input.placeholder = "Username";
        inputDiv.appendChild(input);

        const buttonDiv = document.createElement("div");
        const button = document.createElement("button");
        button.type = "submit"; // Make sure the button type is submit
        button.textContent = "Start!";
        buttonDiv.appendChild(button);

        form.appendChild(inputDiv);
        form.appendChild(buttonDiv);
        formContainer.appendChild(form);

        overlay.appendChild(formContainer);

        const backButtonDiv = document.createElement("div");
        backButtonDiv.classList.add('back-button-container');
        const backButton = document.createElement("button");
        backButton.classList.add('back-button');
        backButton.textContent = "Back";
        backButtonDiv.appendChild(backButton);

        overlay.appendChild(backButtonDiv);
        document.body.appendChild(overlay);

        // When the username form is submitted,
        document.querySelector('#usernameForm').addEventListener('submit', (event) => {
            // Makes it so that the form doesn't refresh the page (its the default behavior)
            event.preventDefault();
            const username = document.querySelector('#usernameInput').value;
            // Send the username to the backend
            this.socket.emit('initGame', username);
            // Handle the response from the backend
            this.socket.on('roomCode', (data) => {
                overlay.remove(); // Remove the overlay before showing the next screen
                this.showCreateRoomScreen(data.roomCode, data.creator);
            });
        });

        backButton.addEventListener('click', () => {
            overlay.remove();
            this.showStartScreen(() => {}); // Show the start screen again
        });
    }

    //Username and Room code entry for ("JOIN A ROOM")
    showJoinRoomForm() {
        const overlay = document.createElement("div");
        overlay.classList.add('overlay-container');

        const formContainer = document.createElement("div");
        formContainer.classList.add('form-container');

        const form = document.createElement("form");
        form.id = 'joinRoomForm';

        const inputDiv1 = document.createElement("div");
        const input1 = document.createElement("input");
        input1.id = "usernameInput";
        input1.type = "text";
        input1.placeholder = "Username";
        inputDiv1.appendChild(input1);

        const inputDiv2 = document.createElement("div");
        const input2 = document.createElement("input");
        input2.id = "roomCodeInput";
        input2.type = "text";
        input2.placeholder = "Room Code";
        inputDiv2.appendChild(input2);

        const buttonDiv = document.createElement("div");
        const button = document.createElement("button");
        button.type = "submit";
        button.textContent = "Join!";
        buttonDiv.appendChild(button);

        form.appendChild(inputDiv1);
        form.appendChild(inputDiv2);
        form.appendChild(buttonDiv);
        formContainer.appendChild(form);

        overlay.appendChild(formContainer);

        const backButtonDiv = document.createElement("div");
        backButtonDiv.classList.add('back-button-container');
        const backButton = document.createElement("button");
        backButton.classList.add('back-button');
        backButton.textContent = "Back";
        backButtonDiv.appendChild(backButton);

        overlay.appendChild(backButtonDiv);
        document.body.appendChild(overlay);

        document.querySelector('#joinRoomForm').addEventListener('submit', (event) => {
            event.preventDefault();
            const username = document.querySelector('#usernameInput').value;
            const roomCode = document.querySelector('#roomCodeInput').value;
            this.socket.emit('joinRoom', { roomCode, username });

            this.socket.on('joinSuccess', (data) => {
                overlay.remove();
                this.showJoinRoomScreen(data.roomCode, data.creator, username);
                this.socket.emit('notifyCreator', { roomCode, username });
            });

            this.socket.on('joinFailure', (message) => {
                alert(message); 
            });
        });

        backButton.addEventListener('click', () => {
            overlay.remove();
            this.showStartScreen(() => {});
        });
    }

    //Creates the waiting room for another player to join the created room
    showCreateRoomScreen(roomCode, creatorUsername) {
        // Remove any existing overlay
        const existingOverlay = document.querySelector('.overlay-container');
        if (existingOverlay) {
            existingOverlay.remove();
        }
        this.close();

        // Create a yellow overlay
        const overlay = document.createElement("div");
        overlay.classList.add('room-code-screen');

        // Create the title
        const title = document.createElement("div");
        title.classList.add('room-code-title');
        title.textContent = "Patch Partners";
        overlay.appendChild(title);

        // Create the left half for Sav and username
        const leftHalf = document.createElement("div");
        leftHalf.classList.add('left-half');

        const savImageLeft = document.createElement("img");
        savImageLeft.src = this.getRandomSav();
        savImageLeft.classList.add('sav-image');

        const usernameDivLeft = document.createElement("div");
        usernameDivLeft.classList.add('username');
        usernameDivLeft.textContent = creatorUsername;

        leftHalf.appendChild(savImageLeft);
        leftHalf.appendChild(usernameDivLeft);

        overlay.appendChild(leftHalf);

        // Create the right half container but do not display it initially
        const rightHalf = document.createElement("div");
        rightHalf.classList.add('right-half');
        rightHalf.style.display = 'none'; // Hide initially

        const savImageRight = document.createElement("img");
        savImageRight.classList.add('sav-image-right');

        const usernameDivRight = document.createElement("div");
        usernameDivRight.classList.add('username-right');

        rightHalf.appendChild(savImageRight);
        rightHalf.appendChild(usernameDivRight);

        overlay.appendChild(rightHalf);

        // Create the room code box
        const roomCodeBox = document.createElement("div");
        roomCodeBox.classList.add('room-code-box');
        roomCodeBox.textContent = `Room Code: ${roomCode}`;
        overlay.appendChild(roomCodeBox);

        // Create the start button but do not display it initially
        const startButton = document.createElement("button");
        startButton.classList.add('start-button');
        startButton.textContent = "Start!";
        startButton.style.display = 'none'; // Hide initially
        overlay.appendChild(startButton);

        document.body.appendChild(overlay);

        // Update the right half and show the start button when another player joins
        this.socket.on('playerJoined', (joinedUsername) => {
            console.log('playerJoined event received for:', joinedUsername);
            usernameDivRight.textContent = joinedUsername;
            savImageRight.src = this.getRandomSav(); // Update Sav's image for the joined player
            rightHalf.style.display = 'flex'; // Show the right half
            startButton.style.display = 'block'; // Show the start button
            startButton.disabled = false; // Enable the start button when another player joins
        });

        
        startButton.addEventListener('click', () => {
            // Notify the server to start the game
            this.socket.emit('startGame', { roomCode });
        });

        // Listen for the event to start the game on both clients
        this.socket.on('startGame', ({prompt}) => {
            this.close();
            initGameRoom(this.socket,roomCode,prompt, true);
        });
    }

    //displays the screen for after a player joins an existing room
    showJoinRoomScreen(roomCode, creatorUsername, joinerUsername) {
        // Remove any existing overlay
        const existingOverlay = document.querySelector('.overlay-container');
        if (existingOverlay) {
            existingOverlay.remove();
        }
        this.close();

        // Create a yellow overlay
        const overlay = document.createElement("div");
        overlay.classList.add('room-code-screen');

        // Create the title
        const title = document.createElement("div");
        title.classList.add('room-code-title');
        title.textContent = "Patch Partners";
        overlay.appendChild(title);

        // Create the left half for Sav and creator's username
        const leftHalf = document.createElement("div");
        leftHalf.classList.add('left-half');

        const savImageLeft = document.createElement("img");
        savImageLeft.src = this.getRandomSav();
        savImageLeft.classList.add('sav-image');

        const usernameDivLeft = document.createElement("div");
        usernameDivLeft.classList.add('username');
        usernameDivLeft.textContent = creatorUsername;

        leftHalf.appendChild(savImageLeft);
        leftHalf.appendChild(usernameDivLeft);

        overlay.appendChild(leftHalf);

        // Create the right half for Sav and joiner's username
        const rightHalf = document.createElement("div");
        rightHalf.classList.add('right-half');

        const savImageRight = document.createElement("img");
        savImageRight.src = this.getRandomSav();
        savImageRight.classList.add('sav-image-right');

        const usernameDivRight = document.createElement("div");
        usernameDivRight.classList.add('username-right');
        usernameDivRight.textContent = joinerUsername;

        rightHalf.appendChild(savImageRight);
        rightHalf.appendChild(usernameDivRight);

        overlay.appendChild(rightHalf);

        // Create the room code box
        const roomCodeBox = document.createElement("div");
        roomCodeBox.classList.add('room-code-box');
        roomCodeBox.textContent = `Room Code: ${roomCode}`;
        overlay.appendChild(roomCodeBox);

        // Append the overlay to the body
        document.body.appendChild(overlay);

        // Listen for the event to start the game on both clients
        this.socket.on('startGame', ({prompt}) => {
            this.close();
            initGameRoom(this.socket,roomCode,prompt,false);
        });
    }

    close() {
        // Remove title screen elements
        if (this.element) {
            this.element.remove();
        }
        if (this.rightSideElement) {
            this.rightSideElement.remove();
        }
    
        // Remove any overlay containers
        const overlays = document.querySelectorAll('.overlay-container, .room-code-screen');
        overlays.forEach(overlay => overlay.remove());
    
        // Remove the game container that the title screen resides in
        const gameContainer = document.querySelector(".game-container");
        if (gameContainer) {
            gameContainer.innerHTML = ""; // Clear all content inside the game container
        }
    
        // Remove any additional elements (from the waiting screen)
        const savElements = document.querySelectorAll('.sav-image, .sav-image-right, .pinkBox');
        savElements.forEach(element => element.remove());
        const roomCodeElements = document.querySelectorAll('.room-code-title, .left-half, .right-half, .room-code-box, .start-button');
        roomCodeElements.forEach(element => element.remove());
    
        // Remove the title screen itself
        const titleScreenElement = document.querySelector(".TitleScreen");
        if (titleScreenElement) {
            titleScreenElement.remove();
        }
    
       
    }
    

    getRandomSav(){
        const savAssets = [
            'https://users.csc.calpoly.edu/~amgrow/patchpals/assets/SAV_Disgust.png', //disgust
            'https://users.csc.calpoly.edu/~amgrow/patchpals/assets/SAV_Nervous.png', //disgust looking left
            'https://users.csc.calpoly.edu/~amgrow/patchpals/assets/SAV_Nervous.png', //nervous
            'https://users.csc.calpoly.edu/~amgrow/patchpals/assets/SAV_Pointing.png', //pointing left
            'https://users.csc.calpoly.edu/~amgrow/patchpals/assets/SAV_Excited.png', //excited
            'https://users.csc.calpoly.edu/~amgrow/patchpals/assets/SAV_Happy.png', //happy
            'https://users.csc.calpoly.edu/~amgrow/patchpals/assets/SAV_Smirk.png', //smirk
            'https://users.csc.calpoly.edu/~amgrow/patchpals/assets/SAV_Waving.png', //waving
            'https://users.csc.calpoly.edu/~amgrow/patchpals/assets/SAV_Sad.png', //sad
            'https://users.csc.calpoly.edu/~amgrow/patchpals/assets/SAV_Angry.png', //angry
        ];
        return savAssets[Math.floor(Math.random() * savAssets.length)];
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

