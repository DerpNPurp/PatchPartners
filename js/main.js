if (!window.FileReader) {
    message = '<p>The ' +
            '<a href="http://dev.w3.org/2006/webapi/FileAPI/" target="_blank">File API</a>s ' +
            'are not fully supported by this browser.</p>' +
            '<p>Upgrade your browser to the latest version.</p>';

    document.querySelector('body').innerHTML = message;
} else {
    // Import the gameRoom.js file
    document.write('<script src="gameRoom.js"></script>');
}

// $(document).ready(function() {
//     try {
//         // Import the rest of the functions
//         initErrorHandler();
//         initHistoryHandler();
//         initCanvas(); // also initializes canvasHandler
//         initDesignGenerator();
//         initDesignHandler();
//         initNoise(Math.random());
        
//         initilizeMenus(); // in guiHandler.js 
//         // ^ !! NOTE !! Must be called after DesignHandler as it uses a function in the global.mainDesignHandler
        
//         // Move the menus over... need to also update this on resize...
//         updateMenuPositions();
        
//         initKeys();
        
//         console.log("ready!");
//     } catch (e){
//         global.mainErrorHandler.displayError("catastrophic failure -- initialization failed", e);
//     }
// });