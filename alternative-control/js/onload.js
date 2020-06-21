document.addEventListener("DOMContentLoaded",
    function(event) {
        var onLoad = {}; //Onload namespace

        var canvas = document.getElementById("game-area");
        onLoad.canvas = canvas;
        window.onLoad = onLoad;
        script();

    }
);
