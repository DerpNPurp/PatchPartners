function showEndScreen() {
    // Remove any existing end screen elements
    const existingEndScreen = document.getElementById('endScreen');
    if (existingEndScreen) {
        existingEndScreen.remove();
    }

    // Create the end screen container
    const endScreenDiv = document.createElement('div');
    endScreenDiv.id = 'endScreen';

    // Create the game title element
    const title = document.createElement('div');
    title.id = 'gameTitle';
    title.textContent = 'PatchPartners';

    // Create the drawing container
    const drawingDiv = document.createElement('div');
    drawingDiv.id = 'finishedDrawing';

    // Create the main menu button
    const mainMenuBtn = document.createElement('button');
    mainMenuBtn.id = 'mainMenuBtn';
    mainMenuBtn.textContent = 'Main Menu';
    mainMenuBtn.onclick = function () {
        window.location.reload(); // Reload the page to go back to the title screen
    };

    // Append the elements to the end screen container
    endScreenDiv.appendChild(title);
    endScreenDiv.appendChild(drawingDiv);
    endScreenDiv.appendChild(mainMenuBtn);

    // Append the end screen to the body
    document.body.appendChild(endScreenDiv);
}

// Export the function so it can be called from gameRoom.js
window.showEndScreen = showEndScreen;
