import { TitleScreen } from './TitleScreen.js';

class Game {
    async init() {
        const socket = io();

        // Create and append the game container to the body
        var container = document.createElement('div');
        container.classList.add('game-container');
        document.body.appendChild(container);

        // Initialize the title screen and pass the socket instance
        this.titleScreen = new TitleScreen(socket);
        await this.titleScreen.init(container);

        const frontEndPlayers = {};
        
        socket.on('updatePlayers', (backendPlayers) => {
            for (const id in backendPlayers) {
                const backendPlayer = backendPlayers[id];
                if (!frontEndPlayers[id]) {
                    frontEndPlayers[id] = 'temp';
                }
            }

            for (const id in frontEndPlayers) {
                if (!backendPlayers[id]) {
                    delete frontEndPlayers[id];
                }
            }

            console.log(frontEndPlayers);
        });
    }
}

// Check if the browser supports the File API
if (!window.FileReader) {
    const message = '<p>The ' +
        '<a href="http://dev.w3.org/2006/webapi/FileAPI/" target="_blank">File API</a>s ' +
        'are not fully supported by this browser.</p>' +
        '<p>Upgrade your browser to the latest version.</p>';

    document.querySelector('body').innerHTML = message;
} else {
    // Initialize and start the game
    const game = new Game();
    game.init();
}
