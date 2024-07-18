import { TitleScreen } from './TitleScreen.js';

class Game {
    
    async init() {
        const socket = io();

		var container = document.createElement('div');
		container.classList.add('game-container');
		document.body.appendChild(container);


        // const container = document.querySelector(".game-container");
        this.titleScreen = new TitleScreen();
        await this.titleScreen.init(container);
		
		
    }
}


if (!window.FileReader) {
    var message = '<p>The ' +
        '<a href="http://dev.w3.org/2006/webapi/FileAPI/" target="_blank">File API</a>s ' +
        'are not fully supported by this browser.</p>' +
        '<p>Upgrade your browser to the latest version.</p>';

    document.querySelector('body').innerHTML = message;
} else {
    
	const game = new Game();
	game.init();

	// initGameRoom();
    // document.head.appendChild(script);
}
