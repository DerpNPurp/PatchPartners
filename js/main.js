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